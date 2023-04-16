import { suiteTest } from './helper';

const toTest = () => {
  describe('suite', () => {
    it('test inside1 apple', () => {
      cy.log('1');
    });

    it('test inside2 banana', () => {
      cy.log('2');
    });
  });
};
describe('1', () => {
  suiteTest('all cases', 'test', toTest, ['1 parent suite test inside1 apple', '1 parent suite test inside2 banana']);
});
suiteTest('none cases', 'tgt', toTest, []);
suiteTest('one case', 'apple', toTest, ['parent suite test inside1 apple']);
