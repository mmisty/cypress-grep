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

const getGrepExpression = (parentId: string): string => {
  const uiValue = cypressAppSelect(`#${wrapperId(parentId)} .grep`).val();

  // use UI input value only when interactive mode
  if (!Cypress.env('TEST_GREP') && isInteractive() && uiValue != null) {
    return `${uiValue}`;
  }

  return Cypress.env(grepEnvVars.GREP) ? `${Cypress.env(grepEnvVars.GREP)}` : '';
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

const boolOrDefault = (val: unknown, res: boolean) => {
  return val === undefined ? res : val === 'true' || val === true;
};

const replaceSpecialChars = (str: string) => {
  const encodedTitle = str.replace(/([(){}[\]*^.!|$]+)/g, '\\$1');

  // replace specific symbols for parsing by grep to any symbol
  return encodedTitle.replace(/[/'&"]/g, '.');
};

const updateGrepForSpec = () => {
  const originalGrep = Cypress.env(grepEnvVars.GREP);
  const filteredSpecsResult = Cypress.env('filteredSpecsResult');

  if (!filteredSpecsResult) {
    return;
  }

  const spec = Cypress.spec;

  const tests =
    filteredSpecsResult.tests
      ?.filter(x => spec.relative.includes(`${filteredSpecsResult.parentFolder}${x.filePath}`))
      .filter(x => !!x.title) ?? [];

  const specGrep = tests.map(x => replaceSpecialChars(x.title ?? '')).join('|');

  Cypress.env(grepEnvVars.GREP, `(${originalGrep})${specGrep ? '&' + `(${specGrep})` : ''}`);
};

// this is being executed at first before any cypress events
// and Cypress GREP env var is being read once before filtering tests
// So you cannot change it dynamically during spec execution
export const registerCypressGrep = (configInput?: GrepConfig) => {
  updateGrepForSpec();

  const defaultConfig = {
    addControlToUI: boolOrDefault(Cypress.env(grepEnvVars.addControlToUI), true),
    showTagsInTitle: boolOrDefault(Cypress.env(grepEnvVars.showTagsInTitle), true),
    showExcludedTests: boolOrDefault(Cypress.env(grepEnvVars.showExcludedTests), true),
  };
  const config: GrepConfig = configInput ? { ...defaultConfig, ...configInput } : defaultConfig;

  const debug = logCreate(config);
  const initShowTagsInTitle = config?.showTagsInTitle ?? false;
  const initShowExcludedTests = config?.showExcludedTests ?? false;

  const envFailNotFound =
    Cypress.env(grepEnvVars.failOnNotFound) != null
      ? Cypress.env(grepEnvVars.failOnNotFound) === 'true' || Cypress.env(grepEnvVars.failOnNotFound) === true
      : undefined;
  const failOnNotFound = envFailNotFound ?? config?.failOnNotFound ?? true;
  const isPreFilter = isTrue(Cypress.env(grepEnvVars.GREP_PRE_FILTER));

  console.log(
    `${pkgName} ${
      failOnNotFound ? 'will fail when no tests found ' : 'will not fail when no tests found'
    } (to change this set ${grepEnvVars.failOnNotFound} env var to ${!failOnNotFound} )`,
  );
  console.log(`${pkgName} ${grepEnvVars.GREP_PRE_FILTER}: ${isPreFilter}`);
  // here you can do setup for each test file in browser
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
