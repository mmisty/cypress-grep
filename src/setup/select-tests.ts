import type { Suite } from 'mocha';
import { parseTags, removeTagsFromTitle } from 'cy-local/setup/tags';

export const uniq = <T>(arr: T[]): T[] => {
  const res: T[] = [];

  arr.forEach(a => {
    if (res.indexOf(a) === -1) {
      res.push(a);
    }
  });

  return res;
};
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

const getCurrentTestTags = (test: Mocha.Test): string[] => {
  const testTags = (test as unknown as TestConfig)._testConfig?.tags;
  const inlineTagsTest = parseTags(test.title).map(t => `@${t.tag}`);
  const tagsArr = testTags && typeof testTags === 'string' ? [testTags] : testTags ?? [];

  return uniq([...tagsArr, ...inlineTagsTest]);
};

const getTestTags = (test: Mocha.Test, suiteTags: string[]): string[] => {
  return uniq([...suiteTags, ...getCurrentTestTags(test)]);
};

const tagsLineForTitle = (tags: string[]) => {
  return tags.join(' ');

  //return tags && tags.length > 0 ? JSON.stringify(tags).replace(/"/g, '') : '';
};

const tagsFormConfig = (tags?: string | string[]): string[] => {
  return tags ? (typeof tags === 'string' ? [tags] : tags) : [];
};

/**
 * Get all tags for suite - inline and from config
 * @param st - suite
 */
const tagsSuite = (st: Mocha.Suite): string[] => {
  const tagsFromConfig = tagsFormConfig((st as unknown as TestConfig)._testConfig?.tags);
  const inlineTagsFromTitle = parseTags(st.title).map(tag => `@${tag.tag}`);

  return uniq([...tagsFromConfig, ...inlineTagsFromTitle]);
};

/**
 * Add tags to title when specific setting
 * @param rootSuite
 * @param setting
 */
const suiteTitleChange = (rootSuite: Mocha.Suite, setting: Settings) => {
  for (const suite of rootSuite.suites) {
    const suiteTags = tagsSuite(suite);

    if (setting.showTagsInTitle && suiteTags.length > 0) {
      const tagsLine = tagsLineForTitle(suiteTags);
      suite.title = `${suite.title} ${tagsLine}`;
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
const getSuiteTagsForTest = (test: Mocha.Test | undefined): string[] => {
  const tags: string[] = [];

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

type MochaTestExtended = Mocha.Test & {
  tags?: string[];
  fullTitleWithTags?: string;
};

const prepareTestTitle = (test: Mocha.Test, suiteTags: string[], settings: Settings): string => {
  const testTagsAll = getTestTags(test, suiteTags);
  const line = test.fullTitle() + testTagsAll.join(' ');

  const tags = tagsLineForTitle(getCurrentTestTags(test));
  test.title = removeTagsFromTitle(test.title);

  if (settings.showTagsInTitle) {
    test.title = test.title + tags;
  }
  const fullTitleWithTags = (removeTagsFromTitle(line) + testTagsAll.join(' ')).replace(/\s\s*/g, ' ');
  (test as MochaTestExtended).tags = testTagsAll;
  (test as MochaTestExtended).fullTitleWithTags = fullTitleWithTags;

  return fullTitleWithTags;
};

type Settings = {
  showTagsInTitle: boolean;
  showExcludedTests: boolean;
};

function filterTests(
  suiteoInint: Mocha.Suite,
  regexp: RegExp,
  settings: Settings,
  onFilteredTest: (test: MochaTestExtended) => void,
  onExcludedTest: (test: MochaTestExtended) => void,
): number {
  let filteredCount = 0;

  // Remove empty suites
  suiteoInint.suites.forEach((suite: Mocha.Suite) => {
    if (suite.tests.length === 0 && suite.suites.length === 0) {
      if (suite.parent) {
        const suiteTitle = suite.fullTitle();
        suite.parent.suites = suite.parent.suites.filter(t => t.fullTitle() !== suiteTitle);
      }
    }
  });

  // Remove filtered tests and their parent suites
  suiteoInint.eachTest((test: Mocha.Test): void => {
    const testSuiteTags = getSuiteTagsForTest(test);
    const fullTitleWithTags = prepareTestTitle(test, testSuiteTags, settings);

    if (regexp.test(fullTitleWithTags)) {
      filteredCount++;
      onFilteredTest?.(test as MochaTestExtended);

      return;
    }
    onExcludedTest?.(test as MochaTestExtended);

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

  return filteredCount;
}

export const setupSelectTests = (selector: () => RegExp, settings: Settings, onCount: (num: number) => void): void => {
  // eslint-disable-next-line no-console
  console.log(` ----- Setup SELECT Tests --- ${selector().toString()} `);

  const originalSuites = origins();

  // eslint-disable-next-line func-names
  const selectedSuitesConstruct = function () {
    function descWithTags(...args: unknown[]): Suite {
      const regexp = selector();
      const suite = (originalSuites.originDescribe as (...a: unknown[]) => Suite)(...args);

      // the end, root suite, filter recursively
      if (!suite.parent?.parent) {
        const filtered: string[] = [];

        const count = filterTests(
          suite,
          regexp,
          settings,
          test => {
            filtered.push(` + ${test.fullTitleWithTags}`);
          },
          excludedTest => {
            filtered.push(` - ${excludedTest.fullTitleWithTags}`);
          },
        );

        onCount(count);
        suiteTitleChange(suite, settings);

        console.log(`\nFiltered tests: \n\n${uniq(filtered).join('\n')}\n`);
      }

      return suite;
    }

    return descWithTags;
  };

  (global as { describe: unknown }).describe = selectedSuitesConstruct();

  (global as { describe: { only: unknown; skip: unknown } }).describe.only = originalSuites.originOnly;

  (global as { describe: { only: unknown; skip: unknown } }).describe.skip = originalSuites.originSkip;
};
