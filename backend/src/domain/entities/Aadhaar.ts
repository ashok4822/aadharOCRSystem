export class Aadhaar {
  constructor(
    public readonly id: string | undefined,
    public readonly aadhaarNumber: string,
    public readonly name: string,
    public readonly dob: string,
    public readonly gender: string,
    public readonly address: string,
    public readonly pincode: string,
    public readonly frontImage: string,
    public readonly backImage: string,
    public readonly rawTextFront?: string,
    public readonly rawTextBack?: string,
    public readonly createdAt?: Date
  ) {}
}
