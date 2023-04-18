import { cypressAppSelect, ListenerSetting, setupControlsExtension } from 'cypress-controls-ext';
import { style } from './select-element/select-element-css';
import { html } from './select-element/select-element-html';
import { isInteractive } from './index';

const testsCountSelector = '.number-input';
const inputGrep = '.grep';
const iconSearch = '.icon-container';

const withParent = (parentId: string) => (sel: string) => {
  return `#${parentId} ${sel}`;
};

export const updateCount = (parentId: string) => (count: number) => {
  const testCountElement = cypressAppSelect(withParent(parentId)(testsCountSelector));

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

const tooltipCorrect = (selector: string, listener: ListenerSetting) => {
  listener(`${selector}`, 'mouseover', () => {
    setZIndex(0);
  });

  listener(`${selector}`, 'mouseout', () => {
    setZIndex(1);
  });
};

export const addSearchInput = (showTags: boolean, showPending: boolean): string => {
  const id = 'searchInput';
  setupControlsExtension({
    id,
    mode: { open: true, run: isInteractive() },
    inject: 'insertAfter',
    selectorToInject: '.reporter header .toggle-specs-wrapper',
    style: style(testsCountSelector, iconSearch),
    control: () => html(testsCountSelector, inputGrep, iconSearch, showTags, showPending),
    addEventListener: (parentId, listener, cyStop, cyRestart) => {
      const selector = withParent(parentId);
      listener(selector(inputGrep), 'change', () => {
        cyStop();
        cyRestart();
      });

      listener(selector(inputGrep), 'keypress', event => {
        if ((event as any).key === 'Enter') {
          cyStop();
          cyRestart();
        }
      });

      listener(selector('.clear-input'), 'click', () => {
        const searchField = cypressAppSelect(selector(inputGrep));
        searchField.val('');
      });

      listener(selector('.show-tags'), 'click', () => {
        const tagsDataSel = 'data-show-tags';
        const tags = cypressAppSelect(selector('.show-tags'));
        const val = tags.attr(tagsDataSel);

        tags.attr(tagsDataSel, val === 'true' ? 'false' : 'true');
      });

      listener(selector('.show-pending'), 'click', () => {
        const pendingDataSel = 'data-show-pending';
        const tags = cypressAppSelect(selector('.show-pending'));
        const val = tags.attr(pendingDataSel);

        tags.attr(pendingDataSel, val === 'true' ? 'false' : 'true');
      });

      tooltipCorrect(selector('.btn-wrapper'), listener);
      tooltipCorrect(selector(iconSearch), listener);
      tooltipCorrect(selector(testsCountSelector), listener);
      tooltipCorrect(selector('.btn-wrapper-icon'), listener);

      listener(selector('.btn-wrapper-icon'), 'mouseover', () => {
        const tool = cypressAppSelect(selector('.tooltip'));
        tool.css('display', 'block');
      });

      listener(selector('.btn-wrapper-icon'), 'mouseout', () => {
        const tool = cypressAppSelect(selector('.tooltip'));
        tool.css('display', 'none');
      });
    },
  });

  return id;
};
