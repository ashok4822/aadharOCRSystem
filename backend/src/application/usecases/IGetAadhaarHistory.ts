import { Aadhaar } from '../../domain/entities/Aadhaar';

export interface IGetAadhaarHistory {
  execute(): Promise<Aadhaar[]>;
}
