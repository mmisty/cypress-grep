import { tag } from '@mmisty/cypress-tags/utils/tags';

it('test no root @P1', () => {
  cy.log('no root');
});

it(`test ${tag('P1', 'critical')}`, { tags: [tag('issue', 'example of info')] }, function () {
  const infoForIssue = this.test?.tags?.find(t => t.tag === '@issue');
  const infoForP1 = this.test?.tags?.find(t => t.tag === '@P1');

  expect(infoForIssue).to.deep.eq({ tag: '@issue', info: ['example of info'], isOwnTag: true });
  expect(infoForP1).to.deep.eq({ tag: '@P1', info: ['critical'], isOwnTag: true });
  cy.log(`infoForIssue: **${infoForIssue?.info?.join('')}**`);
  cy.log(`infoForP1: **${infoForP1?.info?.join('')}**`);
});
