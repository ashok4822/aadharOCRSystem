import mongoose, { Schema, Document } from 'mongoose';

export interface IAadhaarDocument extends Document {
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
  createdAt: Date;
}

const AadhaarSchema = new Schema<IAadhaarDocument>({
  aadhaarNumber: { type: String, required: true },
  name: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  frontImage: { type: String, required: true },
  backImage: { type: String, required: true },
  rawTextFront: { type: String },
  rawTextBack: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const AadhaarModel = mongoose.model<IAadhaarDocument>('Aadhaar', AadhaarSchema);
export default AadhaarModel;
