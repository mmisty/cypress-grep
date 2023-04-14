import { registerCommands } from '../commands';
import { cypressAppSelect, setupControlsExtension } from 'cypress-controls-ext';

const getItemValueForUI = (item: string, selector: string): string | undefined => {
  const val =
    cypressAppSelect(selector).val() !== undefined
      ? cypressAppSelect(selector).val()
      : cypressAppSelect(selector).text();

  return val ? `${val}` : undefined;
};

const helpText = `
<div class="text flex">

<div>
  <span>you can put regexp expression here to filter tests</span>
    <a href="link to git">more info</a>
</div>

<div class="close-icon">X</div>
 
 </div>
`;

//style="padding: 2px;width:10px;font-size:15px;"
export const myPluginSetup = (config?: { addControlToUI: boolean }) => {
  // here you can do setup for each test file in browser

  if (config?.addControlToUI) {
    setupControlsExtension({
      mode: { open: true },
      id: 'toggle',
      style: parentId =>
        `
        #${parentId} {
          display: flex;
          flex-direction: row;
         align-items: baseline;
        }
        
      #hideWrapper {color: #ffffffba;border-radius: 7px;
          background-color:#00000024;font-size:15px;height: 35px;
          padding: 5px 10px 5px 10px;
      }
      .disp-none { display:none }
      .close-icon:hover{
        cursor:pointer;
        background-color: #C0C0C0;
      }
      #info:hover {
        cursor:pointer;
        background-color: #4cc6ff;
        
        background: #FFF;
        background-color: #474c61;
        color: #000;
      }
      #info {
        padding: 4px;
        
         box-sizing: border-box;
        position: relative;
        top: 1px;
        left: -70px;
        height: 24px;
        width: 24px;
        border-radius: 8px;
        color: #848799;
        font-weight: bold;
        background: #FFF;
        background-color: #2e3247;
        text-align: center;
      }
      .close-icon {
        height: 20px;
        width: 40px;
        border-radius: 7px;
        text-align: center;
        margin-right: -8px;
      }
      
       
       #tooltip {
          opacity: 0;
          position: absolute;
          top: 53px;
          z-index: 5;
          height: 250px;
      }
     
      
      #tooltip .text {
          overflow: auto;
          position: relative;
          top: 0px;
          left: -34px;
        
        /* style the tooltip */
        min-width: 50px;
        width: 200px;
        background-color: #FFF;
        color: black;
        font-size: 10pt;
          border-radius: 7px;
        padding: 3px 10px 6px;
      }
      .text-field {
      
         color: #fffddd;
         border-radius: 7px;
         background-color:#00000024;
         font-size:15px;
         margin-top:-5px;
         width: 35px;
      }
      #grep{
         min-height: 36px;
      overflow:auto;
      font-family: courier;
      width:200px;}
      
      .flex{
        display: flex;
        flex-direction: row;
      }
      #select-test{
        display: flex;
        flex-direction: row;
        align-items: baseline;
      }
     
      #tests-count {
       position: relative;
       top: 1px;
         min-height: 36px;
         background-color:#1b1e2e;
          text-align: center;
         color: #6a6a6a;
         box-sizing: border-box;
          /*position: relative;
          left: -45px;
          height:29px;*/
          margin-left: -9px;
          width: 44px;
         
         border-radius: 7px;
         border:solid 1px;
         border-left: solid #262626;
      }
      
       .text-field::placeholder{
         color: #5c5c5c;
     
      }
      `,
      control: () =>
        `<hr/>
         
         <div class="item" id="select-test" >
          <input id="grep" class="text-field" type="text"  placeholder="select tests" value="${
            Cypress.env('GREP') ?? getItemValueForUI('GREP', '#grep') ?? ''
          }"/>
          <input id="tests-count" class="text-field" disabled type="text" value="${
            getItemValueForUI('GREP_COUNT', '#tests-count') ?? '0'
          }"/>
          <div id="info">i</div>
          <div id="tooltip">${helpText}</div>
         </div>`,
      addEventListener: (parentId, listener, cyStop, cyRestart) => {
        listener('#grep', 'change', () => {
          cyStop();
          cyRestart();
        });

        listener('#info', 'click', () => {
          const tooltip = cypressAppSelect('#tooltip');

          const current = tooltip.css('opacity');
          const cyHeader = cypressAppSelect('.reporter .runnable-header');

          if (current === '1') {
            tooltip.css('opacity', '0');
            cyHeader.css('z-index', '1');
          } else {
            tooltip.css('opacity', '1');
            cyHeader.css('z-index', '0');
          }
        });

        listener('.close-icon', 'click', () => {
          const tooltip = cypressAppSelect('#tooltip');
          const cyHeader = cypressAppSelect('.reporter .runnable-header');

          tooltip.css('opacity', '0');
          cyHeader.css('z-index', '1');
        });
      },
    });
  }

  registerCommands();
};
