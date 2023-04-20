import { setupSelectTests } from './select-tests';
import { selectionTestGrep } from '../utils/regexp';
import { addSearchInput, updateCount } from './search-input';
import { cypressAppSelect } from 'cypress-controls-ext';
import { GrepConfig } from './config.types';
import { envVar, isEnvTrue } from '../common/envVars';

// this controlWrapper- is hardcoded in controls package
const wrapperId = (id: string) => `controlWrapper-${id}`;

export const isInteractive = () => {
  // INTER env var for testing
  return Cypress.config('isInteractive') || Cypress.env('INTER') === 'true' || Cypress.env('INTER') === true;
};

const getGrepExpression = (parentId: string) => {
  const uiValue = cypressAppSelect(`#${wrapperId(parentId)} .grep`).val();

  // use UI input value only when interactive mode
  if (!envVar('TEST_GREP') && isInteractive() && uiValue != null) {
    return uiValue;
  }

  return envVar('GREP') ?? '';
};

const selectTests = (parentId: string) => () => {
  const grepSelected = getGrepExpression(parentId);

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

  let idSelector = '';

  if (config?.addControlToUI) {
    idSelector = addSearchInput(showTagsInTitle, showExcludedTests);
  }

  if (isInteractive()) {
    showTagsInTitle = elVal(`#${wrapperId(idSelector)} .show-tags`, 'data-show-tags', initShowTagsInTitle);
    showExcludedTests = elVal(`#${wrapperId(idSelector)} .show-pending`, 'data-show-pending', initShowExcludedTests);
  }

  const configEvaluated = { ...config, showTagsInTitle, showExcludedTests };

  log(configEvaluated);

  setupSelectTests(
    selectTests(idSelector),
    configEvaluated,
    updateCount(wrapperId(idSelector)),
    isEnvTrue('GREP_PRE_FILTER'),
  );
};
