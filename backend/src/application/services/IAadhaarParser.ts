export interface IAadhaarParser {
  parseText(
    frontText: string,
    backText: string
  ): Promise<{
    aadhaarNumber: string;
    name: string;
    dob: string;
    gender: string;
    address: string;
    pincode: string;
  }>;
}
