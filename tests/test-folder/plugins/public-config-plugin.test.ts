import expect from 'expect';
import { grepEnvVars } from '../../../src/common/envVars';
import { promoteEnvToExpose, publicGet, publicSet } from '../../../src/plugins/public-config-plugin';

describe('public-config-plugin', () => {
  it('prefers expose over env', () => {
    const config = {
      expose: { GREP: '@from-expose' },
      env: { GREP: '@from-env' },
    } as unknown as Cypress.PluginConfigOptions;

    expect(publicGet(config, grepEnvVars.GREP)).toEqual('@from-expose');
  });

  it('reads CYPRESS_* values from env when expose is empty', () => {
    const config = {
      expose: {},
      env: { GREP: '@smoke', GREP_showTagsInTitle: false },
    } as unknown as Cypress.PluginConfigOptions;

    expect(publicGet(config, grepEnvVars.GREP)).toEqual('@smoke');
    expect(publicGet(config, grepEnvVars.showTagsInTitle)).toEqual(false);
  });

  it('keeps boolean false from expose instead of env true', () => {
    const config = {
      expose: { GREP_showExcludedTests: false, GREP_showTagsInTitle: false },
      env: { GREP_showExcludedTests: true, GREP_showTagsInTitle: true },
    } as unknown as Cypress.PluginConfigOptions;

    expect(publicGet(config, grepEnvVars.showExcludedTests)).toEqual(false);
    expect(publicGet(config, grepEnvVars.showTagsInTitle)).toEqual(false);

    promoteEnvToExpose(config);

    expect(config.expose?.GREP_showExcludedTests).toEqual(false);
    expect(config.expose?.GREP_showTagsInTitle).toEqual(false);
  });

  it('copies env grep keys onto expose for the reporter pages', () => {
    const config = {
      expose: {},
      env: {
        GREP: '@navbar',
        GREP_showTagsInTitle: false,
        GREP_showExcludedTests: false,
        GREP_PRE_FILTER: true,
      },
    } as unknown as Cypress.PluginConfigOptions;

    promoteEnvToExpose(config);

    expect(config.expose?.GREP).toEqual('@navbar');
    expect(config.expose?.GREP_showTagsInTitle).toEqual(false);
    expect(config.expose?.GREP_showExcludedTests).toEqual(false);
    expect(config.expose?.GREP_PRE_FILTER).toEqual(true);
    expect(publicGet(config, grepEnvVars.showTagsInTitle)).toEqual(false);
  });

  it('publicSet writes only to expose', () => {
    const config = {
      expose: {},
      env: {},
    } as unknown as Cypress.PluginConfigOptions;

    publicSet(config, 'filteredSpecsResult', { tests: [] });

    expect(config.expose?.filteredSpecsResult).toEqual({ tests: [] });
    expect((config.env as { filteredSpecsResult?: unknown }).filteredSpecsResult).toBeUndefined();
  });
});
