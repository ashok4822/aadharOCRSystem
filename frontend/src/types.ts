export interface AadhaarData {
  id?: string;
  aadhaarNumber: string;
  name: string;
  dob: string;
  gender: string;
  address: string;
  pincode: string;
  frontImage: string;
  backImage: string;
  rawTextFront?: string;
  rawTextBack?: string;
  createdAt?: string;
}
