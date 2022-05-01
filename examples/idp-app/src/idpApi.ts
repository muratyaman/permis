import axios from 'axios';

const baseURL = process.env.REACT_APP_IDP_BASE ?? 'http://localhost:3001';
const _client = axios.create({ baseURL });

export interface ISignUpInput {
  username?:         string;
  password?:         string;
  password_confirm?: string;
}

export interface ISignUpOutput {
  data?: { user_id: string; username: string; token: string };
  error?: string;
}

export interface ISignInInput {
  username?: string;
  password?: string;
}

export interface ISignInOutput {
  data?: { user_id: string; username: string; token: string };
  error?: string;
}

async function signUp(data: ISignUpInput): Promise<ISignUpOutput> {
  const res = await _client.post<ISignUpOutput>('/sign-up', data);
  return res.data;
}

async function signIn(data: ISignInInput): Promise<ISignInOutput> {
  const res = await _client.post<ISignInOutput>('/sign-in', data);
  return res.data;
}

export const idpApi = {
  _client,
  _conf: { baseURL },
  signUp,
  signIn,
};
