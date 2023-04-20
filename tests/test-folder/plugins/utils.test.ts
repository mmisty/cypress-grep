import expect from 'expect';
import { getRootFolder } from '../../../src/plugins/utils';
import { globMock } from '../../mocks/cy-mock';
import { consoleMock } from '../../mocks/console-mock';

describe('plugins utils', () => {
  describe('root folder', () => {
    its()
      .each([
        { pattern: '', foundFsItems: [], warn: 'Error: Spec pattern not specified', exp: 'test/rt' },
        { pattern: [], foundFsItems: ['mocked/test.ts'], exp: 'mocked' },
        { pattern: ['i'], foundFsItems: [], warn: 'Error: Not found tests by specPattern `i`', exp: 'test/rt' },
        {
          desc: 'common without folders',
          pattern: ['integration/*'],
          foundFsItems: ['integration/test1.ts', 'integration/test2.ts'],
          exp: 'integration',
        },
        {
          desc: 'common with subfolder',
          pattern: ['integration/**/*.ts'],
          foundFsItems: ['integration/test1.ts', 'integration/test2.ts', 'integration/tests/test2.ts'],
          exp: 'integration',
        },
        {
          desc: 'no common',
          pattern: ['integration/**/*.ts', 'src/*'],
          foundFsItems: ['integration/test1.ts', 'integration/test2.ts', 'src/tests/test2.ts'],
          exp: '',
        },
        {
          desc: 'no common with more pattern',
          pattern: ['integration/**/*.ts', 'src/**/*.ts'],
          foundFsItems: ['integration/test1.ts', 'integration/test2.ts', 'src/tests/test2.ts'],
          exp: '',
        },
        {
          desc: 'several patterns, pattern array of one string',
          pattern: ['integration/**/*.ts', 'integration/*.json'],
          foundFsItems: ['integration/test1.ts', 'integration/test2.ts', 'integration/data.json'],
          exp: 'integration',
        },
        {
          desc: 'pattern array of one string',
          pattern: ['integration/e2e/**/*.(cy|test).{ts,js}'],
          foundFsItems: ['integration/e2e/test1.ts', 'integration/e2e/test2.js', 'integration/e2e/sub/test3.js'],
          exp: 'integration/e2e',
        },
        {
          desc: 'pattern one string',
          pattern: 'integration/e2e/**/*.(cy|test).{ts,js}',
          foundFsItems: ['integration/e2e/test1.ts', 'integration/e2e/test2.js', 'integration/e2e/sub/test3.js'],
          exp: 'integration/e2e',
        },
      ])
      .run(t => {
        const mock = globMock();
        const mockConsole = consoleMock();

        mock.sync(() => {
          return t.foundFsItems;
        });
        const root = getRootFolder(t.pattern, 'test/rt');

        expect(root).toEqual(t.exp);

        if (t.warn) {
          expect(mockConsole.warn.mock.calls[0]).toEqual([
            `[cypress-grep] Could not get root tests folder: \n   ${t.warn}`,
          ]);
        } else {
          expect(mockConsole.warn.mock.calls).toHaveLength(0);
        }
      });
  });
});
