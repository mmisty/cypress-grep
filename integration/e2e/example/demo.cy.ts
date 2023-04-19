describe('demo cypress-grep', { tags: '@smoke', baseUrl: 'https://example.cypress.io/' }, () => {
  it('01 should visit app', () => {
    cy.visit('/');
    cy.get('h1').should('have.text', 'Kitchen Sink');
  });

  describe('utilities @utilities', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('02 should navigate to Utilities by clicking menu item', { tags: ['@navbar'] }, () => {
      cy.get('#navbar').contains('Utilities').click();
      cy.get('h1').should('have.text', 'Utilities');
    });
  });

  describe('cypress.api @cyApi', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('03 should navigate to Cypress API by clicking menu item', { tags: ['@navbar'] }, () => {
      cy.get('#navbar').contains('Cypress API').click();
      cy.get('h1').should('have.text', 'Cypress API');
    });

    it('04 Cypress Api commands should be visible', () => {
      cy.get('#navbar').contains('Cypress API').click();
      cy.get('#api-commands').should('be.visible');
    });
  });
});
