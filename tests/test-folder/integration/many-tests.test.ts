import expect from 'expect';
import { createTests, deleteResults, resSorted, runTests } from '../../utils/helper';
import { readFileSync } from 'fs';
import glob from 'fast-glob';

describe('many tests', () => {
  beforeEach(() => {
    deleteResults();
  });

  beforeEach(() => {
    for (let i = 0; i < 1000; i++) {
      createTests(
        `one${i}`,
        ['hello no tags', i === 40 ? 'test with tag @oneTag' : 'other test'],
        `reports/tests/folder/demo${i}.cy.ts`,
      );
    }
    createTests('two', ['hello', 'second'], 'reports/tests/demo2.cy.ts');
  });

  it('should filter one test from many files', () => {
    const started = Date.now();
    runTests('allure-results', 'specPattern="[reports/tests/**/*.*,reports/tests/one.*]"', [
      "--g '@oneTag'",
      '--no-show-excluded-tests',
      '--no-t',
    ]);
    const durationSec = (Date.now() - started) / 1000;

    expect(resSorted('allure-results')).toEqual([{ name: 'test with tag', status: 'passed' }]);
    expect(durationSec).toBeLessThan(100);
  });

  it('only-prefilter many from many (all except one)', () => {
    const started = Date.now();
    runTests('allure-results', 'specPattern="[reports/tests/**/*.*,reports/tests/one.*]"', [
      "--g '!@oneTag'",
      '--only-prefilter',
      '--prefilter-file ./reports/res.json',
    ]);
    const durationSec = (Date.now() - started) / 1000;
    const files = glob.sync('./reports/res*.json');
    const res = JSON.parse(readFileSync(files[0]).toString()).tests.length;
    expect(res).toEqual(2001);
    expect(durationSec).toBeLessThan(100);
  });
});
