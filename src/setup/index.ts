import { setupSelectTests } from './select-tests';
import { selectionTestGrep } from '../utils/regexp';
import { addSearchInput, updateCount } from './search-input';
import { cypressAppSelect } from 'cypress-controls-ext';
import { GrepConfig } from './config.types';
import { grepEnvVars, isTrue } from '../common/envVars';
import { pkgName } from '../common/logs';

// this controlWrapper- is hardcoded in controls package
const wrapperId = (id: string) => `controlWrapper-${id}`;

export const isInteractive = () => {
  // INTER env var for testing
  return Cypress.config('isInteractive') || isTrue(Cypress.env('INTER'));
};

const getGrepExpression = (parentId: string) => {
  const uiValue = cypressAppSelect(`#${wrapperId(parentId)} .grep`).val();

  // use UI input value only when interactive mode
  if (!Cypress.env(grepEnvVars.TEST_GREP) && isInteractive() && uiValue != null) {
    return uiValue;
  }

  return Cypress.env(grepEnvVars.GREP) ?? '';
};

const selectTests = (parentId: string) => () => {
  const grepSelected = getGrepExpression(parentId);

  return selectionTestGrep(grepSelected);
};

const elVal = (selector: string, dataSelector: string, initial: boolean): boolean => {
  const el = cypressAppSelect(selector);

  if (!el?.attr('class')) {
    console.log(`${pkgName} '${selector}' NOT LOADED YET`);

    return initial;
  }

  return el.attr(dataSelector) === 'true';
};

const logCreate = (config?: GrepConfig) => (message: unknown) => {
  if (config?.debugLog) {
    console.log(`${pkgName} ${message}`);
  }
};

export const registerCypressGrep = (config?: GrepConfig) => {
  const initShowTagsInTitle = config?.showTagsInTitle ?? false;
  const initShowExcludedTests = config?.showExcludedTests ?? false;
  const failOnNotFound = config?.failOnNotFound ?? true;
  const isPreFilter = isTrue(grepEnvVars.GREP_PRE_FILTER);

  // here you can do setup for each test file in browser
  const debug = logCreate(config);
  debug('REGISTER CYPRESS GREP: ');

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

  const configEvaluated = { ...config, showTagsInTitle, showExcludedTests, failOnNotFound };

  debug(configEvaluated);

  setupSelectTests(selectTests(idSelector), configEvaluated, updateCount(wrapperId(idSelector)), isPreFilter);
};
