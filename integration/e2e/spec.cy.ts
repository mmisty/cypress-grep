import { checkCov } from 'cy-local/utils';
import { something } from 'cy-local';

describe('empty spec1', { tags: ['@parent'] }, () => {
  it('passes just parent', { tags: '@P1' }, () => {
    expect(checkCov('cypress')).eq('cypress');
  });
  describe('empty spec2', { tags: ['@hell'] }, () => {
    describe('empty spec3', { tags: ['@deep'] }, () => {
      it('passes t1', { tags: ['@t1'] }, () => {
        expect(checkCov('cypress')).eq('cypress');
      });

      it('passes t2', { tags: '@t2' }, () => {
        expect(checkCov('cypress')).eq('cypress');
      });

      it.skip('passes 2', { tags: '@skipped' }, () => {
        something();

        expect(something).not.to.throw();
      });

      it('passes t4', { tags: '@t4' }, () => {
        expect(checkCov('cypress')).eq('cypress');
      });
    });
  });

  it('passes t41 @tagInTitle', () => {
    expect(checkCov('cypress')).eq('cypress');
  });
  it('passes t4 @tagInTitle', () => {
    expect(checkCov('cypress')).eq('cypress');
  });
  it('passes t43 @tagInTitle', () => {
    expect(checkCov('cypress')).eq('cypress');
  });
  it('passes t44 @tagInTitle', () => {
    expect(checkCov('cypress')).eq('cypress');
  });
  it('passes t45 @tagInTitle', () => {
    expect(checkCov('cypress')).eq('cypress');
  });
  it('passes t4 @tagInTitle', () => {
    expect(checkCov('cypress')).eq('cypress');
  });
});
