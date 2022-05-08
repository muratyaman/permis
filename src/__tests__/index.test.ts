import { expect } from 'chai';
import { createClient } from 'redis';
import { PermisService } from '../';
import { PermisConfigWithRedis } from '../configWithRedis';

describe('PermisService', () => {
  it('should load', () => {
    const redis = createClient({ url: 'redis://localhost:6379' }); // TODO: mock redis
    const conf = new PermisConfigWithRedis({
      options: {
        selfUrl:   'http://localhost',
        privateKey: Buffer.from('test'),
        publicKey:  Buffer.from('test'),
      },
    }, redis);
    const ps = new PermisService(conf);
    expect(!!ps).to.eq(true);
  });
});
