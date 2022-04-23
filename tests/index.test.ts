import { expect } from 'chai';
import { PermisService } from '../src';

describe('PermisService', () => {
  it('should load', () => {
    const ps = new PermisService({});
    expect(!!ps).to.eq(true);
  });
});
