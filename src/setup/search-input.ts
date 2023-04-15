import { cypressAppSelect, setupControlsExtension } from 'cypress-controls-ext';
import { style } from 'cy-local/setup/select-element/select-element-css';
import { html } from 'cy-local/setup/select-element/select-element-html';

const testsCountSelector = '.number-input';
const inputGrep = '#grep';
const iconSearch = '.icon-container';

export const getItemValueForUI = (item: string, selector: string): string | undefined => {
  const el = cypressAppSelect(selector);
  const val = el.val() !== undefined ? el.val() : el.text();

  return val ? `${val}` : undefined;
};

export const updateCount = (count: number) => {
  const testCountElement = cypressAppSelect(testsCountSelector);

  if (testCountElement.length > 0) {
    testCountElement.text(count);
  }
};

const setZIndex = (val: number) => {
  // for some reason cypress header has sticky position and hovers tooltip
  // soo need to change for a while
  const cyHeader = cypressAppSelect('.reporter .runnable-header');

  cyHeader.css('z-index', `${val}`);
};

export const addSearchInput = () => {
  setupControlsExtension({
    mode: { open: true },
    inject: 'start',
    selectorToInject: '.reporter .controls',
    id: 'searchInput',
    style: style(testsCountSelector, iconSearch),
    control: () => html(testsCountSelector, inputGrep, iconSearch),
    addEventListener: (parentId, listener, cyStop, cyRestart) => {
      listener(inputGrep, 'change', () => {
        cyStop();
        cyRestart();
      });

      listener('.clear-input', 'click', () => {
        const searchField = cypressAppSelect(inputGrep);
        searchField.val('');
      });

      listener(iconSearch, 'mouseover', () => {
        setZIndex(0);
      });

      listener(iconSearch, 'mouseout', () => {
        setZIndex(1);
      });

      listener(testsCountSelector, 'mouseover', () => {
        setZIndex(0);
      });

      listener(testsCountSelector, 'mouseout', () => {
        setZIndex(1);
      });
    },
  });
};
