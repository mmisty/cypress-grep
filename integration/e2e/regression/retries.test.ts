describe('retries - should transfer tags to retries', { retries: 1 }, () => {
  afterEach(function () {
    if (
      this.currentTest &&
      this.currentTest.tags &&
      this.currentTest.tags.filter(t => t?.tag == '@failOnPurpose')?.length > 0
    ) {
      this.currentTest.state = 'passed';
    }
  });

  it('test @failOnPurpode', function () {
    throw new Error('Fail on Purpose');
  });
});
