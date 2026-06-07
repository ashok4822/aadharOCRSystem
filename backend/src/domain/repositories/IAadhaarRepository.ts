import { Aadhaar } from '../entities/Aadhaar';

export interface IAadhaarRepository {
  save(aadhaar: Aadhaar): Promise<Aadhaar>;
  findAll(): Promise<Aadhaar[]>;
  findById(id: string): Promise<Aadhaar | null>;
  findByAadhaarNumber(aadhaarNumber: string): Promise<Aadhaar[]>;
}
export default IAadhaarRepository;
