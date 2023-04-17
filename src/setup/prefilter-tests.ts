import { origins } from './select-tests';
import { ParsedSpecs, TransportTest } from '../common/types';
import { envVar } from '../common/envVars';

const turnOffBeforeHook = () => {
  // some tests uses visit in before
  (global as unknown as { before: unknown }).before = () => {
    // ignore
  };
};

/**
 * Iterates through all tests (with matching grep pattern) and stores
 * grep matching registering is done before this
 * @param filteredTests
 */
const createSuiteWrapper = (filteredTests: TransportTest[]) => {
  const originalSuites = origins().originDescribe;

  function descFilter(...args: unknown[]): Mocha.Suite {
    const suite = (originalSuites as (...a: unknown[]) => Mocha.Suite)(...args);

    // the end, root suite
    if (suite && !suite.parent?.parent) {
      suite.eachTest(test => {
        const filePath = test.titlePath()[1]?.replace(/\/\/+/g, '/');
        filteredTests.push({
          filePath,
          tags: test.tags,
          title: test.title,
        });

        // Skip matched test for pre-run
        test.pending = true;
      });
    }

    return suite;
  }

  (global as { describe: unknown }).describe = descFilter;
};

export const testsPrefilter = (log: (msg: unknown) => void) => {
  const grep = envVar('GREP');

  log('FILTER RUN STARTED');
  turnOffBeforeHook();

  const filteredTests: TransportTest[] = [];
  createSuiteWrapper(filteredTests);

  after(() => {
    if (filteredTests.length > 0) {
      const result: ParsedSpecs = { grep: grep ?? '', tests: filteredTests };
      cy.task('writeTempFileWithSelectedTests', JSON.stringify(result, null, '  '));
    }
  });
};
