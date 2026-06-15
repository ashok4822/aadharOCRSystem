import { Aadhaar } from '../../domain/entities/Aadhaar';
import { IAadhaarRepository } from '../../domain/repositories/IAadhaarRepository';
import { IGetAadhaarHistory } from './IGetAadhaarHistory';

export class GetAadhaarHistory implements IGetAadhaarHistory {
  constructor(private readonly _repository: IAadhaarRepository) {}

  public async execute(): Promise<Aadhaar[]> {
    return this._repository.findAll();
  }
}
