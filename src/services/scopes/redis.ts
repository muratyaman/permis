import { IdType } from '../../dto';
import { PermisError } from '../../errors';
import { RepoWithRedis } from '../../repos';
import { IScopeDto, IScopeService } from './types';

export class ScopeServiceWithRedis implements IScopeService<IScopeDto> {

  constructor(protected r: RepoWithRedis<IScopeDto>) {}

  async find(id: IdType): Promise<IScopeDto> {
    return this.r.retrieve(id);
  }

  async verifyScopes(scopes: string[]): Promise<boolean> {
    const rows = await this.r.findMany({});
    const ids = rows.map(r => r.id);
    for (const scope of scopes) {
      if (!ids.includes(scope)) throw new PermisError('Invalid scope: ' + scope);
    }
    return true;
  }

}
