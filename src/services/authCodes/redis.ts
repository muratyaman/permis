import { IdType, IObject } from '../../dto';
import { ErrRecordNotFound } from '../../errors';
import { RepoWithRedis } from '../../repos';
import { assertString, ts, uuid } from '../../utils';
import { ISecurityService } from '../security';
import { IAuthCodeDto, IAuthCodeService } from './types';

export class AuthCodeServiceWithRedis implements IAuthCodeService<IAuthCodeDto> {

  constructor(public readonly repo: RepoWithRedis<IAuthCodeDto>, public readonly securityService: ISecurityService) {}

  async findMany(conditions: IObject): Promise<IAuthCodeDto[]> {
    return this.repo.findMany(conditions);
  }

  async findByCode(code: string): Promise<IAuthCodeDto> {
    const rows = await this.repo.findMany({ code });
    if (!rows || !rows.length) throw new ErrRecordNotFound('Authorization code not found');
    return rows[0];
  }

  async create(dto: Partial<IAuthCodeDto>): Promise<IAuthCodeDto> {
    // TODO: validate

    const _dto: IAuthCodeDto = {
      id:         dto.id ?? uuid(),
      code:       await this.securityService.generateRandomString(64),
      client_id:  assertString(String(dto.client_id ?? ''), 'client_id missing'),
      status:     dto.status ?? 'ACTIVE',
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

  async update(id: IdType, dto: Partial<IAuthCodeDto>): Promise<boolean> {
    return this.repo.update(String(id), {
      status:     dto.status ?? '',
      updated_at: ts(),
    });
  }

  async delete_(id: IdType): Promise<boolean> {
    return this.repo.delete_(String(id));
  }
}
