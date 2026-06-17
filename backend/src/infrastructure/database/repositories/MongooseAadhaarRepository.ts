import { Aadhaar } from "../../../domain/entities/Aadhaar";
import { IAadhaarRepository } from "../../../domain/repositories/IAadhaarRepository";
import { AadhaarModel, IAadhaarDocument } from "../models/AadhaarModel";
import { BaseRepository } from "./BaseRepository";

export class MongooseAadhaarRepository
  extends BaseRepository<Aadhaar, IAadhaarDocument>
  implements IAadhaarRepository
{
  // Maps a raw Mongoose IAadhaarDocument to a domain Aadhaar entity.
  protected toEntity(doc: IAadhaarDocument): Aadhaar {
    return new Aadhaar(
      doc._id ? doc._id.toString() : undefined,
      doc.aadhaarNumber,
      doc.name,
      doc.dob,
      doc.gender,
      doc.address,
      doc.pincode,
      doc.frontImage,
      doc.backImage,
      doc.rawTextFront,
      doc.rawTextBack,
      doc.createdAt ? new Date(doc.createdAt) : undefined,
    );
  }

  // Maps a domain Aadhaar entity to a plain object for Mongoose persistence.
  protected toPersistence(entity: Aadhaar): Partial<IAadhaarDocument> {
    return {
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
    } as Partial<IAadhaarDocument>;
  }

  public async save(aadhaar: Aadhaar): Promise<Aadhaar> {
    const doc = new AadhaarModel(this.toPersistence(aadhaar));
    const savedDoc = await doc.save();
    return this.toEntity(savedDoc);
  }

  public async findAll(): Promise<Aadhaar[]> {
    const docs = await AadhaarModel.find().sort({ createdAt: -1 });
    return docs.map((doc) => this.toEntity(doc));
  }

  public async findById(id: string): Promise<Aadhaar | null> {
    const doc = await AadhaarModel.findById(id);
    if (!doc) return null;
    return this.toEntity(doc);
  }

  public async findByAadhaarNumber(aadhaarNumber: string): Promise<Aadhaar[]> {
    const docs = await AadhaarModel.find({ aadhaarNumber });
    return docs.map((doc) => this.toEntity(doc));
  }
}
