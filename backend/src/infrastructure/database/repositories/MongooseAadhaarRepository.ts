import { Aadhaar } from '../../../domain/entities/Aadhaar';
import { IAadhaarRepository } from '../../../domain/repositories/IAadhaarRepository';
import { AadhaarModel } from '../models/AadhaarModel';
import { AadhaarMapper } from '../../../application/mappers/AadhaarMapper';

export class MongooseAadhaarRepository implements IAadhaarRepository {
  public async save(aadhaar: Aadhaar): Promise<Aadhaar> {
    const modelData = {
      aadhaarNumber: aadhaar.aadhaarNumber,
      name: aadhaar.name,
      dob: aadhaar.dob,
      gender: aadhaar.gender,
      address: aadhaar.address,
      pincode: aadhaar.pincode,
      frontImage: aadhaar.frontImage,
      backImage: aadhaar.backImage,
      rawTextFront: aadhaar.rawTextFront,
      rawTextBack: aadhaar.rawTextBack,
    };

    const doc = new AadhaarModel(modelData);
    const savedDoc = await doc.save();
    return AadhaarMapper.toEntity(savedDoc);
  }

  public async findAll(): Promise<Aadhaar[]> {
    const docs = await AadhaarModel.find().sort({ createdAt: -1 });
    return docs.map(doc => AadhaarMapper.toEntity(doc));
  }

  public async findById(id: string): Promise<Aadhaar | null> {
    const doc = await AadhaarModel.findById(id);
    if (!doc) return null;
    return AadhaarMapper.toEntity(doc);
  }

  public async findByAadhaarNumber(aadhaarNumber: string): Promise<Aadhaar[]> {
    const docs = await AadhaarModel.find({ aadhaarNumber });
    return docs.map(doc => AadhaarMapper.toEntity(doc));
  }
}
