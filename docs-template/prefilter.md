This page is deprecated.

## Running tests

To run by tags yu need to specify environment variable 'GREP'

Run all tests with @P1 tag

```
CYPRESS_GREP='@P1' npm run cy:run
```

or

```
npx cypress run --env GREP='@P1'
```

### Prefilter

When dealing with numerous spec files, filtering through all tests
can be time-consuming.

So here is prefilter functionality - it boosts the speed of test execution with `GREP` and allows to
filter tests by dynamically created tags or test titles.
It will run cypress in pre-filtering mode and output file with paths to found spec files,
which then will be used to filter test in run mode.

To run tests with prefilter you need to run cypress twice:

1. first time with `GREP_PRE_FILTER=true` env variable and with your Grep expression (`GREP="@P1"`)
2. second time with the same grep expression

You can create script in package.json to simplify this:

```
"cy:run:grep": "CYPRESS_GREP_PRE_FILTER=true npm run cy:run && npm run cy:run",
```

To specify custom path with results (default is `<root of the project>/filtered_test_paths.json`):

```
"cy:run:grep": "export CYPRESS_GREP_RESULTS_FILE='./filtered.json' && CYPRESS_GREP_PRE_FILTER=true npm run cy:run && npm run cy:run",
```

After that you can run it by `GREP="@P1" npm run cy:run:grep`

To configure result file you can specify paths:

- set `GREP_RESULTS_FILE` = path where result file will be stored, default `<root of the project>/filtered_test_paths.json`
- set `GREP_ALL_TESTS_NAME` = test file name, default `all-tests.ts`
- set `GREP_TESTS_FOLDER` = folder where all tests are stored (all file will be created here)
- set `GREP_DELETE_ALL_FILE` = delete or not `all-tests.ts` after run, default `true`

Do not forget to add these files into `.gitignore`

Under the hood:

- this will create file with all tests, quickly filters all tests inside it and write file with result
- on next run will read the file and run only filtered files

### Add script to package.json

To have faster filtering it is better to add the following scripts into your package.json

For example, you have script that you want to run with grep:
`"cy:run": "npx cypress run --browser chrome --headless"`

To have faster filtering add:

```
"cy:filter": "CYPRESS_GREP_PRE_FILTER=true npm run cy:run",
"cy:grep": "export CYPRESS_GREP_RESULTS_FILE='./filtered_tests.json' && npm run cy:filter && npm run cy:run -- --config specPattern='cypress/e2e/**/*.cy.js'",
```

And run it by:

```shell
CYPRESS_GREP="@tagOrTitle" npm run cy:grep
```

**Without GREP**:
Since there is [issue](#note) - to run all tests by `npm run cy:grep` when no GREP specified -
specify STRING spec pattern in `cy:grep` that will find all tests you want to run.

Will run all tests:

```shell
npm run cy:grep
```
