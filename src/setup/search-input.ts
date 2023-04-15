import { cypressAppSelect, setupControlsExtension } from 'cypress-controls-ext';
import { helpText } from 'cy-local/setup/regexp';

export const getItemValueForUI = (item: string, selector: string): string | undefined => {
  const val =
    cypressAppSelect(selector).val() !== undefined
      ? cypressAppSelect(selector).val()
      : cypressAppSelect(selector).text();

  return val ? `${val}` : undefined;
};

export const addSearchInput = () =>
  setupControlsExtension({
    mode: { open: true },
    id: 'searchInput',
    style: parentId =>
      `
#${parentId} {
  display: flex;
  flex-direction: row;
  align-items: baseline;
 padding:0px;
 margin:0px;
}

.input-container {
  height: 24px;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  border: 1px solid #2e3247;
  border-radius: 5px;
  padding: 5px;
}

.icon-container {
  margin-right: 5px;
  padding: 4px;
  box-sizing: border-box;
  height: 24px;
  width: 24px;
  border-radius: 8px;
  color: #848799;
  font-weight: bold;
  text-align: center;
}

.icon-container:hover {
  cursor:pointer;
  background-color: #474c61;
  color: #848799;
}

.tooltip {
  display: none;
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  background-color: #555868;
  border: 1px solid #2e3247;
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  text-align: left;
  max-height: 300px;
  overflow:auto;
}
.tooltip:hover{
  cursor:initial;
}

.icon-container:hover .tooltip {
  display: block;
}

.input-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

input[type="text"] {
  border: none;
  outline: none;
  flex-grow: 1;
  
  background-color:#00000024;
}

.clear-input {
  width: 14px;
  opacity: 0;
  margin-left: 5px;
  cursor: pointer;
}

.clear-input i {
  color: #ccc;
}

.clear-input:hover i {
  color: #888;
}


.number-input {
  margin-left: 5px;
  background-color:#00000024;
  color: #c4c4c4;
  border: none;
  outline: none;
  width:40px;
  text-align: center;
}

`,
    control: () =>
      `<hr/>

<div class="input-container">
  <div class="icon-container" >
    <i class="fas fa-search"></i>
     <div class="tooltip" >
      <h4>Search</h4>
      <p>Enter a search term in the field to find matching results.</p>
      
      ${helpText}
    </div>

  </div>
  <div class="input-wrapper">
    <input type="text" id="grep" placeholder="Search tests..." value="${
      Cypress.env('GREP') ?? getItemValueForUI('GREP', '#grep') ?? ''
    }"/>
    
    <div class="clear-input">
      <i class="fas fa-times"></i>
    </div>

    <div class="number-input" id="tests-count">
       ${getItemValueForUI('GREP_COUNT', '#tests-count') ?? '0'}
    </div>
  </div>
</div>`,
    addEventListener: (parentId, listener, cyStop, cyRestart) => {
      listener('#grep', 'change', () => {
        cyStop();
        cyRestart();
      });

      listener('#grep', 'input', () => {
        const searchField = cypressAppSelect('#grep');
        const clearInput = cypressAppSelect('.clear-input');
        const value = searchField.val() as string;
        clearInput.css('opacity', value?.length > 0 ? '1' : '0');
      });

      listener('.clear-input', 'click', () => {
        console.log('CLEAR');
        const searchField = cypressAppSelect('#grep');
        const clearInput = cypressAppSelect('.clear-input');
        searchField.val('');
        clearInput.css('opacity', '0');
      });

      listener('.icon-container', 'mouseover', () => {
        const tooltip = cypressAppSelect('#tooltip');
        // for some reason cypress header has sticky position and hovers tooltip
        const cyHeader = cypressAppSelect('.reporter .runnable-header');

        tooltip.css('opacity', '1');
        cyHeader.css('z-index', '0');
      });

      listener('.icon-container', 'mouseout', () => {
        const tooltip = cypressAppSelect('#tooltip');
        // for some reason cypress header has sticky position and hovers tooltip
        const cyHeader = cypressAppSelect('.reporter .runnable-header');

        tooltip.css('opacity', '0');
        cyHeader.css('z-index', '1');
      });
    },
  });
