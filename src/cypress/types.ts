// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Chainable {
    /**
     * Custom command for logging
     * @param message - message
     */
    myLog(message: string): Chainable<void>;
  }

  interface SuiteConfigOverrides {
    /**
     * List of tags for the suite, could be string or array of strings
     * @example
     *  describe('single tag', { tags: '@smoke' }, () => { ... })
     *  describe('many tags', { tags: ['@smoke', '@regression'] }, () => { ... })
     */
    tags?: string | string[];
  }

  interface TestConfigOverrides {
    /**
     * List of tags for test  - could be string or array of strings
     * @example
     *  it('single tag', { tags: '@smoke' }, () => { ... })
     *  it('many tags', { tags: ['@smoke', '@regression'] }, () => { ... })
     */
    tags?: string | string[];
  }
}
