import type { Suite } from 'mocha';
import { parseInlineTags, removeTagsFromTitle, uniqTags } from '../utils/tags';
import type { GrepConfig } from './config.types';
import type { GrepTag, GrepTagObject, ParsedSpecs, TransportTest } from '../common/types';
import { uniq } from '../utils/functions';
import { grepEnvVars } from '../common/envVars';

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
  const testTags = (test as unknown as TestConfig)._testConfig?.tags;
  const inlineTagsTest = parseInlineTags(test.title);
  const tagsArr: string[] = testTags ? (typeof testTags === 'string' ? [testTags] : testTags ?? []) : [];

  const tagsArrParsed: GrepTagObject[] = tagsArr.map(t => ({ tag: t }));

  return uniqTags([...tagsArrParsed, ...inlineTagsTest]);
};

const getTestTags = (test: Mocha.Test, suiteTags: GrepTagObject[]): GrepTagObject[] => {
  return uniqTags([...suiteTags, ...getCurrentTestTags(test)]);
};

const tagStr = (t: GrepTag): string => {
  if (typeof t === 'string') {
    return t;
  }

  return `${t.tag}`;
};

const tagsLineForTitle = (tags: GrepTag[]): string => {
  return tags.map(t => tagStr(t)).join(' ');
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
  //console.log(tagsFromConfig);
  // here
  const tagsArrParsed: GrepTagObject[] = tagsFromConfig.map(t => ({ tag: t }));
  const inlineTagsSuite = parseInlineTags(st.title);
  const result = uniqTags([...tagsArrParsed, ...inlineTagsSuite]);
  //console.log('result');
  //console.log(result);

  return result;
};

/**
 * Add tags to title when specific setting
 * @param rootSuite
 * @param setting
 */
const suiteTitleChange = (rootSuite: Mocha.Suite, setting: GrepConfig) => {
  if (!rootSuite) {
    return;
  }
  const suiteTags = tagsSuite(rootSuite);

  rootSuite.title = removeTagsFromTitle(rootSuite.title);

  if (setting.showTagsInTitle && suiteTags.length > 0) {
    const tagsLine = tagsLineForTitle(suiteTags);
    const add = tagsLine ? ` ${tagsLine}` : '';

    rootSuite.title = `${rootSuite.title}${add}`;
  }

  for (const suite of rootSuite.suites) {
    suiteTitleChange(suite, setting);
  }
};

// search only by tag name, not by tag info
const tagsSearchLine = (allTags: GrepTag[]): string => {
  const tagsLine = (tags: Mocha.GrepTag[]): string => tags.map(t => tagStr(t)).join(' ');

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
  console.log(`${test.title} ALL SUITE`);
  console.log(tags);

  return tags;
};

const prepareTestTitle = (test: Mocha.Test, suiteTags: GrepTagObject[], settings: GrepConfig): string => {
  const testTagsAll = getTestTags(test, suiteTags);
  console.log(testTagsAll);
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
  suiteRoot: Mocha.Suite,
  regexp: RegExp,
  settings: GrepConfig,
  onFilteredTest: (test: Mocha.Test) => void,
  onExcludedTest: (test: Mocha.Test) => void,
): void {
  // Remove filtered tests and their parent suites
  suiteRoot.eachTest((test: Mocha.Test): void => {
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
  (regexp: RegExp, filtered: FilterTest[], suite: Mocha.Suite) => {
    filterTests(suite, regexp, settings, createOnFiltered(isPrerun, filtered), createOnExcluded(isPrerun, filtered));

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
  const grep = Cypress.env('GREP') ?? '';

  if (settings.debugLog) {
    // eslint-disable-next-line no-console
    console.log(` ----- Setup SELECT Tests --- ${selector().toString()} `);
  }

  if (isPrerun) {
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
      filterSuite(regexp, filteredTests, test.parent);
    }

    return test;
  }

  function descWithTags(...args: unknown[]): Suite {
    const regexp = selector();
    const suite = (originalSuites.originDescribe as (...a: unknown[]) => Suite)(...args);

    if (suite && suite.parent && suite.parent.title === '' && !suite.parent.parent) {
      // this will run for every parent suite in file
      // current suite does not contain info about all suites before execution
      filterSuite(regexp, filteredSuites, suite.parent);
    }

    return suite;
  }

  if (isPrerun) {
    after(() => {
      const uniqTests = (arr: FilterTest[]) =>
        arr.filter((obj, index, self) => self.map(s => s.filteredTitle).indexOf(obj.filteredTitle) === index);

      const all = uniqTests([...filteredSuites, ...filteredTests]);
      const match = all.filter(t => t.match);

      if (settings.failOnNotFound && match.length === 0) {
        throw new Error(`Not found any tests matching ${grepEnvVars.GREP} '${grep}' `);
      }

      const result: ParsedSpecs = { total: all.length, filtered: match.length, grep, tests: match };
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
