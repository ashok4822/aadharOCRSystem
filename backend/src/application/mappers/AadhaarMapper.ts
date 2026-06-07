import { Aadhaar } from '../../domain/entities/Aadhaar';
import { AadhaarResponseDTO } from '../dtos/AadhaarResponseDTO';

export class AadhaarMapper {
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

  public static toEntity(raw: any): Aadhaar {
    return new Aadhaar(
      raw.id || (raw._id ? raw._id.toString() : undefined),
      raw.aadhaarNumber,
      raw.name,
      raw.dob,
      raw.gender,
      raw.address,
      raw.pincode,
      raw.frontImage,
      raw.backImage,
      raw.rawTextFront,
      raw.rawTextBack,
      raw.createdAt ? new Date(raw.createdAt) : undefined
    );
  }
}
