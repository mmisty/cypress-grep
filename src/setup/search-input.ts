import { cypressAppSelect, setupControlsExtension } from 'cypress-controls-ext';
import { helpText } from 'cy-local/setup/regexp';

export const getItemValueForUI = (item: string, selector: string): string | undefined => {
  const val =
    cypressAppSelect(selector).val() !== undefined
      ? cypressAppSelect(selector).val()
      : cypressAppSelect(selector).text();

  return val ? `${val}` : undefined;
};
const height = 30;

export const addSearchInput = () =>
  setupControlsExtension({
    mode: { open: true },
    selectorToInject: '.reporter .controls',
    id: 'searchInput',
    style: parentId =>
      `
     
      .reporter .controls {
         height: ${height}px;
      }
      
      .reporter .stats  {
        height: ${height}px;
      }
      
#${parentId} {
  display: flex;
  flex-direction: row;
  align-items: baseline;
 padding:0px;
 margin:0px;
}

.input-container {
  height: ${height}px;
  box-sizing: border-box;
  min-width: 250px;
  display: flex;
  align-items: center;
  border-radius: 5px;
  padding: 5px;
}

.icon-container {
  height: ${height}px;
  width: ${height}px;
  box-sizing: border-box;
  border-radius: 5px;
  margin: 0px;
  margin-left: -5px;
  padding: 0px;
  color: #848799;
  font-weight: bold;
  text-align: center;
}

.icon-container i {
  padding-top: ${height / 3}px;
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
  overflow-y:auto;
  overflow-x:hidden;
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
  height: ${height}px;
  border: none;
  outline: none;
  flex-grow: 1;
  background-color:#00000000;
}

.clear-input {
  width: 14px;
  height: ${height - 2}px;
  margin-top: -${2}px;
  opacity: 1;
  padding-left: 10px;
  padding-right: 15px;
  cursor: pointer;
  background-color:#76767624;
  display: flex;
  align-items: center;
  margin-right: -5px;
  
}

.clear-input i {
  color: #ccc;
}

.clear-input:hover i {
  color: #888;
}


.number-input {
  height: ${height}px;
  padding-top: ${height / 7}px;
  color: #c4c4c4;
  border: none;
  outline: none;
  min-width:20px;
  text-align: center;
  font-size: 14px;
  border-right: 1px solid #2e3247;
  border-left: 1px solid #2e3247;
}

.number-input::after{
  content: attr(data-tooltip);
  z-index: 1;
  position: absolute;
  padding: 4px 8px 4px 8px;
  border-radius: 5px;
  background-color: #555868;
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  display: none;
}

.number-input:hover::after {
  display: block;
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
  
    <div class="number-input" id="tests-count" data-tooltip="number of found tests">
       ${getItemValueForUI('GREP_COUNT', '#tests-count') ?? '0'}
    </div>
    <input type="text" id="grep" placeholder="Search tests..." value="${
      Cypress.env('GREP') ?? getItemValueForUI('GREP', '#grep') ?? ''
    }"/>
    
    <div class="clear-input">
      <i class="fas fa-times"></i>
    </div>

    
  </div>
</div>`,
    addEventListener: (parentId, listener, cyStop, cyRestart) => {
      listener('#grep', 'change', () => {
        cyStop();
        cyRestart();
      });

      listener('.clear-input', 'click', () => {
        console.log('CLEAR');
        const searchField = cypressAppSelect('#grep');
        searchField.val('');
      });

      const setZindex = (val: number) => {
        // for some reason cypress header has sticky position and hovers tooltip
        const cyHeader = cypressAppSelect('.reporter .runnable-header');

        cyHeader.css('z-index', `${val}`);
      };

      listener('.icon-container', 'mouseover', () => {
        console.log('HOVER');
        setZindex(0);
      });

      listener('.number-input', 'mouseover', () => {
        // for some reason cypress header has sticky position and hovers tooltip
        console.log('HOVER');
        setZindex(0);
      });

      listener('.icon-container', 'mouseout', () => {
        console.log('OUTHOVER');
        setZindex(1);
      });

      listener('.number-input', 'mouseout', () => {
        console.log('OUTHOVER');
        setZindex(0);
      });
    },
  });
