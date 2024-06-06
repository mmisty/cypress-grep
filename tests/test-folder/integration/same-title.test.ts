import expect from 'expect';
import { createTestsWithTags, deleteResults, resSorted, runTests } from '../../utils/helper';

describe('test with the same title', () => {
  beforeEach(() => {
    deleteResults();
  });

  it('should filter one test when test names are the same but different tags', () => {
    createTestsWithTags(
      'two',
      [
        { name: 'hello', tags: ['@t1'] },
        { name: 'hello', tags: ['@t2'] },
      ],
      'reports/tests/demo2.cy.ts',
    );
    runTests('allure-results', 'specPattern="[reports/tests/demo2.cy.ts]"', [
      "--g '@t1'",
      '--no-show-excluded-tests',
      '--no-t',
    ]);

    expect(resSorted('allure-results')).toEqual([{ name: 'hello', status: 'passed' }]);
  });

  it('should filter one test when test names are the same but different tags (one with no tags)', () => {
    createTestsWithTags(
      'two',
      [
        { name: 'hello', tags: ['@t1'] },
        { name: 'hello', tags: [] },
      ],
      'reports/tests/demo2.cy.ts',
    );
    runTests('allure-results', 'specPattern="[reports/tests/demo2.cy.ts]"', [
      "--g '@t1'",
      '--no-show-excluded-tests',
      '--no-t',
    ]);

    expect(resSorted('allure-results')).toEqual([{ name: 'hello', status: 'passed' }]);
  });
});
