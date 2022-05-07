import { IJwtPayload } from '../../types';

export interface ISecurityService<TJwtModel extends IJwtPayload = IJwtPayload> {
  privateKey: Buffer;
  publicKey: Buffer;

  generateRandomString(len: number): Promise<string>;

  hashText(text: string): Promise<string>;
  verifyText(text: string, textHash: string): Promise<boolean>;

  generateJwt(payload: TJwtModel, expiryInSeconds?: number): Promise<string>;
  verifyJwt(token: string): Promise<TJwtModel>;

  makeBasicAuthToken(input: IUserAndPass): string;
  verifyBasicAuth(token: string): IUserAndPass;
}

export interface IUserAndPass {
  username: string;
  password: string;
}
