import axios from 'axios';

const baseURL      = process.env.REACT_APP_OAUTH2_BASE ?? 'http://localhost:8000/oauth2';
const client_id    = process.env.REACT_APP_CLIENT_ID ?? '';
const redirect_uri = process.env.REACT_APP_REDIRECT_URI ?? 'http://localhost:4000/auth';

const _client = axios.create({ baseURL });

export interface ITokenCreateInput {
  grant_type:     'authorization_code';
  client_id:      string;
  redirect_uri:   string;
  scope:          string;
  code?:          string;
  client_secret?: string;
}

export interface ITokenCreateOutput {
  token?: string;
  error?: string;
}

async function tokenCreate(data: ITokenCreateInput): Promise<ITokenCreateOutput> {
  const res = await _client.post<ITokenCreateOutput>('/tokens', data);
  return res.data;
}

export const oauth2Api = {
  _conf: { baseURL, client_id, redirect_uri },
  _client,
  tokenCreate,
};
