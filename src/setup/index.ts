import { setupSelectTests } from 'cy-local/setup/select-tests';
import { selectionTestGrep } from 'cy-local/setup/regexp';
import { addSearchInput, getItemValueForUI, updateCount } from 'cy-local/setup/search-input';

const getStrSelection = () => {
  const storage = getItemValueForUI('GREP', '#grep');

  // use UI input value only when interactive mode
  if (Cypress.config('isInteractive') && storage != null) {
    return storage;
  }

  if (Cypress.env('GREP') != null && Cypress.env('GREP') !== '') {
    return Cypress.env('GREP');
  }

  return '';
};

const selectTests = () => {
  const selected = getStrSelection();

  if (selected !== '') {
    Cypress.env('showTagsInTitle', 'true');
  }

  return selectionTestGrep(selected);
};

export const registerCypressGrep = (config?: { addControlToUI?: boolean; showTagsInTitle?: boolean }) => {
  // here you can do setup for each test file in browser

  setupSelectTests(selectTests, config?.showTagsInTitle, updateCount);

  if (config?.addControlToUI) {
    addSearchInput();
  }
};
