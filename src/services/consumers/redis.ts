import { IdType } from '../../dto';
import { RepoWithRedis } from '../../repos';
import { IConsumerDto, IConsumerService } from './types';

export class ConsumerServiceWithRedis implements IConsumerService<IConsumerDto> {

  constructor(protected r: RepoWithRedis<IConsumerDto>) {}

  async find(id: IdType): Promise<IConsumerDto> {
    return this.r.retrieve(id);
  }

}
