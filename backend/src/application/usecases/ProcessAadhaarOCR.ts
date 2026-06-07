import { Aadhaar } from '../../domain/entities/Aadhaar';
import { IAadhaarRepository } from '../../domain/repositories/IAadhaarRepository';
import { IOCRService } from '../services/IOCRService';

export class ProcessAadhaarOCR {
  constructor(
    private readonly ocrService: IOCRService,
    private readonly repository: IAadhaarRepository
  ) {}

  public async execute(
    frontImagePath: string,
    backImagePath: string,
    frontFilename: string,
    backFilename: string
  ): Promise<Aadhaar> {
    const rawTextFront = await this.ocrService.performOCR(frontImagePath);
    const rawTextBack = await this.ocrService.performOCR(backImagePath);

    const parsedData = this.parseAadhaarText(rawTextFront, rawTextBack);

    const aadhaar = new Aadhaar(
      undefined,
      parsedData.aadhaarNumber,
      parsedData.name,
      parsedData.dob,
      parsedData.gender,
      parsedData.address,
      parsedData.pincode,
      `uploads/${frontFilename}`,
      `uploads/${backFilename}`,
      rawTextFront,
      rawTextBack
    );

    return this.repository.save(aadhaar);
  }

  private parseAadhaarText(frontText: string, backText: string) {
    // 1. Aadhaar Number (12 digits, e.g., "XXXX XXXX XXXX" or "XXXXXXXXXXXX")
    const numberRegex = /\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b/;
    let aadhaarNumber = "";
    const numMatch = frontText.match(numberRegex) || backText.match(numberRegex);
    if (numMatch) {
      aadhaarNumber = numMatch[0].replace(/\s+/g, '');
    }

    // 2. DOB / Year of Birth
    const dobRegex = /(?:DOB|D\.O\.B|Date\s*of\s*Birth|Year\s*of\s*Birth)[:\s\-]*([0-9\/]+)/i;
    let dob = "";
    const dobMatch = frontText.match(dobRegex);
    if (dobMatch) {
      dob = dobMatch[1];
    } else {
      const dateRegex = /\b\d{2}\/\d{2}\/\d{4}\b/;
      const dateMatch = frontText.match(dateRegex);
      if (dateMatch) {
        dob = dateMatch[0];
      } else {
        const yearRegex = /\b(19\d{2}|20\d{2})\b/;
        const yearMatch = frontText.match(yearRegex);
        if (yearMatch) {
          dob = yearMatch[0];
        }
      }
    }

    // 3. Gender
    const genderRegex = /\b(MALE|FEMALE|Male|Female|TRANSGENDER)\b/i;
    let gender = "";
    const genderMatch = frontText.match(genderRegex);
    if (genderMatch) {
      gender = genderMatch[0].toUpperCase();
    } else {
      if (frontText.toLowerCase().includes("male") || frontText.toLowerCase().includes("पुरुष")) {
        gender = "MALE";
      } else if (frontText.toLowerCase().includes("female") || frontText.toLowerCase().includes("महिला")) {
        gender = "FEMALE";
      }
    }

    // 4. Pincode
    const pincodeRegex = /\b\d{6}\b/;
    let pincode = "";
    const pinMatch = backText.match(pincodeRegex);
    if (pinMatch) {
      pincode = pinMatch[0];
    }

    // 5. Address
    let address = "";
    const addressStartIndex = backText.search(/Address:|Address\s*|पता\s*:/i);
    if (addressStartIndex !== -1) {
      const addressText = backText.substring(addressStartIndex);
      let cleaned = addressText.replace(/Address:|Address\s*|पता\s*:/i, '').trim();
      
      if (pincode) {
        const pinIdx = cleaned.indexOf(pincode);
        if (pinIdx !== -1) {
          cleaned = cleaned.substring(0, pinIdx + pincode.length);
        }
      }
      address = cleaned.replace(/\s+/g, ' ').trim();
    } else {
      address = backText.replace(/\s+/g, ' ').trim();
    }

    // 6. Name (Line above DOB line)
    let name = "";
    const lines = frontText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let dobLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/(?:DOB|D\.O\.B|Date\s*of\s*Birth|Year\s*of\s*Birth|MALE|FEMALE|Male|Female|पुरुष|महिला)/i)) {
        dobLineIndex = i;
        break;
      }
    }

    if (dobLineIndex > 0) {
      const noiseWords = [
        "government", "india", "unique", "identification", "authority",
        "signature", "download", "enrollment", "help", "contact",
        "information", "card", "aadhaar", "भारत", "सरकार", "विशिष्ट",
        "पहचान", "प्राधिकरण", "मेरा", "अधिकार", "आधार"
      ];
      
      for (let j = dobLineIndex - 1; j >= 0; j--) {
        const lineLower = lines[j].toLowerCase();
        const isNoise = noiseWords.some(word => lineLower.includes(word));
        const hasDigits = /\d/.test(lines[j]);
        if (!isNoise && !hasDigits && lines[j].length > 3) {
          name = lines[j];
          break;
        }
      }
    }

    if (!name) {
      const namePattern = /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+$/;
      for (const line of lines) {
        const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
        if (namePattern.test(cleanLine) && !cleanLine.toLowerCase().includes("government") && !cleanLine.toLowerCase().includes("india")) {
          name = cleanLine;
          break;
        }
      }
    }

    if (!name) name = "Not Found";
    if (!aadhaarNumber) aadhaarNumber = "Not Found";
    if (!dob) dob = "Not Found";
    if (!gender) gender = "Not Found";
    if (!address) address = "Not Found";
    if (!pincode) pincode = "Not Found";

    return {
      aadhaarNumber,
      name,
      dob,
      gender,
      address,
      pincode
    };
  }
}
