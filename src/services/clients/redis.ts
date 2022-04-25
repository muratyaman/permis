import { IdType } from '../../dto';
import { PermisError } from '../../errors';
import { RepoWithRedis } from '../../repos';
import { ISecurityService } from '../security';
import { IClientDto, IClientService } from './types';

export class ClientServiceWithRedis implements IClientService<IClientDto> {

  constructor(protected r: RepoWithRedis<IClientDto>, protected securityService: ISecurityService) {}

  async find(id: IdType): Promise<IClientDto> {
    return this.r.retrieve(id);
  }

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

}
