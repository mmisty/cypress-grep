// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./cypress/cypress.ts" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./mocha/index.ts" />
import { registerCypressGrep } from './setup';

// this is to import with ECMS2015 syntax
// import '@mmisty/cypress-grep/register';
registerCypressGrep();
