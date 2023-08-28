import expect from 'expect';
import { createTests, runTests } from '../../utils/helper';
import { readFileSync } from 'fs';
import { basename } from 'path';

describe('many tests', () => {
  const dir = basename(__filename);
  beforeEach(() => {
    for (let i = 0; i < 1000; i++) {
      createTests(
        `one${i}`,
        ['hello no tags', i === 40 ? 'test with tag @oneTag' : 'other test'],
        `reports/tests/${dir}/folder/demo${i}.cy.ts`,
      );
    }
    createTests('two', ['hello', 'second'], `reports/tests/${dir}/demo2.cy.ts`);
  });

  it('should filter one test from many files', () => {
    // const started = Date.now();

    const res = runTests(dir, `specPattern="[reports/tests/${dir}/**/*.*,reports/tests/${dir}/one.*]"`, [
      "--g '@oneTag'",
      '--no-show-excluded-tests',
      '--no-t',
    ]);
    // const durationSec = (Date.now() - started) / 1000;

    expect(res).toEqual([{ name: 'test with tag', status: 'passed' }]);
  });

  it('only-prefilter many from many (all except one)', () => {
    // const started = Date.now();
    runTests(dir, `specPattern="[reports/tests/${dir}/**/*.*,reports/tests/${dir}/one.*]"`, [
      "--g '!@oneTag'",
      '--only-prefilter',
      `--prefilter-file ./reports/${dir}/res.json`,
    ]);
    // const durationSec = (Date.now() - started) / 1000;
    const res = JSON.parse(readFileSync(`./reports/${dir}/res.json`).toString()).tests.length;
    expect(res).toEqual(2001);
  });
});
