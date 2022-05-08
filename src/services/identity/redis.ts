import { IdType, IObject } from '../../dto';
import { ErrRecordNotFound } from '../../errors';
import { RepoWithRedis } from '../../repos';
import { ts, uuid } from '../../utils';
import { ISecurityService } from '../security';
import { IIdentityService, IIdentityDto } from './types';

export class IdentityServiceWithRedis implements IIdentityService<IIdentityDto> {

  constructor(public readonly repo: RepoWithRedis<IIdentityDto>, public readonly security: ISecurityService) {}

  async findMany(conditions: IObject): Promise<IIdentityDto[]> {
    return this.repo.findMany(conditions);
  }

  async findByUsername(username: string): Promise<IIdentityDto> {
    const rows = await this.repo.findMany({ username });
    if (!rows || rows.length === 0) throw new ErrRecordNotFound('User not found');
    return rows[0];
  }

  async create(dto: Partial<IIdentityDto>): Promise<IIdentityDto> {
    dto.id         = dto.id ?? uuid();
    dto.status     = dto.status ?? 'ACTIVE';
    dto.created_at = dto.created_at ?? ts();
    dto.updated_at = dto.updated_at ?? ts();
    await this.repo.create(String(dto.id), dto);
    return this.retrieve(dto.id);
  }

  async retrieve(id: IdType): Promise<IIdentityDto> {
    return this.repo.retrieve(String(id));
  }

  async update(id: IdType, dto: Partial<IIdentityDto>): Promise<boolean> {
    return this.repo.update(String(id), dto);
  }

  async delete_(id: IdType): Promise<boolean> {
    return this.repo.delete_(String(id));
  }

}
