export type GrepConfig = {
  /**
   * Add UI control to filter test (only for interactive mode), default false
   */
  addControlToUI?: boolean;

  /**
   * Show tags in test title, default false
   */
  showTagsInTitle?: boolean;

  /**
   * Show excluded tests as pending, default false
   */
  showExcludedTests?: boolean;

  /**
   * Whether to fail run when no tests are found, default true
   */
  failOnNotFound?: boolean;

  /**
   * show logs in console (filtered tests with tags)
   */
  debugLog?: boolean;
};
