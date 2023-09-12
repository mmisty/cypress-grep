import { createTests, createTestsTagsObj, deleteResults, resSorted, runTests } from '../../utils/helper';
import expect from 'expect';
import { existsSync, rmSync } from 'fs';

describe('test tags object', () => {
  beforeEach(() => {
    deleteResults();
  });

  its()
    .each([
      {
        desc: 'pattern as string',
        file: 'reports/tests1/folder/demo1.cy.ts',
        file2: 'reports/tests1/demo2.cy.ts',
        pattern: 'specPattern="reports/tests1/**/*.*"',
      },
      {
        desc: 'pattern as array',
        file: 'reports/tests1/folder/demo1.cy.ts',
        file2: 'reports/tests1/demo2.cy.ts',
        pattern: 'specPattern="[reports/tests1/**/*.*,reports/tests1/one.*]"',
      },
    ])
    .each([
      {
        desc: '01 Should run all tests no tags (as array)',
        args: ['--no-show-excluded-tests', '--no-t'],
        suite: 'Single',
        suiteTags: [],
        tests: [{ title: 'hello no tags', tags: [] }],
        expected: [
          { name: 'hello', status: 'passed' },
          { name: 'hello no tags', status: 'passed' },
          { name: 'second', status: 'passed' },
        ],
      },
      {
        desc: '02 Should run only tests with tags specified by grep (as array)',
        args: ["--grep '@myTest'", '--no-show-excluded-tests', '--no-t'],
        suite: 'Single',
        suiteTags: ['@suite'],
        tests: [
          { title: '01. hello tag', tags: ['@myTest'] },
          { title: '02. hello tag', tags: undefined },
        ],
        expected: [{ name: '01. hello tag', status: 'passed' }],
      },
      {
        desc: '03 Should run only tests with tags specified by grep (as string)',
        args: ["--grep '@myTest'", '--no-show-excluded-tests', '--no-t'],
        suite: 'Single',
        suiteTags: ['@suite'],
        tests: [
          { title: '01. hello tag', tags: '@myTest' },
          { title: '02. hello tag', tags: undefined },
        ],
        expected: [{ name: '01. hello tag', status: 'passed' }],
      },
      {
        desc: '04 Should run only tests with tags specified by grep (show-excluded-tests)',
        args: ["--grep '@myTest'", '--show-excluded-tests', '--no-t'],
        suite: 'Single',
        suiteTags: ['@suite'],
        tests: [
          { title: '01. hello tag', tags: ['@myTest'] },
          { title: '02. hello tag', tags: undefined },
        ],
        expected: [
          { name: '01. hello tag', status: 'passed' },
          { name: '02. hello tag', status: 'skipped' },
        ],
      },
      {
        desc: '05 Should run only tests with tags specified by grep (show-tags-title)',
        args: ["--grep '@myTest'", '--show-tags-title'],
        suite: 'Single',
        suiteTags: ['@suite'],
        tests: [
          { title: '01. hello tag', tags: ['@myTest'] },
          { title: '02. hello tag', tags: undefined },
        ],
        expected: [
          { name: '01. hello tag @myTest', status: 'passed' },
          { name: '02. hello tag', status: 'skipped' },
        ],
      },
      {
        desc: '06 Should run only tests with tags specified by grep - suite tag',
        args: ["--grep '@suite'", '--no-t'],
        suite: 'Single',
        suiteTags: ['@suite'],
        tests: [
          { title: '01. apple', tags: ['@myTest'] },
          { title: '02. banana', tags: undefined },
          { title: '03. orange', tags: '@str' },
        ],
        expected: [
          { name: '01. apple', status: 'passed' },
          { name: '02. banana', status: 'passed' },
          { name: '03. orange', status: 'passed' },
        ],
      },
    ])
    .run(t => {
      const resultFolder = `allure-results/${Date.now()}`;

      if (existsSync(resultFolder)) {
        rmSync(resultFolder, { recursive: true });
      }

      createTestsTagsObj(t.suite, t.suiteTags, t.tests, t.file);
      createTests('other', ['hello @oneTest', 'second'], t.file2);

      runTests(resultFolder, t.pattern, t.args);

      expect(resSorted(resultFolder)).toEqual(t.expected);
    });
});
