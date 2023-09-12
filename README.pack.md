# @mmisty/cypress-grep

This package helps to quickly filter cypress tests by tags or title using regular expressions or pseudo regular expressions
(any **dynamic** tags will be also filtered), also it adds [UI control](#ui-control) for filtering which eliminates the need of using `.only` during tests development.

For reference: the package filters tests from 1000 spec files for less than 30 seconds and runs only filtered spec files which reduces execution time significantly.

For example you have 1000 spec files in your `cypress/e2e` folder and only one test that you want to run with tag `@theOne`([how to add tags for test](#specify-tags))

After running this your test will start running after <30 seconds:
```
cy-grep --script 'npm run cy:run' --grep '@theOne'
```

If you need to run all test except`@theOne` you can inverse the expression by `!`:
```
cy-grep --script 'npm run cy:run' --grep '!@theOne'
```

## Table of Contents

1. [Installation](#installation)
    - [1.Setup Support](#setup-support)
    - [2.Setup Plugins](#setup-plugins)
    - [4.Specify tags](#specify-tags)
        - [Tags inheritance](#tags-inheritance)
1. [Run by Tags](#run-by-tags)
    - [Select tests by pseudo regex](#select-tests-by-pseudo-regexp)
    - [Select tests by regex](#select-tests-by-regexp)
1. [Examples](#examples)
1. [UI Control](#ui-control)
    - [Show tags in title](#show-tags-in-title)
    - [Show excluded tests](#show-excluded-tests)
    - [Do not show excluded tests](#do-not-show-excluded-tests)
1. [Troubleshooting](#troubleshooting)
1. [Change log](#change-log)

## Installation

```
npm i @mmisty/cypress-grep
```

### Setup Support

To set up package in your project, you need to import package within your `support/index.ts` file (or `support/e2e.ts` file,
depending on how you have set up your cypress project).

```javascript
import '@mmisty/cypress-grep/register';
```

Once this is done, types will be added automatically.

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
  failOnNotFound: false,
});
```

</details>

### Setup Plugins

Add plugin `pluginGrep` to you plugins.

Do not forget to return config from setupNodeEvents function.

```
// cypress.config.ts

import { pluginGrep } from '@mmisty/cypress-grep/plugins';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      pluginGrep(on, config);

      // important, do not forget to return config
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
     it('should login @P0 @regression', () => {
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

#### Tags inheritance

Suite tags are being inherited in all child tests.

For example:

```javascript
describe('login', { tags: '@smoke' }, () => {
  it('01. should login @P1', () => {
    //... test code
  });

  describe('err on login', { tags: '@errors' }, () => {
    it('02. should have error on login @P2', () => {
      //... test code
    });

    it('03. should do smth on err', () => {
      //... test code
    });
  });
});
```

Test `01. should login` will have tags [`@smoke`, `@P1`]

Test `02. should have error on login` will have tags [`@smoke`, `@errors`, `@P2`]

Test `03. should do smth on err` will have tags [`@smoke`, `@errors`]


## Run by tags

To run by tags you can use script

```
cy-grep --script 'npm run cy:run' --grep '@p1'
```

it will run cypress twice:

- to prefilter tests
- to run prefiltered tests

Prefiltering significantly saves time when dealing with huge amount of spec files.

#### Add script to package.json

To have faster filtering it is better to add the following script into your package.json

For example, you have script that you want to run with grep:
`"cy:run": "npx cypress run --browser chrome --headless"`

To have faster filtering add:

```
"cy:grep": "cy-grep --script \"npm run cy:run\"",
```

And run it by:

```shell
npm run cy:grep -- --grep='@p1'
# or
CYPRESS_GREP='@p1' npm run cy:grep
```

To run all tests without prefiltering:

```shell
npm run cy:grep
```

### To only prefilter tests

```
cy-grep --script 'npm run cy:run' --grep '@p1' --only-prefilter
```

or

```
cy-grep --s 'npm run cy:run' --g '@p1' --f
```

#### To only run prefiltered tests

That were prefiltered previously execute:

```
cy-grep --script 'npm run cy:run' --grep '@p1' --only-run-prefiltered
```

or

```
cy-grep --s 'npm run cy:run' --g '@p1' --r
```

#### Specify file for prefiltered results

```
cy-grep --s 'npm run cy:run' --g '@p1' --p 'results.json'
```

#### To keep file with results

```
cy-grep --s 'npm run cy:run' --g '@p1' --no-delete-prefiltered
```

Or

```
cy-grep --s 'npm run cy:run' --g '@p1' --no-d
```

### Select tests by pseudo regexp

`CYPRESS_GREP` env variable or `--grep` option accept pseudo regexps to filter tests like `--grep '@p1&!@smoke'`:

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

### Select tests by regexp

There is also possibility to input pure regexp.
To do that you need to write regexp in the following form `GREP='=/.*/i'`

Examples:

- `GREP='=/(?=.*@smoke)(?=.*@p1).*/i'` - runs all tests that have `@smoke` AND `@p1` tags
- `GREP='=/^(?!.*@smoke)(?!.*@p1).*$/i'` - runs all tests WITHOUT `@smoke` and WITHOUT `@p1`
- `GREP='=/(?=.*@smoke)(?=.*@p1).*/i'` - runs all tests WITH `@smoke` and WITH `@p1`
- `GREP='=/(?!.*@smoke)(?=.*@p1)/i'` - runs all tests WITHOUT `@smoke` and WITH `@p1`
- `GREP='=/@P[12]/'` - runs all tests with `@P1` or `@P2`

## Environment variables
- `GREP_addControlToUI` - Add UI control to filter test (only for interactive mode), default true
- `GREP_showTagsInTitle` - Show tags in test title, default true
- `GREP_showExcludedTests` - Show excluded tests as pending or not show at all, default true
- `GREP_failOnNotFound` - Whether to fail run when no tests are found, default true

## Examples
- example [JS project](https://github.com/mmisty/cypress-grep-example)
- example [TS project](https://github.com/mmisty/cypress-grep-example-ts)

## UI Control

Search input will be injected into Cypress UI to filter tests when running Interactive mode
(`cypress open`). This is controlled by `addControlToUI` setting or `GREP_addControlToUI`
environment variable

Controls have settings:

- filter tests by title/tags
- to show/hide tags in title
- to show/hide excluded tests

![p1.gif](https://github.com/mmisty/cypress-grep/blob/main/docs-template/demo.gif)

![tags_search.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search.jpg)

### Show tags in title

![tags_search_1.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_1.jpg)

### Show excluded tests

![tags_search_2.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_2.jpg)

### Do not show excluded tests

![tags_search_3.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_3.jpg)

## Troubleshooting

### Cypress runs prefiltered tests every time

Even when `GREP_PRE_FILTER` is not set.

To avoid that:

1. option: to delete `<root of the project>/filtered_test_paths.json` or file specified by `GREP_RESULTS_FILE`
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

## Change log
[see change log](./CHANGELOG.md)


## todo
- [ ] ability to run parallel
- [ ] tech - publish on github
- [ ] correct publishing