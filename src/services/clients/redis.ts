import { IdType, IObject } from '../../dto';
import { PermisError } from '../../errors';
import { RepoWithRedis } from '../../repos';
import { assertString, ts, uuid } from '../../utils';
import { ISecurityService } from '../security';
import { IClientDto, IClientService } from './types';

export class ClientServiceWithRedis implements IClientService<IClientDto> {

  constructor(public readonly repo: RepoWithRedis<IClientDto>, public readonly securityService: ISecurityService) {}

  async verifyClientWithRedirectUri(client: IClientDto, redirect_uri: string): Promise<boolean> {
    if (!client.redirect_uris.includes(redirect_uri)) {
      throw new PermisError('Invalid request URI'); // TODO: review this info
    }
    return true;
  }

  async verifyClientWithSecret(client: IClientDto, secret: string): Promise<boolean> {
    const verified = await this.securityService.verifyText(secret, client.client_secret_hash);
    if (!verified) throw new PermisError('Invalid client credentials');
    return true;
  }

  async findMany(conditions: IObject): Promise<IClientDto[]> {
    return this.repo.findMany(conditions);
  }

  async create(dto: Partial<IClientDto>): Promise<IClientDto> {
    dto.id          = dto.id ?? uuid();
    dto.created_at  = dto.created_at ?? ts();
    dto.updated_at  = dto.updated_at ?? ts();
    dto.consumer_id = assertString(String(dto.consumer_id ?? ''), 'consumer_id missing');
    await this.repo.create(String(dto.id), dto);
    return this.retrieve(dto.id);
  }

  async retrieve(id: IdType): Promise<IClientDto> {
    return this.repo.retrieve(String(id));
  }

  async update(id: IdType, dto: Partial<IClientDto>): Promise<boolean> {
    return this.repo.update(String(id), {
      ...dto,
      updated_at: ts(),
    });
  }

  async delete_(id: IdType): Promise<boolean> {
    return this.repo.delete_(String(id));
  }

}
