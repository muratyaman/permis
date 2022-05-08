import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { assertString, expiryForJwt } from '../../utils';
import { IJwtPayload } from '../../types';
import { ISecurityService, IUserCredentials } from './types';

const ALGO_RS256 = 'RS256';
const BASE64     = 'base64';
const SEP_AUTH   = ':'
const UTF8       = 'utf8';

const errInvalidBasicAuth = 'Invalid basic authentication token';


export class SecurityServiceDefault implements ISecurityService<IJwtPayload> {

  constructor(public readonly privateKey: Buffer, public readonly publicKey: Buffer) {}

  async generateRandomString(len: number): Promise<string> {
    return crypto.randomBytes(len).toString(BASE64).slice(0, len);
  }

  async hashText(text: string): Promise<string> {
    const salt = await bcrypt.genSalt(16);
    const hashed = await bcrypt.hash(text, salt);
    // TODO: logging
    return hashed;
  }

  /**
   * e.g. compare the password user entered with hashed password
   * @param text
   * @param hashedText
   * @returns 
   */
  async verifyText(text: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(text, hashedText);
  }

  async generateJwt(payload: IJwtPayload, expiryInSeconds = 0): Promise<string> {
    const options: Record<string, string> = { algorithm: ALGO_RS256 };
    if (expiryInSeconds) {
      options.expiresIn = expiryForJwt(expiryInSeconds);
    }
    return jwt.sign(payload, this.privateKey, options);
  }

  async verifyJwt(token: string): Promise<IJwtPayload> {
    const decoded = jwt.verify(token, this.publicKey, { algorithms: [ALGO_RS256] });
    // TODO: validate
    return decoded as unknown as IJwtPayload; // pretend
  }

  makeBasicAuthToken(input: IUserCredentials): string {
    return Buffer.from(`${input.username}:${input.password}`).toString(BASE64);
  }

  verifyBasicAuth(token: string): IUserCredentials {
    const tokenB64Decoded = Buffer.from(token, BASE64).toString(UTF8);
    const [username, password] = tokenB64Decoded.split(SEP_AUTH);
    assertString(username, errInvalidBasicAuth);
    assertString(username, errInvalidBasicAuth);
    return { username, password };
  }
}
