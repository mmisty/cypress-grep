import expect from 'expect';
import { getRootFolder } from '../../../src/plugins/utils';

describe('plugins utils', () => {
  describe('root folder', () => {
    its()
      .each([
        { pattern: [], exp: 'test/rt' },
        { pattern: ['i'], exp: 'test/rt' },
        { pattern: ['integration/*'], exp: 'integration' },
        { pattern: ['integration/**/*.ts'], exp: 'integration' },
        { pattern: ['integration/**/*.ts', 'src/*'], exp: '' },
        { pattern: ['integration/**/*.ts', 'src/**/*.ts'], exp: '' },
        { pattern: ['integration/**/*.ts', 'integration/*.json'], exp: 'integration' },
        { pattern: ['integration/e2e/**/*.(cy|test).{ts,js}'], exp: 'integration/e2e' },
        { pattern: 'integration/e2e/**/*.(cy|test).{ts,js}', exp: 'integration/e2e' },
        { pattern: '', exp: 'test/rt' },
      ])
      .run(async t => {
        const root = await getRootFolder(t.pattern, 'test/rt');

        expect(root).toEqual(t.exp);
      });
  });
});
