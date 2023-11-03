import { registerCypressGrep } from 'cy-local';
import { prepareTestTitle } from 'cy-local/setup/select-tests';

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
      tests.push(prepareTestTitle(this.test as any) ?? '');
      cy.log('1');
    });

    it('test inside2 banana @P1Inline', { tags: '@R3' }, function () {
      tests.push(prepareTestTitle(this.test as any) ?? '');
      cy.log('2');
    });
  });

  describe('check @res @regression @smoke @R3 @R1 @R2 @P0Inline @P1Inline', () => {
    it('check result', () => {
      check++;
      expect(tests).to.deep.eq(expected);
    });
  });
};

const tests = [
  {
    grep: '@regression',
    expected: [
      'suite test inside1 apple @smoke @regressionInline @R1 @R2 @P0Inline',
      'suite test inside2 banana @smoke @regressionInline @R3 @P1Inline',
    ],
  },
  {
    grep: '@smoke',
    expected: [
      'suite test inside1 apple @smoke @regressionInline @R1 @R2 @P0Inline',
      'suite test inside2 banana @smoke @regressionInline @R3 @P1Inline',
    ],
  },
  {
    grep: '@P0|@P1',
    expected: [
      'suite test inside1 apple @smoke @regressionInline @R1 @R2 @P0Inline',
      'suite test inside2 banana @smoke @regressionInline @R3 @P1Inline',
    ],
  },
  {
    grep: '(!@P0|!@P1)|@res', // @res to have check
    expected: [],
  },
  {
    grep: '@P0',
    expected: ['suite test inside1 apple @smoke @regressionInline @R1 @R2 @P0Inline'],
  },
  {
    grep: '@P1',
    expected: ['suite test inside2 banana @smoke @regressionInline @R3 @P1Inline'],
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
