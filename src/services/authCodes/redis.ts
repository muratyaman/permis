import { IdType, IObject } from '../../dto';
import { RepoWithRedis } from '../../repos';
import { assertString, ts, uuid } from '../../utils';
import { IAuthCodeDto, IAuthCodeService } from './types';

export class AuthCodeServiceWithRedis implements IAuthCodeService<IAuthCodeDto> {

  constructor(public readonly repo: RepoWithRedis<IAuthCodeDto>) {}

  async findMany(conditions: IObject): Promise<IAuthCodeDto[]> {
    return this.repo.findMany(conditions);
  }

  async findByCode(code: string): Promise<IAuthCodeDto> {
    return this.repo.retrieve(code); // code is id
  }

  async create(dto: Partial<IAuthCodeDto>): Promise<IAuthCodeDto> {
    // TODO: validate

    const _dto: IAuthCodeDto = {
      id:         dto.id ?? uuid(),
      client_id:  assertString(String(dto.client_id ?? ''), 'client_id missing'),
      is_used:    dto.is_used ?? 0,
      expires_at: dto.expires_at ?? '',
      consent_id: dto.consent_id ?? '',
      created_at: ts(),
      updated_at: ts(),
    };
    await this.repo.create(String(_dto.id), _dto);
    return _dto;
  }

  async retrieve(id: IdType): Promise<IAuthCodeDto> {
    return this.repo.retrieve(String(id));
  }

  async update(code: IdType, dto: Partial<IAuthCodeDto>): Promise<boolean> {
    return this.repo.update(String(code), {
      is_used:    dto.is_used ?? 0,
      updated_at: ts(),
    });
  }

  async delete_(id: IdType): Promise<boolean> {
    return this.repo.delete_(String(id));
  }
}
