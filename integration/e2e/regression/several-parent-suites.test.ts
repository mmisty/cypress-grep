// when several suites in root does not find test with inline tags

describe('p2', () => {
  it('test1', function () {
    expect(this.test?.tags?.map(t => t.tag)).to.deep.eq([]);
  });
});

// this fails when not showing tags
describe('p31 @inline1', () => {
  it('test2', function () {
    expect(this.test?.tags?.map(t => t.tag)).to.deep.eq(['@inline1']);
  });
});

describe('p32 @inline2', () => {
  it('test3', function () {
    expect(this.test?.tags?.map(t => t.tag)).to.deep.eq(['@inline2']);
  });
});
