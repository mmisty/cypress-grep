## Change Log
### 1.6.10
 - [cy-grep] yarn support

### 1.6.8
 - [cy-grep] get last script when several as input

### 1.6.7
 - [cy-grep] - fixed defaults for env vars
 - [cy-grep] - pass env to script

### 1.6.5
- speedup filtering (filtering from 1000 files for less than 30 seconds)
- added helper script
- fix types

### 1.4.6
- fixed test object to have tags for retried tests

## 1.4.3

- **[Breaking change]** renamed env var `GREP_TEMP_PATH` to `GREP_RESULTS_FILE`
- added env var `GREP_TESTS_FOLDER` - folder with all tests, can be specified once for all tests
- added env var `GREP_DELETE_ALL_FILE` - can be specified once for all tests, default true
- added setting to fail run when no tests found on filtering (`failOnNotFound`, by default will fail)
- added try-catch wrapper for spec file in pre-filtering mode. When spec file has problmes outside of the test will throw 
one error with test paths if they fail outside of test.
- fixed defect: when test without suite filtering is done incorrectly
- fixed defect: when several suites in root it doesn't find tests with inline tags
- fixed defect: several cases of inconsistent search
- after run delete `all-tests.ts` file
- added unit tests and code coverage
