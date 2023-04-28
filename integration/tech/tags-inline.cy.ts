import { suiteTest } from './helper';

const toTest = () => {
  describe('suite @regressionInline', () => {
    it('test inside1 apple @P0Inline', () => {
      cy.log('1');
    });

    it('test inside2 banana @P1Inline', () => {
      cy.log('2');
    });
  });
};

const result = [
  'parent suite test inside1 apple @regressionInline @P0Inline',
  'parent suite test inside2 banana @regressionInline @P1Inline',
];
suiteTest('tags cases inline', '@regression', toTest, result);
/*suiteTest('tags cases one', '@P0', toTest, ['parent suite @regressionInline test inside1 apple @P0Inline']);
suiteTest('tags cases one', '@P1', toTest, ['parent suite @regressionInline test inside2 banana @P1Inline']);
suiteTest('tags cases all with OR', '@P0|@P1', toTest, [
  'parent suite @regressionInline test inside1 apple @P0Inline',
  'parent suite @regressionInline test inside2 banana @P1Inline',
]);

suiteTest('tags cases all with AND', '@regression&@P0', toTest, [
  'parent suite @regressionInline test inside1 apple @P0Inline',
]);
suiteTest('tags cases all with AND and NOT', '@regression&!@P1', toTest, [
  'parent suite @regressionInline test inside1 apple @P0Inline',
]);*/
// suiteTest('tags cases all with NOT', '!@regression', toTest, []);
