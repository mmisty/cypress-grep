import { tag } from 'cy-local/utils/tags';

it('test no root @P1', () => {
  cy.log('no root');
});

it('test', { tags: [tag('issue', 'example of info')] }, function () {
  const infoForIssue = this.test?.tags;
  cy.log(`${infoForIssue}`);
  expect(infoForIssue).to.deep.eq([{ tag: '@issue("example%20of%20info")' }]);
});
