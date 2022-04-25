import { IdType } from '../../dto';


export interface ISecurityService<TJwtModel extends IJwtPayload = IJwtPayload> {
  privateKey: Buffer;
  publicKey: Buffer;

  generateRandomString(len: number): Promise<string>;

  hashText(text: string): Promise<string>;
  verifyText(text: string, textHash: string): Promise<boolean>;

  generateJwt(payload: TJwtModel, expiryInSeconds?: number): Promise<string>;
  verifyJwt(token: string): Promise<TJwtModel>;
}

export interface IJwtPayload {
  client_id: IdType;
  user_id: IdType;
  scope: string; // use space to separate multiple scopes
}
