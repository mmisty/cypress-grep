import { existsSync, readFileSync, rmSync } from 'fs';
import { createAllTestsFile } from './all-tests-combine';
import { getRootFolder } from './utils';
import { uniq } from '../setup/select-tests';
import { taskWrite } from './tasks';
import { envVarPlugin, isEnvTruePlugin } from '../common/envVars';
import { ParsedSpecs } from '../common/types';

/**
 * Will add functionality to prefilter tests and run more quickly when using grep
 * */
export const pluginGrep = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  const envVar = envVarPlugin(config);

  if (!envVar('GREP')) {
    console.warn('To prefilter spec specify env var GREP');

    return;
  }

  const filteredSpecs = envVar('GREP_TEMP_PATH') ?? `${config.projectRoot}/filtered_test_paths.json`;
  const parentTestsFolder = getRootFolder(config.specPattern, config.projectRoot);

  on('task', taskWrite(filteredSpecs));

  // using isTextTerminal since isInteractive always true in plugins
  // https://github.com/cypress-io/cypress/issues/20789
  /* if (!config.env.GREP && !config.isTextTerminal) {
    return;
  }*/

  if (!isEnvTruePlugin(config, 'GREP_PRE_FILTER')) {
    updateSpecPattern(config, filteredSpecs, parentTestsFolder);

    return;
  }

  // create all tests file
  const allFileName = envVar('GREP_ALL_TESTS_NAME') ?? 'all-tests.ts';
  const allTestsFile = `${parentTestsFolder}/${allFileName}`;
  const file = createAllTestsFile(allTestsFile, parentTestsFolder, config.specPattern);
  changeSpecPattern(config, file);

  if (existsSync(filteredSpecs)) {
    rmSync(filteredSpecs);
  }
};

const changeSpecPattern = (config: Cypress.PluginConfigOptions, newValue: string | string[]) => {
  config.specPattern = newValue;
  console.log(`SPEC PATTERN IS NOW: ${newValue}`);
};

const parsePrefilteredSpecs = (filteredSpecs: string): ParsedSpecs => {
  const testsJson = readFileSync(filteredSpecs);

  try {
    return JSON.parse(testsJson.toString()) as ParsedSpecs;
  } catch (e) {
    throw new Error(`Could not parse '${filteredSpecs}'`);
  }
};

const updateSpecPattern = (config: Cypress.PluginConfigOptions, filteredSpecs: string, parentTestsFolder: string) => {
  const envVar = envVarPlugin(config);

  if (!existsSync(filteredSpecs)) {
    console.warn(
      'To run prefiltered tests run with env var CYPRESS_FILTER_RUN=true\nThis time will filter tests one by one.',
    );

    // todo make option to exist early here when not found
    return;
  }

  const testParsed = parsePrefilteredSpecs(filteredSpecs);

  const uniqPaths: string[] = uniq(
    testParsed.tests.map(f => (f.filePath.startsWith(parentTestsFolder) ? f.filePath : parentTestsFolder + f.filePath)),
  );

  if (uniqPaths.length === 0) {
    console.warn(`Not found any tests with grep= ${envVar('GREP')} and specPattern= ${config.specPattern}`);
  } else {
    const specsCount = `specs files: ${uniqPaths.length}, tests: ${testParsed.tests.length}`;
    const message = [`\nPre-filtered spec files for grep '${testParsed.grep}': ${specsCount}`];
    console.info(`${message.join('\n')}\n`);
  }

  changeSpecPattern(config, uniqPaths);
};
