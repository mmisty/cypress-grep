import expect from 'expect';
import { grepEnvVars } from '../../../src/common/envVars';
import { getPublic } from '../../../src/setup/public-config';

describe('public-config getPublic', () => {
  const originalCypress = (global as { Cypress?: unknown }).Cypress;

  afterEach(() => {
    (global as { Cypress?: unknown }).Cypress = originalCypress;
  });

  it('returns expose boolean false instead of falling through to env', () => {
    const expose = jest.fn((key: string) => (key === grepEnvVars.showExcludedTests ? false : undefined));
    const env = jest.fn(() => true);

    (global as { Cypress?: unknown }).Cypress = { expose, env };

    expect(getPublic(grepEnvVars.showExcludedTests)).toEqual(false);
    expect(env).not.toHaveBeenCalled();
  });

  it('falls back to Cypress.env when expose does not have the key', () => {
    const expose = jest.fn(() => undefined);
    const env = jest.fn((key: string) => (key === grepEnvVars.showExcludedTests ? false : undefined));

    (global as { Cypress?: unknown }).Cypress = { expose, env };

    expect(getPublic(grepEnvVars.showExcludedTests)).toEqual(false);
  });

  it('returns undefined when allowCypressEnv disables Cypress.env', () => {
    const expose = jest.fn(() => undefined);
    const env = jest.fn(() => {
      throw new Error('Cypress.env is disabled');
    });

    (global as { Cypress?: unknown }).Cypress = { expose, env };

    expect(getPublic(grepEnvVars.showExcludedTests)).toBeUndefined();
  });
});
