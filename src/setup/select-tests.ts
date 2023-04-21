import type { Suite } from 'mocha';
import { parseInlineTags, removeTagsFromTitle, uniqTags } from '../utils/tags';
import type { GrepConfig } from './config.types';
import type { GrepTagObject, ParsedSpecs, TransportTest } from '../common/types';
import { uniq } from '../utils/functions';
import { grepEnvVars } from '../common/envVars';
import { pkgName } from '../common/logs';

// todo rewrite
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const origins = () => ({
  originIt: it,
  originItOnly: it.only,
  originItSkip: it.skip,
  originDescribe: describe,
  originOnly: describe.only,
  originSkip: describe.skip,
});

type TestConfig = {
  _testConfig: Cypress.TestConfigOverrides;
};

const getCurrentTestTags = (test: Mocha.Test): GrepTagObject[] => {
  // config tags only for test
  const testTags = (test as unknown as TestConfig)._testConfig?.tags;
  const inlineTagsTest = parseInlineTags(test.title);
  const tagsArr: string[] = testTags ? (typeof testTags === 'string' ? [testTags] : testTags ?? []) : [];
  const fromConfig: GrepTagObject[] = tagsArr.flatMap(t => parseInlineTags(t));

  return uniqTags([...fromConfig, ...inlineTagsTest]);
};

const getTestTags = (test: Mocha.Test, suiteTags: GrepTagObject[]): GrepTagObject[] => {
  const testTags = getCurrentTestTags(test);

  return uniqTags([...suiteTags, ...testTags]);
};

const tagsLineForTitle = (tags: GrepTagObject[]): string => {
  return tags.map(t => t.tag).join(' ');
};

const tagsFormConfig = (tags?: string | string[]): string[] => {
  return tags ? (typeof tags === 'string' ? [tags] : tags) : [];
};

/**
 * Get all tags for suite - inline and from config
 * @param st - suite
 */
const tagsSuite = (st: Mocha.Suite): GrepTagObject[] => {
  const tagsFromConfig = tagsFormConfig((st as unknown as TestConfig)._testConfig?.tags);
  const tagsArrParsed: GrepTagObject[] = tagsFromConfig.flatMap(t => parseInlineTags(t));
  const inlineTagsSuite = parseInlineTags(st.title);

  return uniqTags([...tagsArrParsed, ...inlineTagsSuite]);
};

/**
 * Add tags to title when specific setting
 * @param rootSuite
 * @param setting
 */
const suiteTitleChange = (rootSuite: Mocha.Suite, setting: GrepConfig) => {
  const suiteTags = tagsSuite(rootSuite);

  rootSuite.title = removeTagsFromTitle(rootSuite.title);

  if (setting.showTagsInTitle && suiteTags.length > 0) {
    const tagsLine = tagsLineForTitle(suiteTags);
    rootSuite.title = `${rootSuite.title} ${tagsLine}`;
  }

  for (const suite of rootSuite.suites) {
    suiteTitleChange(suite, setting);
  }
};

// search only by tag name, not by tag info
const tagsSearchLine = (allTags: GrepTagObject[]): string => {
  const tagsLine = (tags: GrepTagObject[]): string => tags.map(t => t.tag).join(' ');

  return allTags.length > 0 ? ` ${tagsLine(allTags)}` : '';
};

/**
 * Get all suite tags for test
 * @param test
 */
const getSuiteTagsForTest = (test: Mocha.Test): GrepTagObject[] => {
  const tags: GrepTagObject[] = [];

  let suite: Mocha.Suite | undefined = test.parent;

  while (suite) {
    const suiteTags = tagsSuite(suite);
    tags.push(...suiteTags);

    suite = suite.parent;
  }

  return tags;
};

const prepareTestTitle = (test: Mocha.Test, suiteTags: GrepTagObject[], settings: GrepConfig): string => {
  const testTagsAll = getTestTags(test, suiteTags);
  const line = test.fullTitle();

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
  testRoot: Mocha.Test | undefined,
  suiteRoot: Mocha.Suite,
  regexp: RegExp,
  settings: GrepConfig,
  onFilteredTest: (test: Mocha.Test) => void,
  onExcludedTest: (test: Mocha.Test) => void,
): void {
  // Remove filtered tests and their parent suites
  suiteRoot.eachTest((test: Mocha.Test): void => {
    // when root test we filter suites again, so we don't need to filter other tests than the root
    if (testRoot && testRoot.fullTitle() !== test.fullTitle()) {
      return;
    }
    const testSuiteTags = getSuiteTagsForTest(test);
    const fullTitleWithTags = prepareTestTitle(test, testSuiteTags, settings);

    if (regexp.test(fullTitleWithTags)) {
      onFilteredTest(test);

      return;
    }
    onExcludedTest(test);

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
type FilterTest = TransportTest & { match: boolean; filteredTitle: string };

const createOnExcluded = (isPrerun: boolean, list: Partial<FilterTest>[]) => (test: Mocha.Test) => {
  list.push({ match: false, filteredTitle: test.fullTitleWithTags ?? '' });
};

const createOnFiltered = (isPrerun: boolean, list: Partial<FilterTest>[]) => (test: Mocha.Test) => {
  if (!isPrerun) {
    list.push({ match: true, filteredTitle: test.fullTitleWithTags ?? '' });

    return;
  }

  // titlePath has the title path generated by concatenating the parent's title path with the title.
  // 0 - is '' - root suite that is being created implicitly, 1 is what we need
  // 1 will contain path to spec file
  const filePath = test.titlePath()[1]?.replace(/\/\/+/g, '/');

  list.push({
    match: true,
    filteredTitle: test.fullTitleWithTags ?? '',
    filePath,
    tags: test.tags,
    title: test.title,
  });

  test.pending = true;
};

const createFilterSuiteTests =
  (settings: GrepConfig, isPrerun: boolean, onCount: (num: number) => void) =>
  /**
   *
   * @param regexp
   * @param filtered
   * @param suite
   * @param test - test when it is root
   */
  (regexp: RegExp, filtered: FilterTest[], suite: Mocha.Suite, test?: Mocha.Test) => {
    filterTests(
      test,
      suite,
      regexp,
      settings,
      createOnFiltered(isPrerun, filtered),
      createOnExcluded(isPrerun, filtered),
    );

    const count = uniq(filtered.filter(t => t.match).map(t => t.filteredTitle)).length;

    onCount(count);
    suiteTitleChange(suite, settings);

    if (settings.debugLog) {
      const filteredUniq = uniq(filtered.map(t => ` ${t.match ? ' + ' : ' - '}${t.filteredTitle}`));
      const message = ['', `Filtered tests (${count})`, '', filteredUniq.join('\n')];

      // eslint-disable-next-line no-console
      console.log(message.join('\n'));
    }
  };

const turnOffBeforeHook = () => {
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
  const grep = Cypress.env(grepEnvVars.GREP) ?? '';

  if (settings.debugLog) {
    // eslint-disable-next-line no-console
    console.log(`${pkgName} ----- Setup SELECT Tests --- ${selector().toString()} `);
  }

  if (isPrerun) {
    settings.showTagsInTitle = true;
    settings.showExcludedTests = false;

    // some tests uses visit in before
    turnOffBeforeHook();
  }

  const originalSuites = origins();
  const filteredSuites: FilterTest[] = [];
  const filteredTests: FilterTest[] = [];
  const filterSuite = createFilterSuiteTests(settings, isPrerun, onCount);

  function itWithTags(...args: unknown[]): Mocha.Test {
    const regexp = selector();
    const test = (originalSuites.originIt as (...a: unknown[]) => Mocha.Test)(...args);

    // for tests that doesn't have parent suite
    if (test.parent && test.parent.title === '' && !test.parent?.parent) {
      filterSuite(regexp, filteredTests, test.parent, test);
    }

    return test;
  }

  function descWithTags(...args: unknown[]): Suite {
    const regexp = selector();
    const suite = (originalSuites.originDescribe as (...a: unknown[]) => Suite)(...args);

    if (suite && suite.parent && suite.parent.title === '' && !suite.parent.parent) {
      // this will run for every parent suite in file
      // current suite does not contain info about all suites before execution
      filterSuite(regexp, filteredSuites, suite);
    }

    return suite;
  }

  if (isPrerun) {
    it(`${pkgName} auto-generated test`, () => {
      const uniqTests = (arr: FilterTest[]) =>
        arr.filter((obj, index, self) => self.map(s => s.filteredTitle).indexOf(obj.filteredTitle) === index);

      const all = uniqTests([...filteredSuites, ...filteredTests]);
      const match = all.filter(t => t.match);
      const result: ParsedSpecs = { total: all.length, filtered: match.length, grep, tests: match };

      if (match.length === 0 && settings.failOnNotFound) {
        const msg = [
          `Not found any tests matching ${grepEnvVars.GREP} '${grep}'`,
          'To disable this error set `failOnNotFound` to `false` in registerCypressGrep',
        ];
        throw new Error(msg.join('\n'));
      }

      // note: after hook is not being called when there are no tests
      // when no tests filtered and failOnNotFound is false - after
      // prerun all tests would be executed since no file is created
      cy.task('writeTempFileWithSelectedTests', result);
    });
  }

  type GlobalMochaFunc = {
    describe: unknown;
    it: unknown;
  };

  type GlobalMochaExtensions = {
    describe: { only: unknown; skip: unknown };
    it: { only: unknown; skip: unknown };
  };

  (global as GlobalMochaFunc).describe = descWithTags;
  (global as GlobalMochaExtensions).describe.only = originalSuites.originOnly;
  (global as GlobalMochaExtensions).describe.skip = originalSuites.originSkip;
  (global as GlobalMochaFunc).it = itWithTags;
  (global as GlobalMochaExtensions).it.only = originalSuites.originItOnly;
  (global as GlobalMochaExtensions).it.skip = originalSuites.originItSkip;
};
