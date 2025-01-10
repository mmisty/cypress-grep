describe('suite', () => {
  it('test @issue("123") @issue("456")', function () {
    expect(this.test?.tags).to.have.length(2);
    expect(this.test?.tags).deep.eq([
      { tag: '@issue', info: ['123'], isOwnTag: true },
      { tag: '@issue', info: ['456'], isOwnTag: true },
    ]);
  });

  it('test with several args @issue("123","description") @issue("456")', function () {
    expect(this.test?.tags).to.have.length(2);
    expect(this.test?.tags).deep.eq([
      { tag: '@issue', info: ['123', 'description'], isOwnTag: true },
      { tag: '@issue', info: ['456'], isOwnTag: true },
    ]);
  });
});
