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

suiteTest('tags cases all with NOT', '!@regression', toTest, []);
