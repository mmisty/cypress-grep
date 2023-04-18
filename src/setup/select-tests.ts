import type { Suite } from 'mocha';
import { parseInlineTags, removeTagsFromTitle, uniqTags } from '../utils/tags';
import { GrepConfig } from './config.types';
import { TransportTest } from '../common/types';
import GrepTag = Mocha.GrepTag;
import { uniq } from '../utils/functions';

// todo rewrite
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const origins = () => ({
  originDescribe: describe,
  originOnly: describe.only,
  originSkip: describe.skip,
});

type TestConfig = {
  _testConfig: Cypress.TestConfigOverrides;
};

const getCurrentTestTags = (test: Mocha.Test): Mocha.GrepTagObject[] => {
  const testTags = (test as unknown as TestConfig)._testConfig?.tags;
  const inlineTagsTest = parseInlineTags(test.title);
  const tagsArr: string[] = testTags ? (typeof testTags === 'string' ? [testTags] : testTags ?? []) : [];

  const tagsArrParsed: Mocha.GrepTagObject[] = tagsArr.map(t => ({ tag: t }));

  return uniqTags([...tagsArrParsed, ...inlineTagsTest]);
};

const getTestTags = (test: Mocha.Test, suiteTags: Mocha.GrepTagObject[]): Mocha.GrepTagObject[] => {
  return uniqTags([...suiteTags, ...getCurrentTestTags(test)]);
};

const tagStr = (t: Mocha.GrepTag): string => {
  if (typeof t === 'string') {
    return t;
  }

  return `${t.tag}`;
};

const tagsLineForTitle = (tags: Mocha.GrepTag[]): string => {
  return tags.map(t => tagStr(t)).join(' ');
};

const tagsFormConfig = (tags?: string | string[]): string[] => {
  return tags ? (typeof tags === 'string' ? [tags] : tags) : [];
};

/**
 * Get all tags for suite - inline and from config
 * @param st - suite
 */
const tagsSuite = (st: Mocha.Suite): Mocha.GrepTagObject[] => {
  const tagsFromConfig = tagsFormConfig((st as unknown as TestConfig)._testConfig?.tags);

  // here
  const tagsArrParsed: Mocha.GrepTagObject[] = tagsFromConfig.map(t => ({ tag: t }));
  const inlineTagsSuite = parseInlineTags(st.title);

  return uniqTags([...tagsArrParsed, ...inlineTagsSuite]);
};

/**
 * Add tags to title when specific setting
 * @param rootSuite
 * @param setting
 */
const suiteTitleChange = (rootSuite: Mocha.Suite, setting: GrepConfig) => {
  for (const suite of rootSuite.suites) {
    const suiteTags = tagsSuite(suite);

    if (setting.showTagsInTitle && suiteTags.length > 0) {
      const tagsLine = tagsLineForTitle(suiteTags);
      removeSuiteInlineTags(suite);
      const add = tagsLine ? ` ${tagsLine}` : '';
      suite.title = `${suite.title}${add}`;
    }

    if (!setting.showTagsInTitle) {
      removeSuiteInlineTags(suite);
    }

    suiteTitleChange(suite, setting);
  }
};

/**
 * Get all suite tags for test
 * @param test
 */
const getSuiteTagsForTest = (test: Mocha.Test | undefined): Mocha.GrepTagObject[] => {
  const tags: Mocha.GrepTagObject[] = [];

  let suite: Mocha.Suite | undefined = test?.parent;

  while (suite) {
    const suiteTags = tagsSuite(suite);
    tags.push(...suiteTags);

    suite = suite.parent;
  }

  return tags;
};

const removeSuiteInlineTags = (st: Mocha.Suite | undefined) => {
  if (st) {
    st.title = removeTagsFromTitle(st.title);
    st.suites.forEach(s => {
      removeSuiteInlineTags(s);
    });
  }
};

// search only by tag name, not by tag info
const tagsSearchLine = (allTags: GrepTag[]): string => {
  const tagsLine = (tags: Mocha.GrepTag[]): string => tags.map(t => tagStr(t)).join(' ');

  return allTags.length > 0 ? ` ${tagsLine(allTags)}` : '';
};

const prepareTestTitle = (test: Mocha.Test, suiteTags: Mocha.GrepTagObject[], settings: GrepConfig): string => {
  const testTagsAll = getTestTags(test, suiteTags);
  const line = test.fullTitle() + testTagsAll.join(' ');

  const tags = tagsLineForTitle(getCurrentTestTags(test));
  test.title = removeTagsFromTitle(test.title);

  if (settings.showTagsInTitle) {
    const add = tags ? ` ${tags}` : '';
    test.title = `${test.title}${add}`;
  }
  const fullTitleWithTags = `${removeTagsFromTitle(line)}${tagsSearchLine(testTagsAll)}`.replace(/\s\s*/g, ' ');
  test.tags = testTagsAll;
  test.fullTitleWithTags = fullTitleWithTags;

  return fullTitleWithTags;
};

function filterTests(
  suiteoInint: Mocha.Suite,
  regexp: RegExp,
  settings: GrepConfig,
  onFilteredTest: (test: Mocha.Test) => void,
  onExcludedTest: (test: Mocha.Test) => void,
): void {
  // Remove filtered tests and their parent suites
  suiteoInint.eachTest((test: Mocha.Test): void => {
    const testSuiteTags = getSuiteTagsForTest(test);
    const fullTitleWithTags = prepareTestTitle(test, testSuiteTags, settings);

    if (regexp.test(fullTitleWithTags)) {
      onFilteredTest?.(test);

      return;
    }
    onExcludedTest?.(test);

    // Remove not matched test
    if (test.parent) {
      if (settings.showExcludedTests) {
        test.parent.tests.forEach(t => {
          if (t.fullTitle() === test.fullTitle()) {
            t.pending = true;
          }
        });
      } else {
        test.parent.tests = test.parent.tests.filter(t => t.fullTitle() !== test.fullTitle());
      }
    }

    // Remove empty parent suites recursively
    let suite = test.parent;

    while (suite && suite.tests.length === 0 && suite.suites.length === 0) {
      if (suite.parent) {
        const suiteTitle = suite.fullTitle();
        suite.parent.suites = suite.parent.suites.filter(t => t.fullTitle() !== suiteTitle);
      }
      suite = suite.parent;
    }
  });
}

const turnOffBeforeHook = () => {
  // some tests uses visit in before
  (global as unknown as { before: unknown }).before = () => {
    // ignore
  };
};

export const setupSelectTests = (
  selector: () => RegExp,
  settings: GrepConfig,
  onCount: (num: number) => void,
  isPrerun: boolean,
): void => {
  const grep = Cypress.env('GREP') ?? '';
  let total = 0;
  let filteredCount = 0;

  if (settings.debugLog) {
    // eslint-disable-next-line no-console
    console.log(` ----- Setup SELECT Tests --- ${selector().toString()} `);
  }

  if (isPrerun) {
    settings.showExcludedTests = false;
    turnOffBeforeHook();
  }

  const filteredTests: TransportTest[] = [];
  const originalSuites = origins();

  // eslint-disable-next-line func-names
  const selectedSuitesConstruct = function () {
    function descWithTags(...args: unknown[]): Suite {
      const regexp = selector();
      const suite = (originalSuites.originDescribe as (...a: unknown[]) => Suite)(...args);

      // the end, root suite, filter recursively
      if (suite && !suite.parent?.parent) {
        const filtered: string[] = [];

        filterTests(
          suite,
          regexp,
          settings,
          test => {
            total++;
            filteredCount++;
            filtered.push(` + ${test.fullTitleWithTags}`);

            if (isPrerun) {
              const filePath = test.titlePath()[1]?.replace(/\/\/+/g, '/');
              filteredTests.push({
                filePath,
                tags: test.tags,
                title: test.title,
              });
              test.pending = true;
            }
          },
          excludedTest => {
            total++;
            filtered.push(` - ${excludedTest.fullTitleWithTags}`);
          },
        );

        onCount(filteredCount);
        suiteTitleChange(suite, settings);

        if (settings.debugLog) {
          // eslint-disable-next-line no-console
          console.log(`\nFiltered tests: \n\n${uniq(filtered).join('\n')}\n`);
        }
      }

      return suite;
    }

    return descWithTags;
  };

  if (isPrerun) {
    after(() => {
      if (filteredTests.length > 0) {
        const result = { total, grep, tests: filteredTests };
        cy.task('writeTempFileWithSelectedTests', JSON.stringify(result, null, '  '));
      }
    });
  }
  (global as { describe: unknown }).describe = selectedSuitesConstruct();

  (global as { describe: { only: unknown; skip: unknown } }).describe.only = originalSuites.originOnly;

  (global as { describe: { only: unknown; skip: unknown } }).describe.skip = originalSuites.originSkip;
};
