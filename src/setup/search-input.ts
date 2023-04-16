import { cypressAppSelect, ListenerSetting, setupControlsExtension } from 'cypress-controls-ext';
import { style } from './select-element/select-element-css';
import { html } from './select-element/select-element-html';

const testsCountSelector = '.number-input';
const inputGrep = '.grep';
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

const tooltipCorrect = (selector: string, eq: number, listener: ListenerSetting) => {
  listener(`${selector}:eq(${eq})`, 'mouseover', () => {
    setZIndex(0);
  });

  listener(`${selector}:eq(${eq})`, 'mouseout', () => {
    setZIndex(1);
  });
};

export const addSearchInput = (showTags: boolean, showPending: boolean) => {
  setupControlsExtension({
    mode: { open: true },
    inject: 'insertAfter',
    // selectorToInject: '.reporter .controls',
    //selectorToInject: 'header',
    // selectorToInject: '.reporter .container .runnable-header',
    selectorToInject: '.reporter header .toggle-specs-wrapper',
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
        const tagsDataSel = 'data-show-tags';
        const tags = cypressAppSelect('.show-tags');
        const val = tags.attr(tagsDataSel);

        tags.attr(tagsDataSel, val === 'true' ? 'false' : 'true');
      });

      listener('.show-pending', 'click', () => {
        const pendingDataSel = 'data-show-pending';
        const tags = cypressAppSelect('.show-pending');
        const val = tags.attr(pendingDataSel);

        tags.attr(pendingDataSel, val === 'true' ? 'false' : 'true');
      });

      tooltipCorrect('.btn-wrapper', 0, listener);
      tooltipCorrect('.btn-wrapper', 1, listener);
      tooltipCorrect('.btn-wrapper', 2, listener);
      tooltipCorrect('.btn-wrapper', 3, listener);
      tooltipCorrect(iconSearch, 0, listener);

      tooltipCorrect(testsCountSelector, 0, listener);
      listener(iconSearch, 'mouseover', () => {
        const tool = cypressAppSelect('.tooltip');
        tool.css('display', 'block');
      });

      listener(iconSearch, 'mouseout', () => {
        const tool = cypressAppSelect('.tooltip');
        tool.css('display', 'none');
      });
    },
  });
};
