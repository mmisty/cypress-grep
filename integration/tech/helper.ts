import { registerCypressGrep } from 'cy-local';
import { prepareTestTitle } from 'cy-local/setup/select-tests';

export const suiteTest = (title: string, grep: string, testedSuite: () => void, expected: string[]) => {
  const tests: string[] = [];
  Cypress.env('GREP', grep);
  Cypress.env('TEST_GREP', 'true');

  registerCypressGrep({
    addControlToUI: true,
    showTagsInTitle: false,
    showExcludedTests: false,
  });

  describe('parent', () => {
    beforeEach(function () {
      tests.push(prepareTestTitle(this.currentTest as any) ?? '');
    });

    testedSuite();
  });

  Cypress.env('GREP', '');
  Cypress.env('TEST_GREP', 'true');

  registerCypressGrep({
    addControlToUI: true,
    showTagsInTitle: true,
    showExcludedTests: false,
  });

  describe(`${title} ${grep}`, () => {
    it(`${title}: check res`, () => {
      expect(tests).deep.eq(expected);
    });
  });
};
