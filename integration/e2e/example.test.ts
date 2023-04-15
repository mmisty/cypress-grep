describe('authentication', () => {
  it('not tags test', () => {
    cy.log('no tags');
  });
  describe('sign-in/sign-out', { tags: '@smoke' }, () => {
    it('should login @P0 @regression @inlineTag', () => {
      cy.log('should login successfully');
    });

    it('special case on login', { tags: ['@P1', '@regression'] }, () => {
      cy.log('should login on special case');
    });

    describe('logout (no tags suite)', () => {
      it('should logout @P1', function () {
        cy.log('should logout');
        // todo type
        cy.log(this.test?.tags);
      });

      it('should logout without tags', function () {
        cy.log('should logout no tags');
        cy.log(this.test?.tags);
      });
    });
  });
});
