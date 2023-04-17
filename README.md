# @mmisty/cypress-grep
The package enables filtering of tests based on tags or title, by utilizing substring or regular expressions.

It eliminates the need for using `.only`, as it provides a user interface control that allows tests to be filtered within a selected file, as shown in the following gif:
![p1.gif](https://github.com/mmisty/cypress-grep/blob/main/docs-template/p1.gif)

## Installation

```
npm i @mmisty/cypress-grep
```

### Setup
To set up @mmisty/cypress-grep in your project, you need to add `registerCypressGrep` to
your `support/index.ts` file (or `support/e2e.ts` file, 
depending on how you have set up your project).

Once this is done, types will be added automatically. Here's an example of the code you would need to add to `setup.ts`:

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
the title, and whether or not excluded tests should be displayed (as pending). 

The `addControlToUI` parameter adds the UI control feature to Cypress Interactive mode,
allowing you to filter tests easily.

### Specify tags
You can specify tags in different ways while using the package:

1. Inline Tags: You can simply add tags in the title of tests or suites. 
 
   For example, `describe('Login @smoke', () => {...})` will add a `@smoke` tag to the suite.


2. Config Tags: You can add tags to suites or tests by using the `tags` key in the configuration object

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
These tags then help you to easily filter your tests based on their tags.

### Run by tags

#### Interactive mode
Run by @P1
![tags_search_0.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_0.jpg)

#### Run mode
To run by tags you need to specify environment variable 'GREP'

Run all tests with @P1 tag
```
CYPRESS_GREP='@P1' npm run cy:run
```
or 

```
npx cypress run --env GREP='@p1'
```

Here are some examples: 
- `!@` - run all tests without tags
- `@e2e|@regression` - OR: runs all tests with `@e2e` or `@regression`
- `@e2e/@regression` - OR: runs all tests with `@e2e` or `@regression`
- `@P2&@GG` - AND: runs all tests with `@P2` AND `@GG`
- `@smoke&!@P2&!@P1` - AND with EXCLUSION: runs all tests with `smoke` and without `@P2` and without `@P1`
- `(@P1|@P2)&!@smoke` - AND with EXCLUSION: runs all tests with `@P2` or `@P1` and without `@smoke`
- `(@P[12])&!@smoke` - AND with EXCLUSION: runs all tests with `@P2` or `@P1` and without `@smoke`

There is also possibility to input pure regexp:
- `=/(?=.*@smoke)(?=.*@p1).*/i` - AND - runs all tests that have `@smoke` and `@p1` tags
- `=/^(?!.*@smoke)(?!.*@p1).*$/i` - runs all tests WITHOUT `@smoke` and WITHOUT `@tags`
- `=/(?=.*@smoke)(?=.*@p1).*/i` - Exclude (can be used `!` at the beggining of line to inverse the whole expression) - runs all tests WITHOUT `@gg` and WITHOUT `@tags`
- `=/(?!.*@smoke)(?=.*@p1)/i` - runs all tests WITHOUT `@smoke` and with `@tags`
- `=/@P[12]/` - runs all tests with `@P1` or `@P2`

### Prefilter ability
When dealing with numerous spec files, filtering through all tests 
can be time-consuming. 
Luckily, with new version of the package we have enhanced pre-filtering 
capabilities which bosts the speed of test execution when working with grep. 

We can filter tests by dynamic tags or test titles, as demonstrated by the example 
code block provided:

Example:
Assume we have the following file and we want to quickly run only tests with `@Release3.0` and `@P1` tags.
```javascript
const P1 = '@P1';
const Releases = ['1.1', '1.2', '3.0'].map(tag => '@Release' + tag);

describe('login', { tags: Releases }, () => {
   it('special case on login', { tags: [P1] }, () => {
      // ...
   });
});

```
To do so you need to run cypress twice: 
 1. first time with `GREP_PRE_FILTER=true` env variable and with your Grep expression (`GREP="@Release3\.0&@P1"`)
 2. second time with the same grep expression

You can create script in package.json to simplify this: 
```json
"cy:run:grep": "CYPRESS_GREP_PRE_FILTER=true npm run cy:run && npm run cy:run",
```

and run it by `GREP="@Release3\.0&@P1" npm run cy:run:grep`

To conigure files/paths: 
 - set `GREP_TEMP_PATH` = path where result file will be stored, default `<root of the project>/filtered_test_paths.json`
 - set `GREP_ALL_TESTS_NAME` = test file name, default `all_tests.ts`


Under the hood:
- this will create file with all tests, quckly filters all tests inside it and write file with result
- on next run will read the file and run only filtered files

### UI Control

Show tags in title
![tags_search_2.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_2.jpg)

Show tags in title and show excluded tests
![tags_search_4.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_4.jpg)

run tests by combination:
![tags_search_5.jpg](https://github.com/mmisty/cypress-grep/blob/main/docs-template/tags_search_5.jpg)
