import { existsSync, readFileSync, rmSync } from 'fs';
import { createAllTestsFile } from './all-tests-combine';
import { getRootFolder } from './utils';
import { uniq } from '../utils/functions';
import { taskWrite } from './tasks';
import { envVarPlugin, isEnvTruePlugin } from '../common/envVars';
import { ParsedSpecs } from '../common/types';
import path from 'path';

/**
 * This will add prefiltering capabilities and speed up the execution
 * of tests when utilizing grep
 * */
export const pluginGrep = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  const envVar = envVarPlugin(config);

  if (!envVar('GREP')) {
    console.warn('[ cypress-grep ] to prefilter spec specify env var GREP, will select all tests');
    envVar('GREP', '');
  }

  const filteredSpecs = envVar('GREP_TEMP_PATH') ?? `${config.projectRoot}/filtered_test_paths.json`;

  const parentTestsFolder = getRootFolder(config.specPattern, config.projectRoot);
  console.log(`[ cypress-grep ] parent tests tolder: ${parentTestsFolder}`);

  on('task', taskWrite(parentTestsFolder, filteredSpecs));

  // using isTextTerminal since isInteractive always true in plugins
  // https://github.com/cypress-io/cypress/issues/20789
  /* if (!config.env.GREP && !config.isTextTerminal) {
    return;
  }*/

  if (!isEnvTruePlugin(config, 'GREP_PRE_FILTER')) {
    updateSpecPattern(config, filteredSpecs);

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
  console.log(`[ cypress-grep ] SPEC PATTERN IS NOW: ${JSON.stringify(newValue)}`);
};

const parsePrefilteredSpecs = (filteredSpecs: string): ParsedSpecs => {
  const testsJson = readFileSync(filteredSpecs);

  try {
    return JSON.parse(testsJson.toString()) as ParsedSpecs;
  } catch (e) {
    throw new Error(`[ cypress-grep ] could not parse '${filteredSpecs}'`);
  }
};

const updateSpecPattern = (config: Cypress.PluginConfigOptions, filteredSpecs: string) => {
  const envVar = envVarPlugin(config);

  if (!existsSync(filteredSpecs)) {
    console.warn(
      '[ cypress-grep ] to run prefiltered tests run with env var CYPRESS_FILTER_RUN=true\nThis time will filter tests one by one.',
    );

    // todo make option to exist early here when not found
    return;
  }

  const testParsed = parsePrefilteredSpecs(filteredSpecs);

  // todo setting
  const uniqPaths: string[] = uniq(
    testParsed.tests.map(f => {
      if (existsSync(path.resolve(f.filePath))) {
        return f.filePath;
      }

      if (existsSync(path.resolve(testParsed.parentFolder + f.filePath))) {
        return testParsed.parentFolder + f.filePath;
      }

      throw new Error(`[ cypress-grep ] could not find '${f.filePath}' or '${testParsed.parentFolder + f.filePath}' `);
    }),
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
