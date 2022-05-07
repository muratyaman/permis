import { expect } from 'chai';
import { createClient } from 'redis';
import { PermisService } from '../src';
import { PermisConfigWithRedis } from '../src/configWithRedis';

describe('PermisService', () => {
  it('should load', () => {
    const redis = createClient({ url: 'redis://localhost:6379' }); // TODO: mock redis
    const conf = new PermisConfigWithRedis({}, redis);
    const ps = new PermisService(conf);
    expect(!!ps).to.eq(true);
  });
});
