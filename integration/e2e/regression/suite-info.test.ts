import { tag } from '@mmisty/cypress-tags/utils/tags';

// todo  tests for title should not have info
describe('info should be in tags object major test ', { tags: [tag('P1', 'critical')] }, () => {
  it('no self tags', function () {
    const infoForP1 = this.test?.tags?.find(t => t.tag === '@P1');

    expect(infoForP1).to.deep.eq({ tag: '@P1', info: ['critical'] });
    cy.log(`infoForP1: **${infoForP1?.info?.join('')}**`);
  });

  it('object tag with info', { tags: [tag('P2', 'major')] }, function () {
    const infoForP1 = this.test?.tags?.find(t => t.tag === '@P1');
    const infoForP2 = this.test?.tags?.find(t => t.tag === '@P2');

    expect(infoForP1).to.deep.eq({ tag: '@P1', info: ['critical'] });
    expect(infoForP2).to.deep.eq({ tag: '@P2', info: ['major'] });
    cy.log(`infoForP1: **${infoForP1?.info?.join('')}**`);
    cy.log(`infoForP2: **${infoForP2?.info?.join('')}**`);
  });
});
