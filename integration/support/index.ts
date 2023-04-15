import { myPluginSetup } from 'cy-local';
import { COVERAGE } from '../common/constants';

const setupCoverage = () => {
  if (Cypress.env(COVERAGE) === 'true' || Cypress.env(COVERAGE) === true) {
    console.log('ENABLE COV');
    require('@cypress/code-coverage/support');
  } else {
    console.log('COVERAGE NOT ENABLED IN BROWSER');
  }
};
setupCoverage();

myPluginSetup({
  addControlToUI: Cypress.env('GREP_SHOW_UI_CONTROL') === 'true' || Cypress.env('GREP_SHOW_UI_CONTROL') === true,
  showTagsInTitle: Cypress.env('GREP_SHOW_TAGS_IN_TITLE') === 'true' || Cypress.env('GREP_SHOW_TAGS_IN_TITLE') === true,
});
