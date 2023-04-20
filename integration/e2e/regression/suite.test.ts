// when several suited in root doesnot fins test with inline tags

describe('p2', () => {
  it('test1', function () {
    expect(this.test?.tags?.map(t => t.tag)).to.deep.eq([]);
  });
});

// this fails when not showing tags
describe('p31 @inline1', () => {
  const tags = (t?: Mocha.Runnable): string => {
    return t?.tags?.join('') ?? '';
  };

  const tagsArr = (t?: Mocha.GrepTagObject[]): string[] => {
    return t?.map(x => x.tag) ?? [];
  };

  it('test2', function () {
    expect(this.test?.tags?.map(t => t.tag)).to.deep.eq(['@inline1']);
  });

  describe('p32 @inline2', { tags: '@smoke' }, () => {
    it('test3', function () {
      expect(this.test?.tags?.map(t => t.tag)).to.deep.eq(['@smoke', '@inline2', '@inline1']);
    });

    it('should login @P0 @regression @inlineTag', function () {
      cy.log('should login successfully');
      cy.log(tags(this.test));
      expect(tagsArr(this.test?.tags)).to.deep.eq([
        '@smoke',
        '@inline2',
        '@inline1',
        '@P0',
        '@regression',
        '@inlineTag',
      ]);
    });

    it('special case on login', { tags: ['@P2', '@regression'] }, function () {
      cy.log('should login on special case');
      cy.log(tags(this.test));
      expect(tagsArr(this.test?.tags)).to.deep.eq(['@smoke', '@inline2', '@inline1', '@P2', '@regression']);
    });

    describe('p33 @inline3', () => {
      it('test3', function () {
        expect(this.test?.tags?.map(t => t.tag)).to.deep.eq(['@inline3', '@smoke', '@inline2', '@inline1']);
      });
    });
  });
});

it('Test in the root @inlineTestRoot', { tags: ['@testRoot'] }, function () {
  expect(this.test?.tags?.map(t => t.tag)).to.deep.eq(['@testRoot', '@inlineTestRoot']);
});
