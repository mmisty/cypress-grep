import { setupSelectTests } from 'cy-local/setup/select-tests';
import { selectionTestGrep } from 'cy-local/setup/regexp';
import { addSearchInput, getItemValueForUI, updateCount } from 'cy-local/setup/search-input';

const getGrepExpression = () => {
  const uiValue = getItemValueForUI('#grep');
  console.log(`uiValue: ${uiValue}`);

  // use UI input value only when interactive mode
  if (!Cypress.env('TEST_GREP') && Cypress.config('isInteractive') && uiValue != null) {
    console.log(`storage${uiValue}`);

    return uiValue;
  }

  if (Cypress.env('GREP') != null && Cypress.env('GREP') !== '') {
    console.log(`grep: ${Cypress.env('GREP')}`);

    return Cypress.env('GREP');
  }

  return '';
};

const selectTests = () => {
  const grepSelected = getGrepExpression();
  console.log(`getGrepExpression: ${grepSelected}`);

  if (grepSelected !== '') {
    Cypress.env('showTagsInTitle', 'true');
  }

  return selectionTestGrep(grepSelected);
};

export const registerCypressGrep = (config?: {
  addControlToUI?: boolean;
  showTagsInTitle?: boolean;
  omitFilteredTests?: boolean;
}) => {
  // here you can do setup for each test file in browser
  console.log('REGISTER CYPRESS GREP');
  setupSelectTests(
    selectTests,
    {
      showTagsInTitle: config?.showTagsInTitle ?? false,
      omitFilteredTests: config?.omitFilteredTests ?? false,
    },
    updateCount,
  );

  if (config?.addControlToUI) {
    addSearchInput();
  }
};
