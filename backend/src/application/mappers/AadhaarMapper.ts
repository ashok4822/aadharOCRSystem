import { Aadhaar } from '../../domain/entities/Aadhaar';
import { AadhaarResponseDTO } from '../dtos/AadhaarResponseDTO';

export class AadhaarMapper {
  /**
   * Maps a domain Aadhaar entity to a response DTO for the presentation layer.
   * Application concern — entity → wire format.
   */
  public static toDTO(entity: Aadhaar): AadhaarResponseDTO {
    return {
      id: entity.id,
      aadhaarNumber: entity.aadhaarNumber,
      name: entity.name,
      dob: entity.dob,
      gender: entity.gender,
      address: entity.address,
      pincode: entity.pincode,
      frontImage: entity.frontImage,
      backImage: entity.backImage,
      rawTextFront: entity.rawTextFront,
      rawTextBack: entity.rawTextBack,
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : undefined,
    };
  }
}
