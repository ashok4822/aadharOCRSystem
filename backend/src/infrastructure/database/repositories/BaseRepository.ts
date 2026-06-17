import { Document } from 'mongoose';

export abstract class BaseRepository<TEntity, TModel extends Document> {
  /**
   * Converts a Mongoose document to a domain entity.
   * Must be implemented by every concrete repository.
   */
  protected abstract toEntity(doc: TModel): TEntity;

  /**
   * Converts a domain entity to a plain persistence object
   * suitable for creating or updating a Mongoose model.
   * Must be implemented by every concrete repository.
   */
  protected abstract toPersistence(entity: TEntity): Partial<TModel>;
}
