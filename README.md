
# @mmisty/cypress-grep
Filter tests by tags or title using substring or regular expressions.

Also package allows to add UI control with ability to filter tests in selected file

![control](./docs-template/control.jpg)



## Installation

```
npm i @mmisty/cypress-grep
```


### Setup

```javascript
// setup.ts
import { registerCypressGrep } from '@mmisty/cypress-grep';

registerCypressGrep({
  // will affect only Interactive mode
  addControlToUI: true, // you can create environment variable to show controls
  showTagsInTitle: true,
});
```

## Specify tags
Tags could be specified in different ways:
 - just input in title `@smoke`
 - add config to suite or test `{ tags: '@smoke' }` or `{ tags: ['@smoke'] }`

```javascript
describe('login', { tags: '@smoke' }, () => {
  // ...
  it('should login @P0 @regression', ()=> {
    // ...
  })
  
  // ...
  
  it('special case on login', { tags: ['@P1', '@regression'] }, () => {
    // ...
  });
  
 
});

```

### Run by tags
 For the above example to run by tags: 






