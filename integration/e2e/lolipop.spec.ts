describe('one tes @lolipop', { tags: ['@parent2'] }, () => {
  it('check tags', function () {
    expect(this.test?.tags?.map(t => t.tag)).to.deep.eq(['@parent2', '@lolipop']);
  });
});
