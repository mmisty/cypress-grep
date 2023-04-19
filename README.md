# @mmisty/cypress-grep
The package enables filtering of tests based on tags or title, 
by utilizing substring or regular expressions.

Here are key features:
 - ability to add tags to test (inline or with
cypress configuration for test or suite)
 - filter tests by tags / title using regular expressions and pseudo regular expressions
   (will be filtered any dynamic tags / or title )
 -  UI control to filter tests within a selected spec file in Cypress interactive mode.

   It eliminates the need of using `.only`


![p1.gif](https://github.com/mmisty/cypress-grep/blob/main/docs-template/demo.gif)

## Installation

```
npm i @mmisty/cypress-grep
```

### Setup
To set up @mmisty/cypress-grep in your project, you need to add `registerCypressGrep` to
your `support/index.ts` file (or `support/e2e.ts` file, 
depending on how you have set up your project).

Once this is done, types will be added automatically. 
Here's an example of the code you would need to add to `support/index.ts` (or `support/e2e.ts`):

```javascript
import { registerCypressGrep } from '@mmisty/cypress-grep';

registerCypressGrep({
  // This setting will only affect Interactive mode
  addControlToUI: true,

  // This setting will be controllable in Interactive mode 
  showTagsInTitle: true,
  
  // This setting will be controllable in Interactive mode 
  showExcludedTests: true, 
  
});
```
With this configuration, you will be able to control how tags are displayed in 
the title, and whether excluded tests should be or not be displayed (as pending). 

The `addControlToUI` parameter adds the UI control feature to Cypress Interactive mode,
allowing you to filter tests easily.

### Specify tags
You can specify tags in different ways while using the package:

1. Inline Tags: You can simply add tags in the title of tests or suites. 
 
   For example, `describe('Login @smoke', () => {...})` will add a `@smoke` tag to the suite.
   
   When `showTagsInTitle` is false inline tags will be removed

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
It will run cypress in pre-filtering mode and output file with results,
which then will be used to filter test in run mode.

To run tests with prefilter you need to run cypress twice:
1. first time with `GREP_PRE_FILTER=true` env variable and with your Grep expression (`GREP="@P1"`)
2. second time with the same grep expression

You can create script in package.json to simplify this:
```json
"cy:run:grep": "CYPRESS_GREP_PRE_FILTER=true npm run cy:run && npm run cy:run",
```

and run it by `GREP="@P1" npm run cy:run:grep`

To conigure result file you can specify paths:
- set `GREP_TEMP_PATH` = path where result file will be stored, default `<root of the project>/filtered_test_paths.json`
- set `GREP_ALL_TESTS_NAME` = test file name, default `all_tests.ts`

Do not forget to add these files into `.gitignore`

Under the hood:
- this will create file with all tests, quickly filters all tests inside it and write file with result
- on next run will read the file and run only filtered files

#### Pseudo regexp
To filter tests you can use pseudo regexp:

 - Symbol `!` = not  
 - Symbol `&` = and
 - Symbol `|` = or

Other parts are being interpreted as regexp with caseinsensitive flag. 
So `GREP='1.2'` will be understood as /1.2/i and `.` will mach any symbol.

To have '.' symbol in grep you need to encode symbols `GREP='1\.2'` - will be understood as /1\.2/i

Here are some examples of pseudo regexp: 
 - `!` - at the beginging of expression will invert result
- `!@` - run all tests without tags
- `@e2e|@regression` or `@e2e/@regression` - runs all tests with `@e2e` or `@regression`
- `@P2&@smoke` - runs all tests with `@P2` AND `@smoke`
- `@smoke&!@P2&!@P1` - runs all tests with `smoke` and without `@P2` and without `@P1`
- `(@P1|@P2)&!@smoke` or `(@P[12])&!@smoke` - runs all tests with `@P2` or `@P1` and without `@smoke`

#### Regexp
There is also possibility to input pure regexp.
To do that you need to write regexp in the following form `GREP='=/.*/i'`

Examples:
- `=/(?=.*@smoke)(?=.*@p1).*/i` - runs all tests that have `@smoke` AND `@p1` tags
- `=/^(?!.*@smoke)(?!.*@p1).*$/i` - runs all tests WITHOUT `@smoke` and WITHOUT `@p1`
- `=/(?=.*@smoke)(?=.*@p1).*/i` - runs all tests WITH `@smoke` and WITH `@p1`
- `=/(?!.*@smoke)(?=.*@p1)/i` - runs all tests WITH `@smoke` and with `@tags`
- `=/@P[12]/` - runs all tests with `@P1` or `@P2`

### UI Control

#### Interactive mode
Run by @P1
![tags_search_0.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_0.jpg)

Show tags in title
![tags_search_2.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_2.jpg)

Show tags in title and show excluded tests
![tags_search_4.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_4.jpg)

run tests by combination:
![tags_search_5.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_5.jpg)
