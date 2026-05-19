import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm';

export abstract class BaseService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOneBy(where);
  }

  async update(
    where: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<T | null> {
    await this.repository.update(where, data);

    return this.findOne(where);
  }

  async remove(where: FindOptionsWhere<T>): Promise<T | null> {
    const entity = await this.findOne(where);

    if (!entity) {
      return null;
    }

    await this.repository.delete(where);

    return entity;
  }
}
