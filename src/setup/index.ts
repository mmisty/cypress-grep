import { setupSelectTests } from './select-tests';
import { selectionTestGrep } from '../utils/regexp';
import { addSearchInput, updateCount } from './search-input';
import { cypressAppSelect } from 'cypress-controls-ext';
import { GrepConfig } from './config.types';
import { grepEnvVars, isTrue } from '../common/envVars';
import { pkgName } from '../common/logs';
import { getPublic, persistPublic, readPersistedPublic } from './public-config';

// this controlWrapper- is hardcoded in controls package
const wrapperId = (id: string) => `controlWrapper-${id}`;

export const isInteractive = () => {
  // INTER env var for testing
  return Cypress.config('isInteractive') || isTrue(getPublic('INTER') as string | boolean);
};

const getGrepExpression = (parentId: string): string => {
  const uiValue = cypressAppSelect(`#${wrapperId(parentId)} .grep`).val();

  // use UI input value only when interactive mode
  if (!getPublic('TEST_GREP') && isInteractive() && uiValue != null) {
    return `${uiValue}`;
  }

  const grep = readPersistedPublic(grepEnvVars.GREP, getPublic(grepEnvVars.GREP) as string | undefined);

  return grep ? `${grep}` : '';
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
  const originalGrep = getPublic(grepEnvVars.GREP);
  const filteredSpecsResult = getPublic('filteredSpecsResult') as any;

  if (!filteredSpecsResult) {
    return;
  }

  const spec = Cypress.spec;

  const tests =
    filteredSpecsResult.tests
      ?.filter((x: any) => {
        const pathFixed = `${filteredSpecsResult.parentFolder ?? ''}/${x.filePath}`.replace(/\/\//g, '/');

        return spec.relative.includes(pathFixed.startsWith('/') ? pathFixed.slice(1) : pathFixed);
      })
      .filter((x: any) => !!x.title) ?? [];

  if (tests.length > 0) {
    const specGrep = tests.map((x: any) => replaceSpecialChars(x.title ?? '')).join('|');

    if (specGrep) {
      persistPublic(grepEnvVars.GREP, `(${originalGrep})${specGrep ? '&' + `(${specGrep})` : ''}`);
    }
  }
};

// this is being executed at first before any cypress events
// and Cypress GREP env var is being read once before filtering tests
// So you cannot change it dynamically during spec execution
export const registerCypressGrep = (configInput?: GrepConfig) => {
  updateGrepForSpec();

  const defaultConfig = {
    addControlToUI: boolOrDefault(
      readPersistedPublic(grepEnvVars.addControlToUI, getPublic(grepEnvVars.addControlToUI)),
      true,
    ),
    showTagsInTitle: boolOrDefault(
      readPersistedPublic(grepEnvVars.showTagsInTitle, getPublic(grepEnvVars.showTagsInTitle)),
      true,
    ),
    showExcludedTests: boolOrDefault(
      readPersistedPublic(grepEnvVars.showExcludedTests, getPublic(grepEnvVars.showExcludedTests)),
      true,
    ),
  };
  const config: GrepConfig = configInput ? { ...defaultConfig, ...configInput } : defaultConfig;

  const debug = logCreate(config);
  const initShowTagsInTitle = config?.showTagsInTitle ?? false;
  const initShowExcludedTests = config?.showExcludedTests ?? false;

  const failExpose = getPublic(grepEnvVars.failOnNotFound);

  const envFailNotFound = failExpose != null ? failExpose === 'true' || failExpose === true : undefined;
  const failOnNotFound = envFailNotFound ?? config?.failOnNotFound ?? true;
  const isPreFilter = isTrue(getPublic(grepEnvVars.GREP_PRE_FILTER) as string | boolean);

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
