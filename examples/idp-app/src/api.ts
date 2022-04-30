import axios from 'axios';

const _client = axios.create({
  baseURL: 'http://localhost:3001',
});

export interface ISignUpInput {
  username?: string;
  password?: string;
  password_confirm?: string;
}

export interface ISignUpOutput {
  data?: string | boolean;
  error?: string;
}

export interface ISignInInput {
  username?: string;
  password?: string;
}

export interface ISignInOutput {
  data: string;
}

async function signUp(data: ISignUpInput): Promise<ISignUpOutput> {
  const res = await _client.post<ISignUpOutput>('/sign-up', data);
  return res.data;
}

async function signIn(data: ISignInInput): Promise<ISignInOutput> {
  const res = await _client.post<ISignInOutput>('/sign-in', data);
  return res.data;
}

export const api = {
  _client,
  signUp,
  signIn,
};
