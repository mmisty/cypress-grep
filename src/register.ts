// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./cypress/cypress.ts" />
import { registerCypressGrep } from './setup';
import { grepEnvVars } from './common/envVars';

// this is to import with ECMS2015 syntax
// import '@mmisty/cypress-grep/register';
registerCypressGrep({
  addControlToUI:
    // default true
    Cypress.env(grepEnvVars.addControlToUI) === undefined ||
    Cypress.env(grepEnvVars.addControlToUI) === 'true' ||
    Cypress.env(grepEnvVars.addControlToUI) === true,

  showTagsInTitle:
    // default true
    Cypress.env(grepEnvVars.showTagsInTitle) === undefined ||
    Cypress.env(grepEnvVars.showTagsInTitle) === 'true' ||
    Cypress.env(grepEnvVars.showTagsInTitle) === true,

  showExcludedTests:
    // default true
    Cypress.env(grepEnvVars.showExcludedTests) === undefined ||
    Cypress.env(grepEnvVars.showExcludedTests) === 'true' ||
    Cypress.env(grepEnvVars.showExcludedTests) === true,
});
