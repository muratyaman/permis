import { IdType } from '../../dto';
import { RepoWithRedis } from '../../repos';
import { ts, uuid } from '../../utils';
import { ISecurityService } from '../security';
import { ITokenDto, ITokenService } from './types';

export class TokenServiceWithRedis implements ITokenService<ITokenDto> {

  constructor(protected r: RepoWithRedis<ITokenDto>, protected securityService: ISecurityService) {}

  async find(id: IdType): Promise<ITokenDto> {
    return this.r.retrieve(id);
  }

  async create(dto: Partial<ITokenDto>): Promise<ITokenDto> {
    // TODO: validate

    const _dto: ITokenDto = {
      id:        dto.id ?? uuid(),
      client_id: dto.client_id ?? '',
      
      token_type: dto.token_type ?? 'bearer',

      access_token:             dto.access_token ?? '',
      access_token_expires_at:  dto.access_token_expires_at ?? '',

      refresh_token:            dto.refresh_token ?? '',
      refresh_token_expires_at: dto.refresh_token_expires_at ?? '',

      user_id:    dto.user_id ?? '',
      scope:      dto.scope ?? '',

      is_used:    dto.is_used ?? 0,
      created_at: ts(),
      updated_at: ts(),
    };
    await this.r.create(_dto.id, _dto);
    return _dto;
  }

  async update(id: IdType, dto: Partial<ITokenDto>): Promise<boolean> {
    return this.r.update(id, {
      is_used:    dto.is_used ?? 0,
      updated_at: ts(),
    });
  }

}
