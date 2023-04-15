describe('suite', () => {
  it('test', () => {
    cy.visit('https://example.cypress.io/');
    cy.get('div').should('contain.text', 'Kitchen Sink');
  });
});
