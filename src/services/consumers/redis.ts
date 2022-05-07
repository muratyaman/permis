import { IdType, IObject } from '../../dto';
import { RepoWithRedis } from '../../repos';
import { ts, uuid } from '../../utils';
import { IConsumerDto, IConsumerService } from './types';

export class ConsumerServiceWithRedis implements IConsumerService<IConsumerDto> {

  constructor(public readonly repo: RepoWithRedis<IConsumerDto>) {}

  async findMany(conditions: IObject): Promise<IConsumerDto[]> {
    return this.repo.findMany(conditions);
  }

  async create(dto: Partial<IConsumerDto>): Promise<IConsumerDto> {
    dto.id         = dto.id ?? uuid();
    dto.created_at = dto.created_at ?? ts();
    dto.updated_at = dto.updated_at ?? ts();
    await this.repo.create(String(dto.id), dto);
    return this.retrieve(dto.id);
  }

  async retrieve(id: IdType): Promise<IConsumerDto> {
    return this.repo.retrieve(String(id));
  }

  async update(id: IdType, dto: Partial<IConsumerDto>): Promise<boolean> {
    return this.repo.update(String(id), dto);
  }

  async delete_(id: IdType): Promise<boolean> {
    return this.repo.delete_(String(id));
  }

}
