describe('suite', () => {
  describe('smoke @smoke', () => {
    it('apple @p1', () => {
      cy.log('1');
    });

    describe('sub suite with inline tag @candy', { tags: '@fruit' }, () => {
      it('test in suite with inline tag @R3', function () {
        expect(this.test?.tags?.map(t => t.tag)).to.deep.eq(['@R3', '@fruit', '@candy', '@smoke']);
      });
    });

    it('banana @p2', { tags: ['@R1', '@R1'] }, function () {
      cy.log('2');
    });

    it('orange @p2("some info")', function () {
      cy.log(JSON.stringify(this.test?.tags?.map(t => t.tag)));
    });
  });

  it('cracker', () => {
    cy.log('3');
  });
});
