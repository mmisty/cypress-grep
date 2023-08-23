# @mmisty/cypress-grep
The package enables filtering of cypress tests based on tags or test / suite title, 
by utilizing substring or regular expressions.

Here are key features:
 - quickly filter tests by tags / title using regular expressions and pseudo regular expressions
  (will be filtered any dynamic tags / or title )
 - ability to add tags to test (inline or with
cypress configuration for test or suite)
 -  UI control to filter tests within a selected spec file in Cypress interactive mode.
    
    It eliminates the need of using `.only`

    ![p1.gif](https://github.com/mmisty/cypress-grep/blob/main/docs-template/demo.gif)

## Installation

```
npm i @mmisty/cypress-grep
```

### Setup
#### Support


To set up package in your project, you need to import package within your `support/index.ts` file (or `support/e2e.ts` file,
depending on how you have set up your cypress project).

```javascript
import '@mmisty/cypress-grep/register';
```

Once this is done, types will be added automatically.

<details><summary>Override default environment variables for UI control</summary>

Override environment variables if needed to control UI feature (within cypress.config.ts or other way):
 - `GREP_addControlToUI` - add UI control to filter tests (only for interactive mode), default is `true`
 - `GREP_showTagsInTitle` - show tags in test title, default is `true`
 - `GREP_showExcludedTests` - show excluded tests as pending, default is `true`,

With this configuration, you will be able to control how tags are displayed in
the title, and whether excluded tests should be displayed as pending or not be displayed at all.

The `addControlToUI` parameter adds the UI control feature to Cypress Interactive mode,
allowing you to filter tests easily.

</details>


<details><summary>Advanced - if you don't want to use ECMA2015 syntax for importing</summary>

To import registering function you can use this configuration.

To set up package in your project, you need to add `registerCypressGrep` to
your `support/index.ts` file (or `support/e2e.ts` file,
depending on how you have set up your project).

Here's an example of the code you would need to add to `support/index.ts` (or `support/e2e.ts`):

```javascript
import { registerCypressGrep } from '@mmisty/cypress-grep';

registerCypressGrep({
  // This setting will only affect Interactive mode
  addControlToUI: true,

  // This setting will be controllable in Interactive mode
  // Default value for it would be taken from here
  showTagsInTitle: true,
  
  // This setting will be controllable in Interactive mode 
  // Default value for it would be taken from here
  showExcludedTests: true,
  
  // Fail prefiltering when no tests found that satisfy serch term
  // Default is true
  failOnNotFound: false
  
});
```
</details>


#### Plugins
Add plugin `pluginGrep` to you plugins to have ability to prefilter tests.

```
// cypress.config.ts

import { pluginGrep } from '@mmisty/cypress-grep/plugins';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      pluginGrep(on, config);

      return config;
    },
    baseUrl: 'https://example.cypress.io',
    ....
```


### Specify tags
You can specify tags in different ways while using the package:

1. Inline Tags: You can simply add tags in the title of tests or suites. 
 
   For example, `describe('Login @smoke', () => {...})` will add a `@smoke` tag to the suite.
   
   When `showTagsInTitle` is false inline tags will be removed, but GREP would still find them.

2. Config Tags: You can add tags to suites or tests by using the `tags` key in the Cypress configuration object

   You can pass a string or an array of strings as the value to `tags`. For example,

   ```javascript
   describe('login', { tags: '@smoke' }, () => {
     it('should login @P0 @regression', ()=> {
       // ...
     });
   
     it('special case on login', { tags: ['@P1', '@regression'] }, () => {
       // ...
     });
   });
   ```

   The above code will add the `@smoke` tag to the suite, `@P0` and `@regression` to the first test
   and `@P1` and `@regression` to the second test.

You can use any of the above ways to add tags to your tests or suites. 
These tags then help you to easily filter your tests.

### Run by tags

To run by tags you need to specify environment variable 'GREP'

Run all tests with @P1 tag
```
CYPRESS_GREP='@P1' npm run cy:run
```
or 

```
npx cypress run --env GREP='@P1'
```

#### Prefilter

When dealing with numerous spec files, filtering through all tests
can be time-consuming.

So here is prefilter functionality  - it boosts the speed of test execution with `GREP` and allows to
 filter tests by dynamically created tags or test titles.
It will run cypress in pre-filtering mode and output file with paths to found spec filed,
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

#### Note
There is some cypress misbehavior when there are **several spec patterns in config** (array of patterns),
you (actually we, as developers of this plugin) cannot totally change spec pattern from the inside
of cypress plugin, it still will have several items from initial spec pattern. 

In this case after prefiltering mode you'll need to run cypress with `--config specPattern='*.*'` to override spec pattern from config.

Example:

```javascript
// cypress.config.ts / js
 e2e: {
  specPattern: [
    `cypress/e2e/example/*.(cy|test|spec).ts`,
    `cypress/e2e/regression/**/*.(cy|test|spec).ts`,
  ]
}
```
In this case grep script will be: 
```
"cy:run:grep": "export CYPRESS_GREP_RESULTS_FILE='./filtered.json' && CYPRESS_GREP_PRE_FILTER=true npm run cy:run && npm run cy:run -- --config specPattern='*.*'",
```
Let's say we run `CYPRESS_GREP='@smoke' cy:run:grep` and prefiltering found only tests from `example` folder.
If not overriding config spec pattern it will go through 
specs from `regression`(in addition to `example`) folder as well in run mode. 

It will not find any matches there but will slow down the execution.
So just add `--config specPattern='*.*'` to your run script  after prefiltering is done.

#### Pseudo regexp
`GREP` env variable accepts pseudo regexps to filter tests:

 - Symbol `!` = not  
 - Symbol `&` = and
 - Symbol `|` or `/` = or

Other parts are being interpreted as regexp with caseinsensitive flag. 
So `GREP='1.2'` will be understood as `/1.2/i` and `.` will mach any symbol.

To have `.` symbol in grep you need to encode symbols `GREP='1\.2'` - will be understood as `/1\.2/i`

Here are some examples of pseudo regexp: 
 - `GREP='!(@e2e|@regression)'` - `!` at the beginning of expression with parenthesis will invert the result
- `GREP='!@'` - run all tests without tags
- `GREP='@e2e|@regression'` or `GREP='@e2e/@regression'` - runs all tests with `@e2e` or `@regression`
- `GREP='@P2&@smoke'` - runs all tests with `@P2` AND `@smoke`
- `GREP='@smoke&!@P2&!@P1'` - runs all tests with `smoke` and without `@P2` and without `@P1`
- `GREP='(@P1|@P2)&!@smoke'` or `GREP='(@P[12])&!@smoke'` - runs all tests with `@P2` or `@P1` and without `@smoke`

**Minor known issue with pseudo regexp**:
 - line `@suite @test` will NOT match this expression: `GREP='(@test&@suite)|@tag'`(for `@test @suite` matches), as a workaround rewrite to `GREP='(@test|@tag)&(@suite|@tag)'`
 - all other cases pass - you can check tested cases here if you are interested [tests/test-folder/regexp.test.ts](https://github.com/mmisty/cypress-grep/blob/main/tests/test-folder/regexp.test.ts#L5)

#### Regexp
There is also possibility to input pure regexp.
To do that you need to write regexp in the following form `GREP='=/.*/i'`

Examples:
- `GREP='=/(?=.*@smoke)(?=.*@p1).*/i'` - runs all tests that have `@smoke` AND `@p1` tags
- `GREP='=/^(?!.*@smoke)(?!.*@p1).*$/i'` - runs all tests WITHOUT `@smoke` and WITHOUT `@p1`
- `GREP='=/(?=.*@smoke)(?=.*@p1).*/i'` - runs all tests WITH `@smoke` and WITH `@p1`
- `GREP='=/(?!.*@smoke)(?=.*@p1)/i'` - runs all tests WITHOUT `@smoke` and WITH `@p1`
- `GREP='=/@P[12]/'` - runs all tests with `@P1` or `@P2`

### UI Control

#### Interactive mode

Search input will be injected into Cypress UI to filter tests. this is controlled by `addControlToUI` setting or `GREP_addControlToUI` 
environment variable

Controls has settings:
 - filter tests by title/tags
 - to show/hide tags in title
 - to show/hide excluded tests
  
![tags_search.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search.jpg)

##### Show tags in title
![tags_search_1.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_1.jpg)


##### Show excluded tests
![tags_search_2.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_2.jpg)


##### Do not show excluded tests
![tags_search_3.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_3.jpg)


### Thoubleshooting 

#### Cypress runs prefiltered tests every time 
Even when `GREP_PRE_FILTER` is not set. 

To avoid that:
1. option: to delete  `<root of the project>/filtered_test_paths.json` or file specified by `GREP_RESULTS_FILE`
2. option: you can run test every time (tags or not) by command with pre-filtering

   Example:

   package.json:

    ```
    {
      ...
      "scripts": {
        "cy:run:grep": "export CYPRESS_GREP_RESULTS_FILE='./filtered.json' && npm run cy:filter && npm run cy:run",
      }
      ...
    }
    
    ```

    ```shell
    # run without filtering
    npm run cy:run:grep
   
    # run with tags filtering
    CYPRESS_GREP='@tag' npm run cy:run:grep
    ```