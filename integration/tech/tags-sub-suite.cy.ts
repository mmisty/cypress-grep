import { suiteTest } from './helper';

const toTest = () => {
  describe('suite regression', { tags: '@regression' }, () => {
    it('test inside1 apple', { tags: '@P0' }, () => {
      cy.log('1');
    });

    it('test inside2 banana', { tags: '@P1' }, () => {
      cy.log('2');
    });

    describe('sub-suite sub', { tags: '@sub' }, () => {
      it('test inside3 cinamon', { tags: '@P3' }, () => {
        cy.log('2');
      });
    });

    describe('sub-suite empty', () => {
      it('test inside4 devil', { tags: '@P3' }, () => {
        cy.log('2');
      });
    });
  });
};

const resulAll = [
  'parent suite regression test inside1 apple @regression @P0',
  'parent suite regression test inside2 banana @regression @P1',
  'parent suite regression sub-suite sub test inside3 cinamon @sub @regression @P3',
  'parent suite regression sub-suite empty test inside4 devil @regression @P3',
];

suiteTest('tags cases all', '@regression', toTest, resulAll);
suiteTest('tags cases sub', '@sub', toTest, [resulAll[2]]);
suiteTest('tags cases sub', '@regression&!@sub', toTest, [...resulAll.slice(0, 2), resulAll[3]]);
