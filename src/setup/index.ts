import { setupSelectTests } from 'cy-local/setup/select-tests';
import { selectionTestGrep } from 'cy-local/setup/regexp';
import { addSearchInput, getItemValueForUI, updateCount } from 'cy-local/setup/search-input';
import { cypressAppSelect } from 'cypress-controls-ext';
import { GrepConfig } from 'cy-local/setup/config.type';

const getGrepExpression = () => {
  const uiValue = getItemValueForUI('#grep');

  // use UI input value only when interactive mode
  if (!Cypress.env('TEST_GREP') && Cypress.config('isInteractive') && uiValue != null) {
    return uiValue;
  }

  if (Cypress.env('GREP') != null && Cypress.env('GREP') !== '') {
    return Cypress.env('GREP');
  }

  return '';
};

const selectTests = () => {
  const grepSelected = getGrepExpression();

  return selectionTestGrep(grepSelected);
};

const elVal = (selector: string, dataSelector: string, initial?: boolean) => {
  const el = cypressAppSelect(selector);

  if (!el.attr(dataSelector) && (initial !== undefined || initial)) {
    el.attr(dataSelector, initial ? 'true' : 'false');
  }

  return el.attr(dataSelector) === 'true';
};

export const registerCypressGrep = (config?: GrepConfig) => {
  // here you can do setup for each test file in browser
  if (config?.debugLog) {
    console.log('REGISTER CYPRESS GREP');
  }
  let showTagsInTitle: boolean | undefined;
  let showExcludedTests: boolean | undefined;

  if (Cypress.config('isInteractive')) {
    showTagsInTitle = elVal('.show-tags', 'data-show-tags', config?.showTagsInTitle);
    showExcludedTests = elVal('.show-pending', 'data-show-pending', config?.showExcludedTests);
  } else {
    showTagsInTitle = config?.showTagsInTitle ?? false;
    showExcludedTests = config?.showExcludedTests ?? false;
  }

  if (config?.addControlToUI) {
    addSearchInput(showTagsInTitle, showExcludedTests);
  }

  setupSelectTests(selectTests, { ...config, showTagsInTitle, showExcludedTests }, updateCount);
};
