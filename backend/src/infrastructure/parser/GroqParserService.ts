import { IAadhaarParser } from '../../application/services/IAadhaarParser';
import { config } from '../../config/config';

export class GroqParserService implements IAadhaarParser {
  public async parseText(
    frontText: string,
    backText: string
  ): Promise<{
    aadhaarNumber: string;
    name: string;
    dob: string;
    gender: string;
    address: string;
    pincode: string;
  }> {
    if (!config.groqApiKey) {
      throw new Error(
        'GROQ_API_KEY environment variable is missing. Please set it in your backend/.env file.'
      );
    }

    const prompt = `
Extract the Aadhaar details in English from the following raw OCR text scanned from the front and back of the card.
Return the output as a valid JSON object matching the schema below.

CRITICAL RULES:
1. Extract ONLY the English text/data that is already present on the card.
2. The card may contain text in both Malayalam script and English (Latin) script. Your job is to extract the ENGLISH (Latin A-Z) values only. Do NOT translate or transliterate Malayalam text.
3. For the "name" field: The cardholder's name appears on the front of the card in BOTH Malayalam script AND English (Latin letters A-Z). You MUST extract the English (Latin script) version of the name. The English name is the line that consists only of Latin alphabet characters (A-Z, a-z, spaces, dots, hyphens). It typically appears just below the Malayalam version of the same name. Do NOT return Malayalam characters as the name. If after carefully scanning all lines you truly cannot find a Latin-script name, set the value to "Not Found".
4. The Aadhaar number has been redacted from the raw text for privacy and is represented as "[REDACTED_AADHAAR_NUMBER]". Set the "aadhaarNumber" field to "[REDACTED_AADHAAR_NUMBER]".
5. If a field is not present or cannot be found in English, set its value to "Not Found".
6. For the "gender" field: look for any variant of Male/Female/Transgender on the card (including garbled OCR like "Fe_male", "Ma le", "M ALE", etc.). If gender is not explicitly stated on the front, you can infer it from the relationship prefix in the address on the back of the card: "S/O" or "Son of" implies "MALE", while "D/O", "Daughter of", "W/O", or "Wife of" implies "FEMALE". Output ONLY one of the three canonical values: "MALE", "FEMALE", or "TRANSGENDER". If after these checks it still cannot be found or inferred, set it to "Not Found". Do NOT copy garbled text verbatim.
7. For the "dob" field: look for a date pattern like DD/MM/YYYY or YYYY. It is often prefixed with "DOB:", "Date of Birth:", or "Year of Birth:".
8. For the "address" field: extract the full English postal address from the BACK of the card. Exclude any Malayalam lines. Include house number, street, locality, district, state and pin code if visible.

JSON SCHEMA:
{
  "aadhaarNumber": "[REDACTED_AADHAAR_NUMBER]",
  "name": "Full name in English Latin characters only",
  "dob": "Date of birth (DD/MM/YYYY or YYYY format)",
  "gender": "Must be exactly one of: MALE, FEMALE, or TRANSGENDER",
  "address": "Full postal address in English (excluding any Malayalam text)",
  "pincode": "6-digit postal code"
}

--- RAW FRONT OCR TEXT ---
${frontText}

--- RAW BACK OCR TEXT ---
${backText}
`.trim();

    try {
      console.log(`Connecting to Groq API using model: ${config.groqModel}`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.groqApiKey}`,
        },
        body: JSON.stringify({
          model: config.groqModel,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API returned HTTP status ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as {
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Groq API response format is invalid or choices are empty.');
      }

      console.log('Groq raw JSON response:', content);
      const parsedJson = JSON.parse(content);

      return {
        aadhaarNumber: parsedJson.aadhaarNumber || 'Not Found',
        name: parsedJson.name || 'Not Found',
        dob: parsedJson.dob || 'Not Found',
        gender: this.normalizeGender(parsedJson.gender),
        address: parsedJson.address || 'Not Found',
        pincode: parsedJson.pincode || 'Not Found',
      };
    } catch (error) {
      console.error('Failed to parse Aadhaar using Groq:', error);
      throw new Error(`Groq parsing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Normalizes a raw gender string (which may be garbled OCR output) into one of
   * the three canonical values: MALE, FEMALE, or TRANSGENDER.
   * Falls back to "Not Found" if the value is missing or unrecognisable.
   */
  private normalizeGender(raw: string | undefined | null): string {
    if (!raw) return 'Not Found';

    // Remove all non-alphabetic characters and lowercase for matching
    const cleaned = raw.replace(/[^a-zA-Z]/g, '').toLowerCase();

    if (cleaned.includes('female') || cleaned.includes('fmale') || cleaned.includes('femal')) {
      return 'FEMALE';
    }
    if (cleaned.includes('transgender') || cleaned.includes('trans')) {
      return 'TRANSGENDER';
    }
    if (cleaned.includes('male')) {
      return 'MALE';
    }

    // If Groq returned the correct canonical value already
    const upper = raw.trim().toUpperCase();
    if (upper === 'MALE' || upper === 'FEMALE' || upper === 'TRANSGENDER') {
      return upper;
    }

    return 'Not Found';
  }
}
