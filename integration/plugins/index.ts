import PluginEvents = Cypress.PluginEvents;
import PluginConfigOptions = Cypress.PluginConfigOptions;
import { preprocessor } from './ts-preprocessor';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { COVERAGE } from '../common/constants';
import { redirectLog } from 'cypress-redirect-browser-log/plugins';
import { configureAllureAdapterPlugins } from '@mmisty/cypress-allure-adapter/plugins';
import * as fs from 'node:fs';

/**
 * Clear compiled js files from previous runs, otherwise coverage will be messed up
 */
const clearJsFiles = () => {
  // remove previous in
  const jsFiles = resolve('js-files-cypress');

  if (existsSync(jsFiles)) {
    fs.rmSync(jsFiles, { recursive: true, force: true });
  }
};

const isCoverage = (config: PluginConfigOptions) => {
  return process.env[COVERAGE] === 'true' || config.expose?.[COVERAGE] === true || config.env?.[COVERAGE] === true;
};

export const setupPlugins = (on: PluginEvents, config: PluginConfigOptions) => {
  clearJsFiles();
  const isCov = isCoverage(config);

  if (isCov) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@cypress/code-coverage/task')(on, config);
    config.expose = { ...(config.expose ?? {}), COVERAGE: true };
  }

  on('file:preprocessor', preprocessor(isCov));

  // client decides what to expose here
  config.expose = { ...(config.expose ?? {}), ...(config.env ?? {}) };

  // @mmisty/cypress-allure-adapter (current npm) still reads Allure options from `config.env`.
  // Cypress 15 config uses `expose`; mirror so the node reporter sees `allure` / paths.

  // --- start of support old allure plugin (remove after allure move to new)
  const ex = (config.expose ?? {}) as Record<string, unknown>;
  const mergedEnv = { ...(config.env ?? {}) } as Record<string, unknown>;

  if (ex.allure !== undefined && mergedEnv.allure === undefined) {
    mergedEnv.allure = ex.allure;
  }

  if (ex.allureResults !== undefined && mergedEnv.allureResults === undefined) {
    mergedEnv.allureResults = ex.allureResults;
  }

  if (ex.allureResultsWatchPath !== undefined && mergedEnv.allureResultsWatchPath === undefined) {
    mergedEnv.allureResultsWatchPath = ex.allureResultsWatchPath;
  }

  if (process.env.CYPRESS_allureResults) {
    mergedEnv.allureResults = process.env.CYPRESS_allureResults;
  }

  config.env = mergedEnv as typeof config.env;
  // --- end of support old allure plugin

  console.log('expose', config.expose);
  console.log('env', config.env);

  redirectLog(on, config, ['exception', 'test:log', 'log', 'warn']);
  configureAllureAdapterPlugins(on, config);

  // It's IMPORTANT to return the config object
  // with any changed environment variables
  return config;
};
