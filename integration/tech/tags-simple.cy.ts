import { suiteTest } from './helper';

const toTest = () => {
  describe('suite', { tags: '@regression' }, () => {
    it('test inside1 apple', { tags: '@P0' }, () => {
      cy.log('1');
    });

    it('test inside2 banana', { tags: '@P1' }, () => {
      cy.log('2');
    });
  });
};

const result = ['parent suite test inside1 apple @regression @P0', 'parent suite test inside2 banana @regression @P1'];
suiteTest('tags cases all', '@regression', toTest, result);
suiteTest('tags cases one', '@P0', toTest, [result[0]]);
suiteTest('tags cases one', '@P1', toTest, [result[1]]);
suiteTest('tags cases all with OR', '@P0|@P1', toTest, result);
suiteTest('tags cases all with AND', '@regression&@P0', toTest, [result[0]]);
suiteTest('tags cases all with AND and NOT', '@regression&!@P1', toTest, [result[0]]);
