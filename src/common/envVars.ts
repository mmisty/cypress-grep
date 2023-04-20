export enum grepEnvVars {
  'GREP' = 'GREP',
  'GREP_PRE_FILTER' = 'GREP_PRE_FILTER',
  'GREP_ALL_TESTS_NAME' = 'GREP_ALL_TESTS_NAME',
  'GREP_TEMP_PATH' = 'GREP_TEMP_PATH',
  'GREP_TESTS_FOLDER' = 'GREP_TESTS_FOLDER',
  'TEST_GREP' = 'TEST_GREP',
}

/**
 * Check value equals true or 'true'
 * @param val
 */
export const isTrue = (val: string | boolean) => {
  return val === 'true' || val === true;
};
