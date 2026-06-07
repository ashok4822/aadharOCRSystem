import { Aadhaar } from '../../domain/entities/Aadhaar';
import { IAadhaarRepository } from '../../domain/repositories/IAadhaarRepository';

export class GetAadhaarHistory {
  constructor(private readonly repository: IAadhaarRepository) {}

  public async execute(): Promise<Aadhaar[]> {
    return this.repository.findAll();
  }
}
