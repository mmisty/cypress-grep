import PluginEvents = Cypress.PluginEvents;
import PluginConfigOptions = Cypress.PluginConfigOptions;
import { preprocessor } from './ts-preprocessor';
import { existsSync, rmdirSync } from 'fs';
import { resolve } from 'path';
import { COVERAGE } from '../common/constants';
import { redirectLog } from 'cypress-redirect-browser-log/plugins';
import { configureAllureAdapterPlugins } from '@mmisty/cypress-allure-adapter/plugins';

/**
 * Clear compiled js files from previous runs, otherwise coverage will be messed up
 */
const clearJsFiles = () => {
  // remove previous in
  const jsFiles = resolve('js-files-cypress');

  if (existsSync(jsFiles)) {
    rmdirSync(jsFiles, { recursive: true });
  }
};

const isCoverage = (config: PluginConfigOptions) => {
  return process.env[COVERAGE] || config.env[COVERAGE];
};

export const setupPlugins = (on: PluginEvents, config: PluginConfigOptions) => {
  clearJsFiles();
  const isCov = isCoverage(config);

  if (isCov) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@cypress/code-coverage/task')(on, config);
    config.env[COVERAGE] = true;
  }

  on('file:preprocessor', preprocessor(isCov));

  redirectLog(on, config, ['exception', 'test:log', 'log', 'warn']);
  configureAllureAdapterPlugins(on, config);

  // It's IMPORTANT to return the config object
  // with any changed environment variables
  return config;
};
