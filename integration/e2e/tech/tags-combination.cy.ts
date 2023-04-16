import { suiteTest } from './helper';

const toTest = () => {
  describe('suite @regressionInline', { tags: ['@smoke'] }, () => {
    it('test inside1 apple @P0Inline', { tags: ['@R1', '@R2'] }, () => {
      cy.log('1');
    });

    it('test inside2 banana @P1Inline', { tags: '@R3' }, () => {
      cy.log('2');
    });
  });
};
describe('1', () => {
  suiteTest('tags combination', '@regression', toTest, [
    '1 parent suite test inside1 apple @smoke @regressionInline @R1 @R2 @P0Inline',
    '1 parent suite test inside2 banana @smoke @regressionInline @R3 @P1Inline',
  ]);
});

describe('2', () => {
  suiteTest('tags combination', '@smoke', toTest, [
    '2 parent suite test inside1 apple @smoke @R1 @R2',
    '2 parent suite test inside2 banana @smoke @R3',
  ]);
});

describe('3', () => {
  suiteTest('tags combination', '@regression', toTest, [
    '3 parent suite test inside1 apple @smoke @R1 @R2',
    '3 parent suite test inside2 banana @smoke @R3',
  ]);
});

/*describe('4', () => {
  suiteTest('tags combination', '@P0', toTest, [
    '4 parent suite test inside1 apple @smoke @regressionInline @R1 @R2 @P0Inline',
  ]);
});

suiteTest('tags combination', '@R1', toTest, [result[0]]);
suiteTest('tags combination', '@P1', toTest, [result[1]]);
suiteTest('tags combination', '@R3', toTest, [result[1]]);
suiteTest('tags combination with OR', '@P0|@P1', toTest, result);
suiteTest('tags combination with AND', '@regression&@P0', toTest, [result[0]]);
suiteTest('tags combination with AND and NOT', '@regression&!@P1', toTest, [result[0]]);
suiteTest('tags combination with NOT', '!@regression', toTest, []);
suiteTest('tags combination with NOT regexp', '=/@regression[^\\w@]+/i', toTest, []);
suiteTest('tags combination with regexp', '=/@regressionInline[^\\w@]+/i', toTest, result);
suiteTest('tags combination with NOT', '!@smoke', toTest, []);*/
