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

const elVal = (selector: string, dataSelector: string, initial: boolean): boolean => {
  const el = cypressAppSelect(selector);

  if (!el?.attr('class')) {
    console.log('NOT LOADED YET');

    return initial;
  }

  return el.attr(dataSelector) === 'true';
};

export const registerCypressGrep = (config?: GrepConfig) => {
  const initShowTagsInTitle = config?.showTagsInTitle ?? false;
  const initShowExcludedTests = config?.showExcludedTests ?? false;

  // here you can do setup for each test file in browser
  const log = (message: unknown) => {
    if (config?.debugLog) {
      console.log(message);
    }
  };
  log('REGISTER CYPRESS GREP: ');

  let showTagsInTitle: boolean = initShowTagsInTitle;
  let showExcludedTests: boolean = initShowExcludedTests;

  if (Cypress.config('isInteractive')) {
    showTagsInTitle = elVal('.show-tags', 'data-show-tags', initShowTagsInTitle);
    showExcludedTests = elVal('.show-pending', 'data-show-pending', initShowExcludedTests);
  }

  if (config?.addControlToUI) {
    addSearchInput(showTagsInTitle, showExcludedTests);
  }
  const configEvaluated = { ...config, showTagsInTitle, showExcludedTests };

  log(configEvaluated);
  setupSelectTests(selectTests, configEvaluated, updateCount);
};
