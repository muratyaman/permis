import axios from 'axios';

const baseURL = process.env.REACT_APP_OAUTH2_BASE ?? 'http://localhost:8000/oauth2';

const _client = axios.create({ baseURL });

export interface IConsentDetails {
  consumer: { name: string; web_url?: string; icon_url?: string; };
  client:   { name: string; web_url?: string; };
  scopes:   Array<{ code: string; description: string; }>;
}

export interface IConsentRetrieveInput {
  client_id:    string;
  redirect_uri: string;
  scope:        string;
  state:        string;
}

export interface IConsentRetrieveOutput {
  data?:  IConsentDetails;
  error?: string;
}

export interface IConsentUpdateInput {
  client_id:    string;
  redirect_uri: string;
  scope:        string;
  state:        string;
  is_granted:   number;
}

export interface IConsentUpdateOutput {
  data?:  boolean;
  error?: string;
}

async function consentRetrieve(id: string, params: IConsentRetrieveInput, token = ''): Promise<IConsentRetrieveOutput> {
  const headers = { authorization: `bearer ${token}` };
  const options = { params, headers };
  const res = await _client.get<IConsentRetrieveOutput>('/consents/' + id, options);
  return res.data;
}

async function consentUpdate(id: string, data: IConsentUpdateInput, token = ''): Promise<IConsentUpdateOutput> {
  const headers = { authorization: `bearer ${token}`};
  const options = { headers };
  const res = await _client.post<IConsentUpdateOutput>('/consents/' + id, data, options);
  return res.data;
}

export const oauth2Api = {
  _client,
  _baseURL: baseURL,
  consentRetrieve,
  consentUpdate,
};
