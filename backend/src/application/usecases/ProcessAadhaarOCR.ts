import { Aadhaar } from '../../domain/entities/Aadhaar';
import { IAadhaarRepository } from '../../domain/repositories/IAadhaarRepository';
import { IOCRService } from '../services/IOCRService';
import { IAadhaarParser } from '../services/IAadhaarParser';
import { IProcessAadhaarOCR } from './IProcessAadhaarOCR';

export class ProcessAadhaarOCR implements IProcessAadhaarOCR {
  constructor(
    private readonly _ocrService: IOCRService,
    private readonly _repository: IAadhaarRepository,
    private readonly _parserService: IAadhaarParser
  ) {}

  public async execute(
    frontImage: Buffer,
    backImage: Buffer,
    frontMimeType: string,
    backMimeType: string
  ): Promise<Aadhaar> {
    const rawTextFront = await this._ocrService.performOCR(frontImage);
    const rawTextBack  = await this._ocrService.performOCR(backImage);

    // 1. Redact the Aadhaar Number locally first to preserve PII data privacy
    const { redactedFront, redactedBack, aadhaarNumber } = this._redactAadhaar(
      rawTextFront,
      rawTextBack
    );

    console.log(`[Local Redactor] Extracted Aadhaar Number: ${aadhaarNumber !== 'Not Found' ? 'Found (Redacted locally)' : 'Not Found'}`);

    // 2. Pass the redacted text to the external LLM parser
    const parsedData = await this._parserService.parseText(redactedFront, redactedBack);

    // 3. Merge the locally extracted Aadhaar number back into the parsed details
    if (aadhaarNumber !== 'Not Found') {
      parsedData.aadhaarNumber = aadhaarNumber;
    }

    // 4. If Groq could not determine the name, fall back to local extraction
    if (!parsedData.name || parsedData.name === 'Not Found') {
      const localName = this._extractNameFromOCR(rawTextFront);
      console.log(`[Local Name Extractor] Fallback name: "${localName}"`);
      parsedData.name = localName;
    }

    // 5. If Groq could not determine the gender, fall back to local extraction/inference
    if (!parsedData.gender || parsedData.gender === 'Not Found') {
      const localGender = this._extractGenderFromOCR(rawTextFront, rawTextBack);
      console.log(`[Local Gender Extractor] Fallback gender: "${localGender}"`);
      parsedData.gender = localGender;
    }

    const frontBase64 = `data:${frontMimeType};base64,${frontImage.toString('base64')}`;
    const backBase64  = `data:${backMimeType};base64,${backImage.toString('base64')}`;

    const aadhaar = new Aadhaar(
      undefined,
      parsedData.aadhaarNumber,
      parsedData.name,
      parsedData.dob,
      parsedData.gender,
      parsedData.address,
      parsedData.pincode,
      frontBase64,
      backBase64,
      rawTextFront,
      rawTextBack
    );

    return this._repository.save(aadhaar);
  }

  /**
   * Deterministically extract the cardholder name from the raw front OCR text.
   *
   * Strategy: On a bilingual Aadhaar card the holder's name is printed twice —
   * once in a regional script (e.g. Malayalam) and immediately below in English
   * (Latin A-Z). We scan every line of the front text and pick the first line
   * that:
   *   • Is composed entirely of Latin letters and spaces/dots/hyphens
   *   • Is NOT a known UIDAI header / boilerplate phrase
   *   • Contains 1–6 words (typical name length)
   *   • Every word starts with an uppercase letter (names are printed in title
   *     case or ALL CAPS on the card)
   */
  private _extractNameFromOCR(frontText: string): string {
    // Boilerplate lines to skip (case-insensitive)
    const skipPatterns: RegExp[] = [
      /government\s+of\s+india/i,
      /unique\s+identification/i,
      /uidai/i,
      /aadhaar/i,
      /aadhar/i,
      /enrolment/i,
      /enrollment/i,
      /www\./i,
      /help\s*line/i,
      /toll\s*free/i,
      /date\s+of\s+birth/i,
      /year\s+of\s+birth/i,
      /^\s*dob\s*:/i,
      /male/i,
      /female/i,
      /transgender/i,
      /address/i,
      /village/i,
      /district/i,
      /state/i,
      /india/i,
    ];

    const lines = frontText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length >= 3);

    for (const line of lines) {
      // Strip leading non-alpha characters (OCR noise like numbers, symbols, brackets)
      const cleaned = line.replace(/^[^A-Za-z]+/, '').trim();
      if (cleaned.length < 3) continue;

      // Must contain ONLY Latin letters, spaces, dots, hyphens, apostrophes
      if (!/^[A-Za-z][A-Za-z\s.\-']*$/.test(cleaned)) continue;

      // Skip boilerplate
      if (skipPatterns.some((p) => p.test(cleaned))) continue;

      // Must have between 1 and 6 words
      const words = cleaned.split(/\s+/).filter((w) => w.length > 0);
      if (words.length < 1 || words.length > 6) continue;

      // Each word must be at least 1 character (allows single-letter initials like "K")
      if (words.some((w) => w.length < 1)) continue;

      // ALL words must start with an uppercase letter — rejects garbled fragments like "HR wa"
      if (!words.every((w) => /^[A-Z]/.test(w))) continue;

      // At least one word must be 2+ chars (avoids single-letter-only lines)
      if (!words.some((w) => w.length >= 2)) continue;

      console.log(`[Local Name Extractor] Candidate line: "${cleaned}"`);
      return cleaned;
    }

    return 'Not Found';
  }

  /**
   * Helper to identify, extract, and replace all instances of the 12-digit Aadhaar number
   * with a placeholder ([REDACTED_AADHAAR_NUMBER]) from both front and back text.
   */
  private _redactAadhaar(
    frontText: string,
    backText: string
  ): { redactedFront: string; redactedBack: string; aadhaarNumber: string } {
    const numPatterns: RegExp[] = [
      /\b(\d{4}\s\d{4}\s\d{4})\b/,
      /\b(\d{4}-\d{4}-\d{4})\b/,
      /\b(\d{12})\b/,
    ];

    let aadhaarNumber = 'Not Found';
    let redactedFront = frontText;
    let redactedBack = backText;

    // Find the number in front text or back text
    for (const pat of numPatterns) {
      const frontMatch = frontText.match(pat);
      if (frontMatch) {
        const matchedStr = frontMatch[1];
        aadhaarNumber = matchedStr.replace(/[\s-]/g, '');
        break;
      }

      const backMatch = backText.match(pat);
      if (backMatch) {
        const matchedStr = backMatch[1];
        aadhaarNumber = matchedStr.replace(/[\s-]/g, '');
        break;
      }
    }

    // If found, replace all occurrences in both texts with the placeholder
    if (aadhaarNumber !== 'Not Found') {
      const part1 = aadhaarNumber.substring(0, 4);
      const part2 = aadhaarNumber.substring(4, 8);
      const part3 = aadhaarNumber.substring(8, 12);

      const patternsToRedact = [
        aadhaarNumber,
        `${part1} ${part2} ${part3}`,
        `${part1}-${part2}-${part3}`,
      ];

      for (const p of patternsToRedact) {
        const regex = new RegExp(p, 'g');
        redactedFront = redactedFront.replace(regex, '[REDACTED_AADHAAR_NUMBER]');
        redactedBack = redactedBack.replace(regex, '[REDACTED_AADHAAR_NUMBER]');
      }
    }

    return { redactedFront, redactedBack, aadhaarNumber };
  }

  /**
   * Deterministically extract or infer gender from OCR texts if not parsed successfully by the LLM.
   */
  private _extractGenderFromOCR(frontText: string, backText: string): string {
    const combinedText = (frontText + ' ' + backText).toLowerCase();

    // 1. Look for explicit mentions of MALE / FEMALE / TRANSGENDER first
    // Note: order is important (check female and transgender first to avoid partial matches)
    if (combinedText.includes('female') || combinedText.includes('സ്ത്രീ') || combinedText.includes('महिला')) {
      return 'FEMALE';
    }
    if (combinedText.includes('transgender')) {
      return 'TRANSGENDER';
    }
    if (combinedText.includes('male') || combinedText.includes('പുരുഷൻ') || combinedText.includes('പുരുഷ൯') || combinedText.includes('पुरुष')) {
      return 'MALE';
    }

    // 2. Infer from relationship prefixes on the back (S/O, D/O, W/O, etc.)
    const backTextLower = backText.toLowerCase();
    
    // Check for "S/O", "Son of", "S/o", "s/o"
    if (/\bs\/o\b/i.test(backTextLower) || /\bson\s+of\b/i.test(backTextLower)) {
      return 'MALE';
    }
    
    // Check for "D/O", "Daughter of", "D/o", "d/o", "W/O", "Wife of", "W/o", "w/o"
    if (/\bd\/o\b/i.test(backTextLower) || /\bdaughter\s+of\b/i.test(backTextLower) ||
        /\bw\/o\b/i.test(backTextLower) || /\bwife\s+of\b/i.test(backTextLower)) {
      return 'FEMALE';
    }

    return 'Not Found';
  }
}
