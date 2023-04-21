import { existsSync, readFileSync, rmSync } from 'fs';
import { createAllTestsFile } from './all-tests-combine';
import { getRootFolder } from './utils';
import { uniq } from '../utils/functions';
import { taskWrite } from './tasks';
import { grepEnvVars, isTrue } from '../common/envVars';
import { ParsedSpecs } from '../common/types';
import path from 'path';
import { pkgName } from '../common/logs';

const parentFolder = (config: Cypress.PluginConfigOptions) => {
  if (config.env[grepEnvVars.GREP_TESTS_FOLDER]) {
    return config.env[grepEnvVars.GREP_TESTS_FOLDER];
  }
  console.log(`${pkgName} parent tests folder will be detected automatically`);

  return getRootFolder(config.specPattern, config.projectRoot);
};

/**
 * This will add prefiltering capabilities and speed up the execution
 * of tests when utilizing grep
 * */
export const pluginGrep = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  const parentTestsFolder = parentFolder(config);
  console.log(`${pkgName} parent tests folder: ${parentTestsFolder}`);

  if (!config.env[grepEnvVars.GREP]) {
    console.warn(`${pkgName} to prefilter spec specify env var GREP, will select all tests`);
    config.env[grepEnvVars.GREP] = '';
  }

  const filteredSpecs = config.env[grepEnvVars.GREP_TEMP_PATH] ?? `${config.projectRoot}/filtered_test_paths.json`;

  on('task', taskWrite(parentTestsFolder, filteredSpecs));

  if (!isTrue(config.env[grepEnvVars.GREP_PRE_FILTER])) {
    updateSpecPattern(config, filteredSpecs);

    return;
  }

  // create all tests file
  const allFileName = config.env[grepEnvVars.GREP_ALL_TESTS_NAME] ?? 'all-tests.ts';
  const allTestsFile = `${parentTestsFolder}/${allFileName}`;
  const file = createAllTestsFile(allTestsFile, parentTestsFolder, config.specPattern);
  changeSpecPattern(config, file);

  if (existsSync(filteredSpecs)) {
    rmSync(filteredSpecs);
  }
};

const changeSpecPattern = (config: Cypress.PluginConfigOptions, newValue: string | string[]) => {
  config.specPattern = newValue;
  console.log(`${pkgName} SPEC PATTERN IS NOW: ${JSON.stringify(newValue)}`);
};

const parsePrefilteredSpecs = (filteredSpecs: string): ParsedSpecs => {
  const testsJson = readFileSync(filteredSpecs);

  try {
    return JSON.parse(testsJson.toString()) as ParsedSpecs;
  } catch (e) {
    throw new Error(`${pkgName} could not parse '${filteredSpecs}'`);
  }
};

const updateSpecPattern = (config: Cypress.PluginConfigOptions, filteredSpecs: string) => {
  if (!existsSync(filteredSpecs)) {
    // grepEnvVars.GREP_TEMP_PATH
    if (config.env[grepEnvVars.GREP]) {
      console.warn(
        `${pkgName} to run prefiltered tests use env var ${grepEnvVars.GREP_PRE_FILTER}=true` +
          `\n${pkgName} This time will filter tests one by one by ${grepEnvVars.GREP}='${
            config.env[grepEnvVars.GREP]
          }'.`,
      );
    }

    // todo make option to exist early here when not found
    return;
  }

  const testParsed = parsePrefilteredSpecs(filteredSpecs);

  // todo setting parent test folder
  const uniqPaths: string[] = uniq(
    testParsed.tests.map(f => {
      if (existsSync(path.resolve(f.filePath))) {
        return f.filePath;
      }

      if (existsSync(path.resolve(testParsed.parentFolder + f.filePath))) {
        return testParsed.parentFolder + f.filePath;
      }

      throw new Error(`${pkgName} could not find '${f.filePath}' or '${testParsed.parentFolder + f.filePath}' `);
    }),
  );

  if (uniqPaths.length === 0) {
    console.warn(
      `${pkgName} Not found any tests with ` +
        `grep='${config.env[grepEnvVars.GREP]}' and specPattern='${JSON.stringify(config.specPattern)}'`,
    );
  } else {
    const specsCount = `specs files: ${uniqPaths.length}, tests: ${testParsed.tests.length}`;
    const message = ['', `${pkgName} Pre-filtered spec files for grep '${testParsed.grep}': ${specsCount}`, ''];
    console.info(message.join('\n'));
  }

  changeSpecPattern(config, uniqPaths);
};
