import { defineConfig } from 'cypress';
import { setupPlugins } from './integration/plugins';

const cypressFolder = 'integration';

export default defineConfig({
  env: {
    GREP_SHOW_TAGS_IN_TITLE: true,
    GREP_SHOW_UI_CONTROL: true,
  },
  e2e: {
    specPattern: `${cypressFolder}/e2e/**/*.(cy|test|spec).ts`,
    supportFile: `${cypressFolder}/support/index.ts`,
    downloadsFolder: `${cypressFolder}/downloads`,
    videosFolder: `${cypressFolder}/videos`,
    fixturesFolder: `${cypressFolder}/fixtures`,
    screenshotsFolder: `${cypressFolder}/screenshots`,
    video: false,

    setupNodeEvents(on, config) {
      setupPlugins(on, config);

      return config;
    },
  },
});
