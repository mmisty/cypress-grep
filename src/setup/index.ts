import { setupSelectTests } from './select-tests';
import { selectionTestGrep } from './regexp';
import { addSearchInput, updateCount } from './search-input';
import { cypressAppSelect } from 'cypress-controls-ext';
import { GrepConfig } from './config.types';
import { envVar, isEnvTrue } from '../common/envVars';

export const isInteractive = () => {
  // INTER env var for testing
  return Cypress.config('isInteractive') || Cypress.env('INTER') === 'true' || Cypress.env('INTER') === true;
};

const getGrepExpression = () => {
  const uiValue = cypressAppSelect('.grep').val();

  // use UI input value only when interactive mode
  if (!envVar('TEST_GREP') && isInteractive() && uiValue != null) {
    return uiValue;
  }

  return envVar('GREP') ?? '';
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

const logCreate = (config?: GrepConfig) => (message: unknown) => {
  if (config?.debugLog) {
    console.log(message);
  }
};

export const registerCypressGrep = (config?: GrepConfig) => {
  const initShowTagsInTitle = config?.showTagsInTitle ?? false;
  const initShowExcludedTests = config?.showExcludedTests ?? false;

  // here you can do setup for each test file in browser
  const log = logCreate(config);
  log('REGISTER CYPRESS GREP: ');

  let showTagsInTitle: boolean = initShowTagsInTitle;
  let showExcludedTests: boolean = initShowExcludedTests;

  if (isInteractive()) {
    showTagsInTitle = elVal('.show-tags', 'data-show-tags', initShowTagsInTitle);
    showExcludedTests = elVal('.show-pending', 'data-show-pending', initShowExcludedTests);
  }

  if (config?.addControlToUI) {
    addSearchInput(showTagsInTitle, showExcludedTests);
  }
  const configEvaluated = { ...config, showTagsInTitle, showExcludedTests };

  log(configEvaluated);
  setupSelectTests(selectTests, configEvaluated, updateCount, isEnvTrue('GREP_PRE_FILTER'));
};
