import type { Suite } from 'mocha';
import type { ParsedSpecs, TransportTest } from '../common/types';
import { uniq } from '../utils/functions';
import { grepEnvVars } from '../common/envVars';
import { pkgName } from '../common/logs';
import { registerTags } from '@mmisty/cypress-tags/register';
import { GrepTagObject } from '@mmisty/cypress-tags/common/types';
import { GrepConfig } from './config.types';
import { removeTagsFromTitle } from '@mmisty/cypress-tags/utils/tags';

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

// search by infoToo
const tagsSearchLine = (allTags: GrepTagObject[]): string => {
  const tagsLine = (tags: GrepTagObject[]): string =>
    tags.map(t => t.tag + t.info?.map(x => x).join('') ?? '').join(' ');

  return allTags.length > 0 ? ` ${tagsLine(allTags)}` : '';
};

export const prepareTestTitle = (test: Mocha.Suite | Mocha.Test | undefined): string => {
  if (!test) {
    return 'null';
  }

  return `${removeTagsFromTitle(test.fullTitle())}${tagsSearchLine(test.tags || [])}`.replace(/\s\s*/g, ' ');
};

function filterTests(
  testRoot: Mocha.Test | undefined,
  suiteRoot: Mocha.Suite,
  regexp: RegExp,
  isPrerun: boolean,
  settings: GrepConfig,
  onFilteredTest: (test: Mocha.Test) => void,
  onExcludedTest: (test: Mocha.Test) => void,
): void {
  // Remove filtered tests and their parent suites
  suiteRoot.eachTest((test: Mocha.Test): void => {
    const isEqualTitleWithTags = (
      t1: Mocha.Suite | Mocha.Test | undefined,
      t2: Mocha.Suite | Mocha.Test | undefined,
    ) => {
      const t1Full = prepareTestTitle(t1);
      const t2Full = prepareTestTitle(t2);

      return t1Full === t2Full;
    };

    // when root test we filter suites again, so we don't need to filter other tests than the root
    if (testRoot && !isEqualTitleWithTags(testRoot, test)) {
      return;
    }

    const fullTitleWithTags = prepareTestTitle(test);

    if (regexp.test(fullTitleWithTags)) {
      onFilteredTest(test);

      if (!isPrerun) {
        return;
      }
    } else {
      onExcludedTest(test);
    }

    // Remove not matched test
    if (test.parent) {
      if (!isPrerun && settings.showExcludedTests) {
        test.parent.tests.forEach(t => {
          if (isEqualTitleWithTags(t, test)) {
            t.pending = true;
          }
        });
      } else {
        test.parent.tests = test.parent.tests.filter(t => !isEqualTitleWithTags(t, test));
      }
    }

    // Remove empty parent suites recursively
    let suite = test.parent;

    while (suite && suite.tests.length === 0 && suite.suites.length === 0) {
      if (suite.parent) {
        suite.parent.suites = suite.parent.suites.filter(t => !isEqualTitleWithTags(t, suite));
      }
      suite = suite.parent;
    }
  });
}
type FilterTest = TransportTest & { match: boolean; filteredTitle: string };

const createOnExcluded = (isPrerun: boolean, list: Partial<FilterTest>[]) => (test: Mocha.Test) => {
  list.push({ match: false, filteredTitle: prepareTestTitle(test) ?? '' });
};

const createOnFiltered = (isPrerun: boolean, list: Partial<FilterTest>[]) => (test: Mocha.Test) => {
  if (!isPrerun) {
    list.push({ match: true, filteredTitle: prepareTestTitle(test) ?? '' });

    return;
  }

  // titlePath has the title path generated by concatenating the parent's title path with the title.
  // 0 - is '' - root suite that is being created implicitly, 1 is what we need
  // 1 will contain path to spec file
  const filePath = test.titlePath()[1]?.replace(/\/\/+/g, '/');

  list.push({
    match: true,
    filteredTitle: prepareTestTitle(test) ?? '',
    filePath,
    tags: test.tags,
    title: test.title,
  });
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
      isPrerun,
      settings,
      createOnFiltered(isPrerun, filtered),
      createOnExcluded(isPrerun, filtered),
    );

    const count = uniq(filtered.filter(t => t.match).map(t => t.filteredTitle)).length;

    onCount(count);

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

  Cypress.env('cyTagsShowTagsInTitle', settings.showTagsInTitle);
  registerTags();

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

  if (isPrerun && grep) {
    it(`${pkgName} auto-generated test to write results`, () => {
      const uniqTests = (arr: FilterTest[]) =>
        arr.filter((obj, index, self) => self.map(s => s.filteredTitle).indexOf(obj.filteredTitle) === index);

      const all = uniqTests([...filteredSuites, ...filteredTests]);
      const match = all.filter(t => t.match);
      const result: ParsedSpecs = { total: all.length, filtered: match.length, grep, tests: match };

      if (match.length === 0 && settings.failOnNotFound) {
        const msg = [
          `Not found any tests matching ${grepEnvVars.GREP} '${grep}' satisfying specPattern ${Cypress.env(
            'originalSpecPattern',
          )}`,
          `To disable this error set environment variable \`${grepEnvVars.failOnNotFound}\` to false or set \`failOnNotFound\` to \`false\` in registerCypressGrep`,
        ];
        throw new Error(msg.join('\n'));
      }

      // note: 'after' hook is not being called when there are no tests
      // when no tests filtered and failOnNotFound is false -
      // all tests would be executed after prerun since no file is created
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
