import { IdType } from '../../dto';
import { RepoWithRedis } from '../../repos';
import { ts, uuid } from '../../utils';
import { IAuthCodeDto, IAuthCodeService } from './types';

export class AuthCodeServiceWithRedis implements IAuthCodeService<IAuthCodeDto> {

  constructor(protected r: RepoWithRedis<IAuthCodeDto>) {}

  async find(code: string): Promise<IAuthCodeDto> {
    return this.r.retrieve(code); // code is id
  }

  async create(dto: Partial<IAuthCodeDto>): Promise<IAuthCodeDto> {
    // TODO: validate

    const _dto: IAuthCodeDto = {
      id:         dto.id ?? uuid(),
      client_id:  dto.client_id ?? '',
      is_used:    dto.is_used ?? 0,
      expires_at: dto.expires_at ?? '',
      consent_id: dto.consent_id ?? '',
      created_at: ts(),
      updated_at: ts(),
    };
    await this.r.create(_dto.id, _dto);
    return _dto;
  }

  async update(code: IdType, dto: Partial<IAuthCodeDto>): Promise<boolean> {
    return this.r.update(code, {
      is_used:    dto.is_used ?? 0,
      updated_at: ts(),
    });
  }

}
