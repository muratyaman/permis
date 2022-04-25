import { IdType } from '../../dto';
import { RepoWithRedis } from '../../repos';
import { ts, uuid } from '../../utils';
import { IConsentDto, IConsentService } from './types';

export class ConsentServiceWithRedis implements IConsentService<IConsentDto> {

  constructor(protected r: RepoWithRedis<IConsentDto>) {}

  async find(id: IdType): Promise<IConsentDto> {
    return this.r.retrieve(id);
  }

  async create(dto: Partial<IConsentDto>): Promise<IConsentDto> {
    // TODO: validate

    const _dto: IConsentDto = {
      id:           dto.id ?? uuid(),
      client_id:    dto.client_id ?? '',
      redirect_uri: dto.redirect_uri ?? '',
      scope:        dto.scope ?? '',
      state:        dto.state ?? '',
      user_id:      dto.user_id ?? null,
      is_granted:   0,
      expires_at:   dto.expires_at ?? '',
      created_at:   ts(),
      updated_at:   ts(),
    };
    await this.r.create(_dto.id, _dto);
    return _dto;
  }

  async update(id: IdType, dto: Partial<IConsentDto>): Promise<boolean> {
    return this.r.update(id, {
      user_id:    dto.user_id ?? null,
      is_granted: dto.is_granted ?? 0,
      updated_at: ts(),
    });
  }
}
