## 1.4.2

- fixed several cases of inconsistent search
- added setting to fail run when no tests found on filtering (failOnNotFound)
- added try-catch wrapper for spec file in pre-filtering mode, will throw one error with test paths if they fail outside of test.
- fixed defect: when test without suite filtering is done incorrectly
- fixed defect: when several suites in root does not find tests with inline tags
- added env var GREP_TESTS_FOLDER - can be specified once for all tests
- added unit tests and code coverage