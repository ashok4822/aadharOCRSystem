import { Aadhaar } from '../../domain/entities/Aadhaar';

export interface IProcessAadhaarOCR {
  execute(
    frontImage: Buffer,
    backImage: Buffer,
    frontMimeType: string,
    backMimeType: string
  ): Promise<Aadhaar>;
}
