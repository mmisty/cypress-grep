describe('suite', () => {
  describe('smoke @smoke', () => {
    it('apple @p1', () => {
      cy.log('1');
    });

    it('banana @p2', () => {
      cy.log('2');
    });
  });

  it('cracker', () => {
    cy.log('3');
  });
});
