import expect from 'expect';
import { createTests, runTests } from '../../utils/helper';
import { basename } from '@mmisty/cypress-allure-adapter/common';
import { existsSync, rmSync } from 'fs';

describe('cy-grep script', () => {
  const dir = basename(__filename);
  beforeEach(() => {
    if (existsSync(`reports/tests/${dir}`)) {
      rmSync(`reports/tests/${dir}`, { recursive: true });
    }
  });
  it('should run all tests when no grep (spec pattern as string)', () => {
    createTests('one', ['hello no tags', 'other test'], `reports/tests/${dir}/folder/demo1.cy.ts`);
    createTests('two', ['hello @oneTest', 'second'], `reports/tests/${dir}/demo2.cy.ts`);
    const res = runTests(dir, `specPattern="reports/tests/${dir}/**/*.*"`, ['--no-show-excluded-tests', '--no-t']);

    expect(res).toEqual([
      { name: 'hello', status: 'passed' },
      { name: 'hello no tags', status: 'passed' },
      { name: 'other test', status: 'passed' },
      { name: 'second', status: 'passed' },
    ]);
  });

  it('should run all tests when no grep (spec pattern as array)', () => {
    createTests('one', ['hello no tags', 'other test'], `reports/tests/${dir}/folder/demo1.cy.ts`);
    createTests('two', ['hello @oneTest', 'second'], `reports/tests/${dir}/demo2.cy.ts`);

    const res = runTests(dir, `specPattern="[reports/tests/${dir}/**/*.*,reports/tests/one.*]"`, [
      '--no-show-excluded-tests',
      '--no-t',
    ]);

    expect(res).toEqual([
      { name: 'hello', status: 'passed' },
      { name: 'hello no tags', status: 'passed' },
      { name: 'other test', status: 'passed' },
      { name: 'second', status: 'passed' },
    ]);
  });

  it('should run one test with grep (spec pattern as array)', () => {
    createTests('one', ['hello no tags', 'other test'], `reports/tests/${dir}/folder/demo1.cy.ts`);
    createTests('two', ['hello @oneTest', 'second'], `reports/tests/${dir}/demo2.cy.ts`);

    const res = runTests(dir, `specPattern="[reports/tests/${dir}/**/*.*,reports/tests/one.*]"`, [
      "--g '@oneTest'",
      '--no-show-excluded-tests',
      '--no-t',
    ]);

    expect(res).toEqual([{ name: 'hello', status: 'passed' }]);
  });

  it('should run one test with grep (spec pattern as string)', () => {
    createTests('one', ['hello no tags', 'other test'], `reports/tests/${dir}/folder/demo1.cy.ts`);
    createTests('two', ['hello @oneTest', 'second'], `reports/tests/${dir}/demo2.cy.ts`);

    const res = runTests(dir, `specPattern="reports/tests/${dir}/**/*.*"`, [
      "--g '@oneTest'",
      '--no-show-excluded-tests',
      '--no-t',
    ]);

    expect(res).toEqual([{ name: 'hello', status: 'passed' }]);
  });

  it('should run one test with grep (spec pattern as string) - show excluded', () => {
    createTests('one', ['hello no tags', 'other test'], `reports/tests/${dir}/folder/demo1.cy.ts`);
    createTests('two', ['hello @oneTest', 'second'], `reports/tests/${dir}/demo2.cy.ts`);

    const res = runTests(dir, `specPattern="reports/tests/${dir}/**/*.*"`, [
      "--g '@oneTest'",
      '--show-excluded-tests',
      '--no-t',
    ]);

    expect(res).toEqual([
      { name: 'hello', status: 'passed' },
      { name: 'second', status: 'skipped' },
    ]);
  });
});
