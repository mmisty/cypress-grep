/// <reference types="cypress" />

import { grepEnvVars } from '../common/envVars';

type StringMap = Record<string, unknown>;
type PluginCfg = Cypress.PluginConfigOptions;

/** Keys the browser reads via `Cypress.expose()` — must be copied off `env` / `CYPRESS_*`. */
export const browserPublicKeys = [...Object.values(grepEnvVars), 'INTER', 'TEST_GREP'] as const;

/** Prefer `expose` (Cypress 15.10+); fall back to `env` for `CYPRESS_*` / legacy merges. */
export const publicGet = (config: PluginCfg, key: string): unknown => {
  const ex = (config as PluginCfg & { expose?: StringMap }).expose;
  const en = (config as PluginCfg & { env?: StringMap }).env;

  return ex?.[key] ?? en?.[key];
};

export const publicSet = (config: PluginCfg, key: string, value: unknown): void => {
  const c = config as PluginCfg & { expose?: StringMap };
  c.expose = { ...(c.expose ?? {}), [key]: value };
};

/**
 * Copy grep (and related) values from `config.env` onto `config.expose`.
 * Latest Cypress pages no longer hydrate `Cypress.env()` into the reporter, so
 * `CYPRESS_GREP*` would otherwise be invisible to the support bundle.
 */
export const promoteEnvToExpose = (config: PluginCfg): void => {
  for (const key of browserPublicKeys) {
    const val = publicGet(config, key);

    if (val !== undefined) {
      publicSet(config, key, val);
    }
  }
};
