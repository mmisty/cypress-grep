export enum grepEnvVars {
  /**
   * Expression for filtering tests
   * Will search trough tags / test title and all suite titles for the test
   */
  'GREP' = 'GREP',

  /**
   * Whether to run tests in prefilter mode,default false
   */
  'GREP_PRE_FILTER' = 'GREP_PRE_FILTER',

  /**
   * Will be used to create file with all tests
   * When not set will be determined automatically depending on spec pattern
   */
  'GREP_TESTS_FOLDER' = 'GREP_TESTS_FOLDER',

  /**
   * Will be used for filename with all tests
   * Should be file name that doesn't match regular spec pattern (ex. doesn't have '*.cy.ts'/'*.test.ts' extensions)
   * Default 'all-tests.ts'
   */
  'GREP_ALL_TESTS_NAME' = 'GREP_ALL_TESTS_NAME',

  /**
   * Will be used to write result when prefilter mode
   * When prefiter is false will use tests from this file to run
   * Default `${config.projectRoot}/filtered_test_paths.json`
   */
  'GREP_RESULTS_FILE' = 'GREP_RESULTS_FILE',

  /**
   * Whether to delete all tests file after prefilter
   * default true
   */
  'GREP_DELETE_ALL_FILE' = 'GREP_DELETE_ALL_FILE',

  /**
   * Whether to fail run when no tests are found, default true
   */
  'failOnNotFound' = 'GREP_failOnNotFound',
}

/**
 * Check value equals true or 'true'
 * @param val
 */
export const isTrue = (val: string | boolean) => {
  return val === 'true' || val === true;
};
