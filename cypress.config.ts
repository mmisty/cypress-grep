import { defineConfig } from 'cypress';
import { setupPlugins } from './integration/plugins';
import { pluginGrep } from './src/plugins';

const cypressFolder = 'integration';

export default defineConfig({
  env: {
    GREP_SHOW_UI_CONTROL: true,
    GREP_SHOW_TAGS_IN_TITLE: true,
    GREP_SHOW_EXCLUDED_TESTS: true,
  },
  watchForFileChanges: false,
  e2e: {
    // experimentalRunAllSpecs: true,
    specPattern: [
      `${cypressFolder}/e2e/example/*.(cy|test|spec).ts`,
      `${cypressFolder}/e2e/example/**/*.(cy|test|spec).ts`,
      `${cypressFolder}/e2e/*.(cy|test|spec).ts`,
    ],
    supportFile: `${cypressFolder}/support/index.ts`,
    downloadsFolder: `${cypressFolder}/downloads`,
    videosFolder: `${cypressFolder}/videos`,
    fixturesFolder: `${cypressFolder}/fixtures`,
    screenshotsFolder: `${cypressFolder}/screenshots`,
    video: false,

    setupNodeEvents(on, config) {
      pluginGrep(on, config);

      setupPlugins(on, config);

      return config;
    },
  },
});
