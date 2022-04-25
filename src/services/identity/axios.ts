import { AxiosInstance } from 'axios';
import { IBaseDto } from '../../dto';
import { PermisError } from '../../errors';
import { IIdentityService, IAuthenticateInput } from './types';

export class IdentityServiceWithAxios implements IIdentityService<IBaseDto> {

  constructor(protected axios: AxiosInstance) {}

  async authenticate(input: IAuthenticateInput): Promise<IBaseDto> {
    try {
      const { token_type = 'bearer', token = '' } = input;
      const authorization =  `${token_type} ${token}`;
      const res = await this.axios.get<IBaseDto>('/me', { headers: { authorization }});
      return res.data;
    } catch (err) {
      throw new PermisError(err instanceof Error ? err.message : 'Unauthorized');
    }
  }

}
