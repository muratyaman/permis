import { IdType, IObject } from '../../dto';
import { RepoWithRedis } from '../../repos';
import { assertString, ts, uuid } from '../../utils';
import { ISecurityService } from '../security';
import { ITokenDto, ITokenService } from './types';

export class TokenServiceWithRedis implements ITokenService<ITokenDto> {

  constructor(public readonly repo: RepoWithRedis<ITokenDto>, public readonly securityService: ISecurityService) {}

  async findMany(conditions: IObject): Promise<ITokenDto[]> {
    return this.repo.findMany(conditions);
  }

  async create(dto: Partial<ITokenDto>): Promise<ITokenDto> {
    // TODO: validate

    const _dto: ITokenDto = {
      id:                       dto.id ?? uuid(),
      user_id:                  assertString(String(dto.user_id ?? ''), 'user_id missing'),
      client_id:                assertString(String(dto.client_id ?? ''), 'client_id missing'),
      is_used:                  dto.is_used ?? 0,
      token_type:               dto.token_type ?? 'bearer',
      access_token:             assertString(dto.access_token ?? '', 'access_token missing'),
      access_token_expires_at:  dto.access_token_expires_at ?? '',
      refresh_token:            assertString(dto.refresh_token ?? '', 'refresh_token missing'),
      refresh_token_expires_at: dto.refresh_token_expires_at ?? '',
      scope:                    assertString(dto.scope ?? '', 'scope missing'),
      created_at:               ts(),
      updated_at:               ts(),
    };
    await this.repo.create(String(_dto.id), _dto);
    return _dto;
  }

  async update(id: IdType, dto: Partial<ITokenDto>): Promise<boolean> {
    return this.repo.update(String(id), {
      is_used:    dto.is_used ?? 0,
      updated_at: ts(),
    });
  }

  async retrieve(id: IdType): Promise<ITokenDto> {
    return this.repo.retrieve(String(id));
  }

  async delete_(id: IdType): Promise<boolean> {
    return this.repo.delete_(String(id));
  }
}
