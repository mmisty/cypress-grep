import { createTests, createTestsTagsObj, runTests } from '../../utils/helper';
import expect from 'expect';
import { existsSync, rmSync } from 'fs';
import { basename } from 'path';

describe('test tags object', () => {
  its()
    .each([{ folder: basename(__filename) }])
    .each(t => [
      {
        desc: 'pattern as string',
        file: `reports/tests/${t.folder}/folder/demo1.cy.ts`,
        file2: `reports/tests/${t.folder}/demo2.cy.ts`,
        pattern: `specPattern="reports/tests/${t.folder}/**/*.*"`,
      },
      {
        desc: 'pattern as array',
        file: `reports/tests/${t.folder}/folder/demo1.cy.ts`,
        file2: `reports/tests/${t.folder}/demo2.cy.ts`,
        pattern: `specPattern="[reports/tests/${t.folder}/**/*.*,reports/tests/${t.folder}/one.*]"`,
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
    // .only(t => t.id == 1)
    .run(t => {
      if (existsSync(`reports/tests/${t.folder}`)) {
        rmSync(`reports/tests/${t.folder}`, { recursive: true });
      }
      createTestsTagsObj(t.suite, t.suiteTags, t.tests, t.file);
      createTests('other', ['hello @oneTest', 'second'], t.file2);

      const res = runTests(t.folder, t.pattern, t.args);

      expect(res).toEqual(t.expected);
    });
});
