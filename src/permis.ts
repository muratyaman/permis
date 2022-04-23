import * as oauth2 from './oauth2';
import { IPermisConfiguration, IPermisService } from './types';

export class PermisService implements IPermisService {
  constructor(public conf: IPermisConfiguration) {

  }

  async authorizeStart(request: oauth2.IRequestToStartAuthorization): Promise<oauth2.IResponseToStartAuthorization> {
    const response: oauth2.IResponseToStartAuthorization = {
      request,
    }
    const client = this.conf.clientService?.find(request.client_id);
    console.debug({ client });
    return response;
  }

  async authorizeFinish(request: oauth2.IRequestToFinishAuthorization): Promise<oauth2.IResponseToFinishAuthorization> {
    const response: oauth2.IResponseToFinishAuthorization = {
      request,
    }
    return response;
  }
}
