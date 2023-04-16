import { setupSelectTests } from 'cy-local/setup/select-tests';
import { selectionTestGrep } from 'cy-local/setup/regexp';
import { addSearchInput, getItemValueForUI, updateCount } from 'cy-local/setup/search-input';
import { cypressAppSelect } from 'cypress-controls-ext';

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

  if (grepSelected !== '') {
    Cypress.env('showTagsInTitle', 'true');
  }

  return selectionTestGrep(grepSelected);
};

const elVal = (selector: string, dataSelector: string, initial?: boolean) => {
  const el = cypressAppSelect(selector);

  if (!el.attr(dataSelector) && (initial !== undefined || initial)) {
    el.attr(dataSelector, initial ? 'true' : 'false');
  }

  return el.attr(dataSelector) === 'true';
};

type GrepConfig = {
  /**
   * Add UI control to filter test (only for interactive mode), default false
   */
  addControlToUI?: boolean;
  /**
   * Show tags in test title, default false
   */
  showTagsInTitle?: boolean;
  /**
   * Show excluded tests as pending, default false
   */
  showExcludedTests?: boolean;
};

export const registerCypressGrep = (config?: GrepConfig) => {
  // here you can do setup for each test file in browser
  console.log('REGISTER CYPRESS GREP');
  let showTagsValuUi: boolean | undefined;
  let showPendingValuUi: boolean | undefined;

  if (Cypress.config('isInteractive')) {
    showTagsValuUi = elVal('.show-tags', 'data-show-tags', config?.showTagsInTitle);
    showPendingValuUi = elVal('.show-pending', 'data-show-pending', config?.showExcludedTests);
  } else {
    showTagsValuUi = config?.showTagsInTitle ?? false;
    showPendingValuUi = config?.showExcludedTests ?? false;
  }

  if (config?.addControlToUI) {
    addSearchInput(showTagsValuUi, showPendingValuUi);
  }

  setupSelectTests(
    selectTests,
    {
      showTagsInTitle: showTagsValuUi,
      showExcludedTests: showPendingValuUi,
    },
    updateCount,
  );
};
