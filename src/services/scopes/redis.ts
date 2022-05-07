import { IdType, IObject } from '../../dto';
import { PermisError } from '../../errors';
import { RepoWithRedis } from '../../repos';
import { ts, uuid } from '../../utils';
import { IScopeDto, IScopeService } from './types';

export class ScopeServiceWithRedis implements IScopeService<IScopeDto> {

  constructor(public readonly repo: RepoWithRedis<IScopeDto>) {}

  async verifyScopes(scopes: string[], _client_id: IdType): Promise<boolean> {
    const rows = await this.repo.findMany({});
    const ids = rows.map(r => r.id);
    for (const scope of scopes) {
      if (!ids.includes(scope)) throw new PermisError('Invalid scope: ' + scope);
    }
    return true;
  }

  async findMany(conditions: IObject): Promise<IScopeDto[]> {
    return this.repo.findMany(conditions);
  }

  async create(dto: Partial<IScopeDto>): Promise<IScopeDto> {
    dto.id         = dto.id ?? uuid();
    dto.created_at = dto.created_at ?? ts();
    dto.updated_at = dto.updated_at ?? ts();
    return this.retrieve(dto.id);
  }

  async retrieve(id: IdType): Promise<IScopeDto> {
    return this.repo.retrieve(String(id));
  }

  async update(id: IdType, dto: Partial<IScopeDto>): Promise<boolean> {
    return this.repo.update(String(id), dto);
  }

  async delete_(id: IdType): Promise<boolean> {
    return this.repo.delete_(String(id));
  }

}
