import { registerCypressGrep } from 'cy-local';

let check = 0;

const toTest = (grep: string, expected: string[]) => {
  const tests: string[] = [];
  Cypress.env('GREP', grep);
  registerCypressGrep({
    showTagsInTitle: true,
    showExcludedTests: true,
    addControlToUI: true,
  });

  describe('suite @regressionInline', { tags: ['@smoke'] }, () => {
    it('test inside1 apple @P0Inline', { tags: ['@R1', '@R2'] }, function () {
      tests.push(this.test?.fullTitle() ?? '');
      cy.log('1');
    });

    it('test inside2 banana @P1Inline', { tags: '@R3' }, function () {
      cy.log('2');
      tests.push(this.test?.fullTitle() ?? '');
    });
  });

  describe('check @res', () => {
    it('check result', () => {
      check++;
      expect(tests).to.deep.eq(expected);
    });
  });
};

const tests = [
  {
    grep: '=/^(?!.*@R1).*/i',
    expected: ['suite @regressionInline test inside2 banana @R3 @P1Inline'],
  },
  {
    grep: '=/^(?!.*@R2).*/i',
    expected: ['suite @regressionInline test inside2 banana @R3 @P1Inline'],
  },
  {
    grep: '=/^(?!.*@R3).*/i',
    expected: ['suite @regressionInline test inside1 apple @R1 @R2 @P0Inline'],
  },
  {
    grep: '=/^(?!.*@R3)(?!.*@R1).*/i',
    expected: [],
  },
  {
    grep: '=/((?=.*@R3)(?=.*@R1).*$)|@res/i',
    expected: [],
  },
];

tests.forEach(t => {
  toTest(t.grep, t.expected);
});

describe('Check executed @res', () => {
  it('Check executed count', () => {
    expect(check).eq(tests.length);
  });
});
