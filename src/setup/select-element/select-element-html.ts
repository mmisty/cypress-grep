import { getItemValueForUI } from 'cy-local/setup/search-input';

// todo add link to readme
const helpText = `
  <p>Enter search term to find tests. Does accept tags, substring of test title / suite title. You can use:
  <ul>
    <li> - pseudo regexp (& | !)
    <pre>@tag1&@tag2</pre>
    </li>
    <li> - regexp <pre>=/my regexp/i</pre></li>
  </ul>
  
  </p>
  
  <p><a href="link to git">more info</a></p>
`;

export const html = (testsCountSelector: string, grepSelector: string, iconContainerSearch: string) => `<hr/>
<div class="input-container">
  <div class="${iconContainerSearch.slice(1)}" >
    <i class="fas fa-search"></i>
     <div class="tooltip" >
      ${helpText}
    </div>
  </div>
  <div class="input-wrapper">
    <div class="${testsCountSelector.slice(1)}" data-tooltip="number of found tests">
       ${getItemValueForUI('GREP_COUNT', testsCountSelector) ?? '0'}
    </div>
    <input type="text" id="${grepSelector.slice(1)}" placeholder="Search tests..." value="${
  Cypress.env('GREP') ?? getItemValueForUI('GREP', grepSelector) ?? ''
}"/>
    <div class="clear-input">
      <i class="fas fa-times"></i>
    </div>
  </div>
</div>`;
