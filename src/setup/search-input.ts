import { cypressAppSelect, setupControlsExtension } from 'cypress-controls-ext';
import { style } from 'cy-local/setup/select-element/select-element-css';
import { html } from 'cy-local/setup/select-element/select-element-html';

const testsCountSelector = '.number-input';
const inputGrep = '#grep';
const iconSearch = '.icon-container';

export const getItemValueForUI = (selector: string): string | undefined => {
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

export const addSearchInput = (showTags: boolean, showPending: boolean) => {
  setupControlsExtension({
    mode: { open: true },
    inject: 'start',
    selectorToInject: '.reporter .controls',
    id: 'searchInput',
    style: style(testsCountSelector, iconSearch),
    control: () => html(testsCountSelector, inputGrep, iconSearch, showTags, showPending),
    addEventListener: (parentId, listener, cyStop, cyRestart) => {
      listener(inputGrep, 'change', () => {
        cyStop();
        cyRestart();
      });

      listener(inputGrep, 'keypress', event => {
        if ((event as any).key === 'Enter') {
          cyStop();
          cyRestart();
        }
      });

      listener('.clear-input', 'click', () => {
        const searchField = cypressAppSelect(inputGrep);
        searchField.val('');
      });

      listener('.show-tags', 'click', () => {
        const tags = cypressAppSelect('.show-tags');
        const val = tags.attr('data-show-tags');

        if (val === 'true') {
          tags.attr('data-show-tags', 'false');
        } else {
          tags.attr('data-show-tags', 'true');
        }
      });

      listener('.show-pending', 'click', () => {
        const tags = cypressAppSelect('.show-pending');
        const val = tags.attr('data-show-pending');

        if (val === 'true') {
          tags.attr('data-show-pending', 'false');
        } else {
          tags.attr('data-show-pending', 'true');
        }
      });

      listener(iconSearch, 'mouseover', () => {
        setZIndex(0);
      });

      listener(iconSearch, 'mouseout', () => {
        setZIndex(1);
      });
      listener('.show-tags', 'mouseover', () => {
        setZIndex(0);
      });

      listener('.show-tags', 'mouseout', () => {
        setZIndex(1);
      });

      listener('.show-pending', 'mouseover', () => {
        setZIndex(0);
      });

      listener('.show-pending', 'mouseout', () => {
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
