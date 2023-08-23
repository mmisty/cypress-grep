import { COVERAGE } from '../common/constants';
import { redirectTestLogs } from 'cypress-redirect-browser-log';
import { allureAdapterSetup } from '@mmisty/cypress-allure-adapter';
import 'cy-local/register';

const setupCoverage = () => {
  if (Cypress.env(COVERAGE) === 'true' || Cypress.env(COVERAGE) === true) {
    console.log('ENABLE COV');
    require('@cypress/code-coverage/support');
  } else {
    console.log('COVERAGE NOT ENABLED IN BROWSER');
  }
};

setupCoverage();
redirectTestLogs({
  isLogCommandDetails: false,
});

/*
const valBoolEq = (name: string, value: boolean): boolean => {
  return Cypress.env(name) === `${value}` || Cypress.env(name) === value;
};

registerCypressGrep({
  addControlToUI: valBoolEq('GREP_SHOW_UI_CONTROL', true),
  showTagsInTitle: valBoolEq('GREP_SHOW_TAGS_IN_TITLE', true),
  showExcludedTests: valBoolEq('GREP_SHOW_EXCLUDED_TESTS', true),
  debugLog: true,
});*/

allureAdapterSetup();
