import { registerCypressGrep } from 'cy-local';
import { COVERAGE } from '../common/constants';

const setupCoverage = () => {
  if (Cypress.env(COVERAGE) === 'true' || Cypress.env(COVERAGE) === true) {
    console.log('ENABLE COV');
    require('@cypress/code-coverage/support');
  } else {
    console.log('COVERAGE NOT ENABLED IN BROWSER');
  }
};

const valBoolEq = (name: string, value: boolean): boolean => {
  return Cypress.env(name) === `${value}` || Cypress.env(name) === value;
};

setupCoverage();

registerCypressGrep({
  addControlToUI: valBoolEq('GREP_SHOW_UI_CONTROL', true),
  showTagsInTitle: valBoolEq('GREP_SHOW_TAGS_IN_TITLE', true),
  showExcludedTests: valBoolEq('GREP_SHOW_EXCLUDED_TESTS', true),
});
