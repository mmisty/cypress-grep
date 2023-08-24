import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { createAllTestsFile, createOneTestsFile } from './all-tests-combine';
import { getRootFolder } from './utils';
import { uniq } from '../utils/functions';
import { taskWrite } from './tasks';
import { grepEnvVars, isTrue } from '../common/envVars';
import { ParsedSpecs } from '../common/types';
import path from 'path';
import { pkgName } from '../common/logs';
import Spec = Cypress.Spec;
import PluginEvents = Cypress.PluginEvents;

const defaultSpecPattern = 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}';

const parentFolder = (specPattern: string[] | string, config: Cypress.PluginConfigOptions) => {
  if (config.parentTestsFolder) {
    return config.parentTestsFolder;
  }

  if (
    config.env[grepEnvVars.GREP_TESTS_FOLDER] &&
    existsSync(path.resolve(config.env[grepEnvVars.GREP_TESTS_FOLDER]))
  ) {
    return config.env[grepEnvVars.GREP_TESTS_FOLDER];
  }

  console.log(
    `${pkgName} parent tests folder will be detected automatically. ` +
      `You can set '${grepEnvVars.GREP_TESTS_FOLDER}' env var with relative path to project root `,
  );

  return getRootFolder(specPattern, config.projectRoot);
};

const onAfterRunDelete = (on: PluginEvents, filePath: string) => {
  // check whether this will be overridden
  on('after:run', () => {
    if (existsSync(filePath)) {
      console.log(`${pkgName} deleting ${filePath}`);
      rmSync(filePath);
    }
  });
};

const lastUpdatedDate = (file: string) => {
  const { mtime } = statSync(file);

  return mtime;
};

const warningWhenFilteredResultExistMore = (timeExistMin: number, filteredSpecs: string) => {
  const ms = timeExistMin * 1000 * 60;
  const updated = lastUpdatedDate(filteredSpecs);
  const duration = Date.now() - updated.getTime();

  if (duration > ms) {
    const messsage = [
      `${pkgName} File with filtered tests exist more than ${timeExistMin}min,` +
        ' will filter tests basing on the result from it',
      `${pkgName} Delete file '${filteredSpecs}' if you want to filter from all`,
    ];
    console.warn(messsage.join('\n'));
  }
};

const warningNoResultsFileNoGrep = (grep: string | undefined) => {
  if (grep) {
    console.warn(
      `${pkgName} to run prefiltered tests use env var ${grepEnvVars.GREP_PRE_FILTER}=true` +
        `\n${pkgName} This time will filter tests one by one by ${grepEnvVars.GREP}='${grep}'.`,
    );
  }
};

/**
 * This will add prefiltering capabilities and speed up the execution
 * of tests when utilizing grep
 * */
export const pluginGrep = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  const specPattern = config.specPattern || defaultSpecPattern;
  const parentTestsFolder = parentFolder(specPattern, config);
  const isPreFilter = isTrue(config.env[grepEnvVars.GREP_PRE_FILTER] ?? false);
  const isDeleteAllFile = isTrue(config.env[grepEnvVars.GREP_DELETE_ALL_FILE] ?? true);
  const grep = config.env[grepEnvVars.GREP];
  const filteredSpecs = config.env[grepEnvVars.GREP_RESULTS_FILE] ?? `${config.projectRoot}/filtered_test_paths.json`;
  const allFileName = config.env[grepEnvVars.GREP_ALL_TESTS_NAME] ?? 'all-tests.js';
  const allTestsFile = `${parentTestsFolder}/${allFileName}`;
  on('task', taskWrite(parentTestsFolder, filteredSpecs));

  console.log(`${pkgName} grep: '${grep}'`);
  console.log(`${pkgName} parent tests folder: '${parentTestsFolder}'`);

  if (!isPreFilter) {
    if (!existsSync(filteredSpecs)) {
      warningNoResultsFileNoGrep(config.env[grepEnvVars.GREP]);

      // todo make option to exist early here when not found
      return;
    }

    warningWhenFilteredResultExistMore(1, filteredSpecs);
    updateSpecPattern(specPattern, config, filteredSpecs);

    return;
  }
  writeFileSync('spec_pattern.json', JSON.stringify({ specPattern: specPattern }));
  config.reporter = 'spec';

  if (existsSync(filteredSpecs)) {
    rmSync(filteredSpecs);
  }

  if (!grep) {
    // exit early to normal run
    console.warn(`${pkgName} to prefilter specs specify env var GREP. Now will select all tests`);

    // cannot set cypress to exit early
    // so  just go through one auto generated spec to speed up (will be skipped anyway)
    createOneTestsFile(allTestsFile);
    config.specPattern = `${allTestsFile}`;
    onAfterRunDelete(on, allTestsFile);

    return;
  }

  // create all tests file
  const file = createAllTestsFile(allTestsFile, parentTestsFolder, specPattern);
  changeSpecPatternOneFile(config, file);

  if (isDeleteAllFile) {
    onAfterRunDelete(on, allTestsFile);
  }
};

const changeSpecsForRun = (
  specPattern: string[] | string,
  config: Cypress.PluginConfigOptions,
  newValue: string | string[],
) => {
  const specs = typeof newValue === 'string' ? [newValue] : newValue.map(t => t);

  const specsNew: Spec[] = specs.map(s => ({
    name: path.basename(s),
    relative: s,
    absolute: path.resolve(config.projectRoot, s),
  }));

  if (Array.isArray(specPattern)) {
    // need to remove everything from existing
    config.specPattern = specPattern?.splice(0, specPattern.length);
  }

  config.specPattern = specsNew.map(t => t.relative);
  console.log(`${pkgName} Spec Pattern: ${config.specPattern}`);
};

const changeSpecPatternOneFile = (config: Cypress.PluginConfigOptions, newValue: string) => {
  config.specPattern = newValue;

  console.log(`${pkgName} New specs Pattern is now: ${config.specPattern}`);
};

const parsePrefilteredSpecs = (filteredSpecs: string): ParsedSpecs => {
  const testsJson = readFileSync(filteredSpecs);

  try {
    return JSON.parse(testsJson.toString()) as ParsedSpecs;
  } catch (e) {
    throw new Error(`${pkgName} could not parse '${filteredSpecs}'`);
  }
};

const updateSpecPattern = (
  specPattern: string[] | string,
  config: Cypress.PluginConfigOptions,
  filteredSpecs: string,
) => {
  const testParsed = parsePrefilteredSpecs(filteredSpecs);

  // todo setting parent test folder
  const uniqPaths: string[] = uniq(
    testParsed.tests.map(f => {
      if (existsSync(path.resolve(f.filePath))) {
        return f.filePath;
      }

      const pathTest = path.join(testParsed.parentFolder ?? '', f.filePath);

      if (existsSync(path.resolve(pathTest))) {
        return path.resolve(pathTest);
      }

      throw new Error(`${pkgName} could not find '${f.filePath}' or '${pathTest}' `);
    }),
  );

  if (uniqPaths.length === 0) {
    console.warn(
      `${pkgName} Not found any tests with ` +
        `grep='${config.env[grepEnvVars.GREP]}' and specPattern='${JSON.stringify(specPattern)}'`,
    );
  } else {
    const specsCount = `specs files: ${uniqPaths.length} with total tests: ${testParsed.tests.length}`;
    const message = [`${pkgName} Pre-filtered spec files for grep '${testParsed.grep}': ${specsCount}`];
    console.info(message.join('\n'));
  }

  changeSpecsForRun(specPattern, config, uniqPaths);
};
