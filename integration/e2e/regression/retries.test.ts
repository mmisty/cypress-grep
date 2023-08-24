describe('retries - should transfer tags to retries @retries', { retries: 1 }, () => {
  afterEach(function () {
    if (
      this.currentTest &&
      this.currentTest.tags &&
      this.currentTest.tags.filter(t => t?.tag == '@failOnPurpose')?.length > 0 &&
      this.currentTest.err?.message.indexOf('Fail on Purpose') !== -1
    ) {
      this.currentTest.state = 'passed';
    }
  });

  it('test @failOnPurpose', function () {
    cy.wrap(null).then(() =>
      expect(this.test?.tags).to.deep.eq([
        { tag: '@retries', info: [] },
        { tag: '@failOnPurpose', info: [] },
      ]),
    );
    throw new Error('Fail on Purpose');
  });
});
