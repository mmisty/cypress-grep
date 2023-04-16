import { registerCypressGrep } from 'cy-local';

export const suiteTest = (title: string, grep: string, testedSuite: () => void, expected: string[]) => {
  const tests: string[] = [];
  Cypress.env('GREP', grep);
  Cypress.env('TEST_GREP', 'true');

  registerCypressGrep({
    addControlToUI: true,
    showTagsInTitle: false,
    omitFilteredTests: true,
  });

  describe('parent', () => {
    beforeEach(function () {
      tests.push((this.currentTest as any)?.fullTitleWithTags ?? '');
    });

    testedSuite();
  });

  Cypress.env('GREP', '');
  Cypress.env('TEST_GREP', 'true');

  registerCypressGrep({
    addControlToUI: true,
    showTagsInTitle: true,
    omitFilteredTests: true,
  });

  describe(`${title} ${grep}`, () => {
    it(`${title}: check res`, () => {
      expect(tests).deep.eq(expected);
    });
  });
};
