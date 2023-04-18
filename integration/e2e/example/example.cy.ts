const tagsArr = (t?: Mocha.GrepTagObject[]): string[] => {
  return t?.map(x => x.tag) ?? [];
};

describe('authentication', () => {
  const tags = (t?: Mocha.Runnable): string => {
    return t?.tags?.join('') ?? '';
  };

  it('not tags test', function () {
    cy.log('no tags');
    cy.log(tags(this.test));
    expect(tagsArr(this.test?.tags)).to.deep.eq([]);
  });

  describe('sign-in/sign-out', { tags: '@smoke' }, () => {
    it('should login @P0 @regression @inlineTag', function () {
      cy.log('should login successfully');
      cy.log(tags(this.test));
      expect(tagsArr(this.test?.tags)).to.deep.eq(['@smoke', '@P0', '@regression', '@inlineTag']);
    });

    it('special case on login', { tags: ['@P2', '@regression'] }, function () {
      cy.log('should login on special case');
      cy.log(tags(this.test));
      expect(tagsArr(this.test?.tags)).to.deep.eq(['@smoke', '@P2', '@regression']);
    });

    describe('suite with tag', { tags: ['@spec'] }, () => {
      it('suite with tag', function () {
        cy.log('suite with tag');
        cy.log(tags(this.test));
        expect(tagsArr(this.test?.tags)).to.deep.eq(['@spec', '@smoke']);
      });
    });

    describe('suite with tag inl @inlineTagSuite', () => {
      it('suite with inlineTagSuite', function () {
        cy.log('suite with inlineTagSuite');
        cy.log(tags(this.test));
        expect(tagsArr(this.test?.tags)).to.deep.eq(['@inlineTagSuite', '@smoke']);
      });
    });

    describe('logout (no tags suite)', () => {
      it('should logout @P1', function () {
        cy.log('should logout');
        cy.log(tags(this.test));
        expect(tagsArr(this.test?.tags)).to.deep.eq(['@smoke', '@P1']);
      });

      it('should logout without tags', { tags: '@testTag' }, function () {
        cy.log('should logout no tags');
        cy.log(tags(this.test));
        expect(tagsArr(this.test?.tags)).to.deep.eq(['@smoke', '@testTag']);
      });
    });
  });
});

describe('second parent suite', () => {
  it('check no tags', function () {
    expect(tagsArr(this.test?.tags)).to.deep.eq([]);
  });
});

describe('another parent suite with tag @parent', { tags: ['@parent2'] }, () => {
  it('check tags', function () {
    expect(tagsArr(this.test?.tags)).to.deep.eq(['@parent2', '@parent']);
  });
});
