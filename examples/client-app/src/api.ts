import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE ?? 'http://localhost:8000';

const _client = axios.create({ baseURL });

let _token = '';
let authorization = '';

export interface IUserOutput {
  data?: IUser;
  error?: string;
}

export interface IUser {
  id:       string;
  username: string;
  name?:    string;
  email?:   string;
}

function _setToken(newToken: string) {
  _token = newToken;
  authorization = `Bearer ${_token}`;
}

async function me(): Promise<IUserOutput> {
  const res = await _client.get<IUserOutput>('/idp/users/me', { headers: { authorization }});
  return res.data;
}

export const api = {
  _conf: { baseURL },
  _client,
  _setToken,
  me,
};
