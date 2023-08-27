import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { parseAllure } from 'allure-js-parser';
import expect from 'expect';
import { dirname } from 'path';

const deleteResults = () => {
  if (existsSync('allure-results')) {
    rmSync('allure-results', { recursive: true });
  }

  if (existsSync('reports/tests')) {
    rmSync('reports/tests', { recursive: true });
  }
};

const runTests = (specPattern: string, args: string[] = []) => {
  execSync(
    `cd ${process.cwd()} && node ./.bin/cy-grep.js --script 'COVERAGE_REPORT_DIR=reports/coverage-cypress CYPRESS_COVERAGE=true npm run cy:run -- --config ${specPattern}' ${args.join(
      ' ',
    )}`,
    {
      stdio: 'inherit',
    },
  );
};

const createTests = (suite: string, titles: string[], file: string) => {
  if (!existsSync(`${process.cwd()}/${dirname(file)}`)) {
    mkdirSync(dirname(`${process.cwd()}/${file}`), { recursive: true });
  }

  const tests = titles
    .map(
      t => `it('${t}', () => {
    cy.log('test');
  })`,
    )
    .join('\n');

  writeFileSync(file, `describe("${suite}", () => {${tests}})`);
};

const resSorted = () => {
  return parseAllure('allure-results')
    .map(t => ({ name: t.name, status: t.status }))
    .sort((a, b) => (a.name && b.name && a.name < b.name ? -1 : 1));
};

describe('cy-grep script', () => {
  beforeEach(() => {
    deleteResults();
  });

  it('should run all tests when no grep (spec pattern as string)', () => {
    createTests('one', ['hello no tags', 'other test'], 'reports/tests/folder/demo1.cy.ts');
    createTests('two', ['hello @oneTest', 'second'], 'reports/tests/demo2.cy.ts');
    runTests('specPattern="reports/tests/**/*.*"', ['--no-show-excluded-tests']);

    expect(resSorted()).toEqual([
      { name: 'hello', status: 'passed' },
      { name: 'hello no tags', status: 'passed' },
      { name: 'other test', status: 'passed' },
      { name: 'second', status: 'passed' },
    ]);
  });

  it('should run all tests when no grep (spec pattern as array)', () => {
    createTests('one', ['hello no tags', 'other test'], 'reports/tests/folder/demo1.cy.ts');
    createTests('two', ['hello @oneTest', 'second'], 'reports/tests/demo2.cy.ts');
    runTests('specPattern="[reports/tests/**/*.*,reports/tests/one.*]"', ['--no-show-excluded-tests']);

    expect(resSorted()).toEqual([
      { name: 'hello', status: 'passed' },
      { name: 'hello no tags', status: 'passed' },
      { name: 'other test', status: 'passed' },
      { name: 'second', status: 'passed' },
    ]);
  });

  it('should run one test with grep (spec pattern as array)', () => {
    createTests('one', ['hello no tags', 'other test'], 'reports/tests/folder/demo1.cy.ts');
    createTests('two', ['hello @oneTest', 'second'], 'reports/tests/demo2.cy.ts');
    runTests('specPattern="[reports/tests/**/*.*,reports/tests/one.*]"', [
      "--g '@oneTest'",
      '--no-show-excluded-tests',
    ]);

    expect(resSorted()).toEqual([{ name: 'hello', status: 'passed' }]);
  });

  it('should run one test with grep (spec pattern as string)', () => {
    createTests('one', ['hello no tags', 'other test'], 'reports/tests/folder/demo1.cy.ts');
    createTests('two', ['hello @oneTest', 'second'], 'reports/tests/demo2.cy.ts');
    runTests('specPattern="reports/tests/**/*.*"', ["--g '@oneTest'", '--no-show-excluded-tests']);

    expect(resSorted()).toEqual([{ name: 'hello', status: 'passed' }]);
  });

  it('should run one test with grep (spec pattern as string) - show excluded', () => {
    createTests('one', ['hello no tags', 'other test'], 'reports/tests/folder/demo1.cy.ts');
    createTests('two', ['hello @oneTest', 'second'], 'reports/tests/demo2.cy.ts');
    runTests('specPattern="reports/tests/**/*.*"', ["--g '@oneTest'", '--show-excluded-tests']);

    expect(resSorted()).toEqual([
      { name: 'hello', status: 'passed' },
      { name: 'second', status: 'skipped' },
    ]);
  });

  describe('many tests', () => {
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
      runTests('specPattern="[reports/tests/**/*.*,reports/tests/one.*]"', [
        "--g '@oneTag'",
        '--no-show-excluded-tests',
      ]);
      const durationSec = (Date.now() - started) / 1000;

      expect(resSorted()).toEqual([{ name: 'test with tag', status: 'passed' }]);
      expect(durationSec).toBeLessThan(60);
    });

    it('only-prefilter many from many (all except one)', () => {
      const started = Date.now();
      runTests('specPattern="[reports/tests/**/*.*,reports/tests/one.*]"', [
        "--g '!@oneTag'",
        '--only-prefilter',
        '--prefilter-file ./reports/res.json',
      ]);
      const durationSec = (Date.now() - started) / 1000;
      const res = JSON.parse(readFileSync('./reports/res.json').toString()).tests.length;
      expect(res).toEqual(2001);
      expect(durationSec).toBeLessThan(60);
    });
  });
});
