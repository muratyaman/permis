import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { expiryForJwt } from '../../utils';
import { IJwtPayload, ISecurityService } from './types';

export class SecurityServiceDefault implements ISecurityService<IJwtPayload> {

  constructor(public privateKey: Buffer, public publicKey: Buffer) {}

  async generateRandomString(len: number): Promise<string> {
    return crypto.randomBytes(len).toString('base64').slice(0, len);
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
    const isSame = await bcrypt.compare(text, hashedText);
    return isSame;
  }

  async generateJwt(payload: IJwtPayload, expiryInSeconds = 0): Promise<string> {
    const options: Record<string, string> = { algorithm: 'RS256' };
    if (expiryInSeconds) {
      options.expiresIn = expiryForJwt(expiryInSeconds);
    }
    const token = jwt.sign(payload, this.privateKey, options);
    return token;
  }

  async verifyJwt(token: string): Promise<IJwtPayload> {
    const decoded = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
    return decoded as unknown as IJwtPayload; // pretend
  }
}
