import type { Suite } from 'mocha';

export const uniq = <T>(arr: T[]): T[] => {
  const res: T[] = [];

  arr.forEach(a => {
    if (res.indexOf(a) === -1) {
      res.push(a);
    }
  });

  return res;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const origins = () => ({
  originDescribe: describe,
  originOnly: describe.only,
  originSkip: describe.skip,
});

type TestConfig = {
  _testConfig: Cypress.TestConfigOverrides;
};

const excluded: string[] = [];

const removeEmptySuites = (
  grep: RegExp,
  suite: Suite,
  tg: string[],
  configShowInTitle: boolean | undefined,
  count = 0,
): number => {
  let countCurrent = 0;

  if (configShowInTitle) {
    const currentSuiteTags = (suite as unknown as TestConfig)._testConfig?.tags;

    if (currentSuiteTags) {
      if (typeof currentSuiteTags === 'string') {
        // todo when tags in title
        suite.title = `${suite.title} ${currentSuiteTags}`;
      } else {
        const tagsNotFoud = currentSuiteTags.filter(t => suite.title.indexOf(t) === -1);
        suite.title = currentSuiteTags.length > 0 ? suite.title + tagsNotFoud.join(' ') : suite.title;
      }
    }
  }

  if (suite.tests?.length > 0) {
    suite.tests = suite.tests.filter(t => {
      console.log(`tg: ${JSON.stringify(tg)}`);
      const testTags = (t as unknown as TestConfig)._testConfig?.tags;
      // for some reason duplicate spaces
      const uniqTags = uniq(tg);
      console.log(`suiteTagsAll: ${JSON.stringify(uniqTags)}`);
      const tagsArr = testTags && typeof testTags === 'string' ? [testTags] : testTags ?? [];
      const testTagsAll = [...uniqTags, ...tagsArr];

      console.log(`testTagsAll: ${JSON.stringify(testTagsAll)}`);

      const testTagsStr = testTags ? (typeof testTags !== 'string' ? testTags.join(' ') : testTags) : '';

      if (configShowInTitle) {
        t.title += t.title.indexOf(testTagsStr) === -1 ? testTagsStr : '';
      }

      const nexTitle = t?.fullTitle().replace(/\s\s/g, ' ') + testTagsAll?.join(' ') ?? '';
      console.log('nexTitle');
      console.log(nexTitle);

      const strMatch = nexTitle.match(grep) ? '+' : '-';
      excluded.push(`  ${strMatch}  ${nexTitle}`);

      return nexTitle.match(grep);
    });
  }

  if (suite.tests?.length > 0 && suite.suites?.length === 0) {
    return suite.tests.length + count;
  }

  if (suite.tests?.length > 0) {
    countCurrent += suite.tests.length;
  }

  if (suite.suites?.length > 0) {
    for (const st of suite.suites) {
      if (st.tests.length === 0 && st.suites.length === 0) {
        suite.suites = suite.suites.filter(k => k.title !== st.title);

        return removeEmptySuites(grep, suite, tg, configShowInTitle);
      }
      const testsCount = removeEmptySuites(grep, st, tg, configShowInTitle, count);

      if (testsCount === 0) {
        // remove suite with 0 tests
        suite.suites = suite.suites.filter(k => k.title !== st.title);
      }
      countCurrent += testsCount;
    }
  }

  return countCurrent;
};

export const setupSelectTests = (
  selector: () => RegExp,
  configShowInTitle: boolean | undefined,
  onCount: (num: number) => void,
): void => {
  // eslint-disable-next-line no-console
  console.log(` ----- Setup SELECT Tests --- ${selector().toString()} `);

  const originalSuites = origins();

  let outputTests = false;
  const suiteTags: string[] = [];

  // eslint-disable-next-line func-names
  const selectedSuitesConstruct = function () {
    function descWithTags(...args: unknown[]): Suite {
      const [, currentSuiteTags] = args;
      const tags2 = (currentSuiteTags as { tags: string[] | string }).tags;

      if (tags2) {
        if (typeof tags2 === 'string') {
          suiteTags.push(tags2);
        } else {
          suiteTags.push(...tags2);
        }
      }

      const suite = (originalSuites.originDescribe as (...a: unknown[]) => Suite)(...args);

      console.log(`currentSuiteTags: ${currentSuiteTags}`);
      const count = removeEmptySuites(selector(), suite, suiteTags, configShowInTitle);
      onCount(count);

      if (!outputTests && excluded.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`\nFiltered tests: \n\n${uniq(excluded).join('\n')}\n`);
        outputTests = true;
      }

      return suite;
    }

    return descWithTags;
  };

  (global as { describe: unknown }).describe = selectedSuitesConstruct();

  (global as { describe: { only: unknown; skip: unknown } }).describe.only = originalSuites.originOnly;

  (global as { describe: { only: unknown; skip: unknown } }).describe.skip = originalSuites.originSkip;
};
