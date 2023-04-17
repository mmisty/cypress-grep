enum envVars {
  'GREP',
  'GREP_PRE_FILTER',
  'GREP_ALL_TESTS_NAME',
  'GREP_TEMP_PATH',
  'TEST_GREP',
}

type EnvVars = keyof typeof envVars;

export function envVar(varName: EnvVars, newValue?: any) {
  if (newValue) {
    return Cypress.env(varName);
  }

  Cypress.env(varName, newValue);
}

export const envVarPlugin = (config: Cypress.PluginConfigOptions) =>
  function (varName: EnvVars, newValue?: any) {
    if (newValue) {
      return config.env[varName];
    }

    config.env[varName] = newValue;
  };

/**
 * Check value of env var equals true in Browser
 * @param name
 */
export const isEnvTrue = (name: EnvVars) => {
  const val = Cypress.env(name);

  return val === 'true' || val === true;
};

/**
 * Check value of env var equals true in [lugins
 * @param config
 * @param name
 */
export const isEnvTruePlugin = (config: Cypress.PluginConfigOptions, name: EnvVars) => {
  const val = config.env[name];

  return val === 'true' || val === true;
};
