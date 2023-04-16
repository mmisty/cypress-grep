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
   * show logs in console (filtered tests with tags)
   */
  debugLog?: boolean;
};
