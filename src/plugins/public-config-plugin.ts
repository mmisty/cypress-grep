/// <reference types="cypress" />

type StringMap = Record<string, unknown>;
type PluginCfg = Cypress.PluginConfigOptions;

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
