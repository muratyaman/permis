import { IdType, IObject } from '../../dto';
import { RepoWithRedis } from '../../repos';
import { assertString, ts, uuid } from '../../utils';
import { IConsentDto, IConsentService } from './types';

export class ConsentServiceWithRedis implements IConsentService<IConsentDto> {

  constructor(public readonly repo: RepoWithRedis<IConsentDto>) {}

  async findMany(conditions: IObject): Promise<IConsentDto[]> {
    return this.repo.findMany(conditions);
  }

  async create(dto: Partial<IConsentDto>): Promise<IConsentDto> {
    // TODO: validate
    const _dto: IConsentDto = {
      id:           dto.id ?? uuid(),
      client_id:    assertString(String(dto.client_id ?? ''), 'client_id missing'),
      redirect_uri: dto.redirect_uri ?? '',
      scope:        dto.scope ?? '',
      state:        dto.state ?? '',
      user_id:      dto.user_id ?? null,
      is_granted:   0,
      expires_at:   dto.expires_at ?? '',
      created_at:   ts(),
      updated_at:   ts(),
    };
    await this.repo.create(String(_dto.id), _dto);
    return _dto;
  }

  async retrieve(id: IdType): Promise<IConsentDto> {
    return this.repo.retrieve(String(id));
  }

  async update(id: IdType, dto: Partial<IConsentDto>): Promise<boolean> {
    return this.repo.update(String(id), {
      user_id:    dto.user_id ?? null,
      is_granted: dto.is_granted ?? 0,
      updated_at: ts(),
    });
  }

  async delete_(id: IdType): Promise<boolean> {
    return this.repo.delete_(String(id));
  }
}
