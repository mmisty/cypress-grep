import expect from 'expect';
import { createTests, deleteResults, resSorted, runTests } from '../../utils/helper';
import { readFileSync } from 'fs';

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
});
