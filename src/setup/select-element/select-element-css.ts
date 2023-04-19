const controlsHeight = 30;
const iconHeight = 20;
const inputWidth = 116;

export const style = (testsCountSelector: string, iconContainerSearch: string) => (parentId: string) =>
  `
  .reporter pre {
     background-color: #f3f3fb;
     color: #696e87;
  
  }
.reporter .controls {
  height: ${controlsHeight}px;
  border-radius: 6px;
}

.reporter .stats  {
  height: ${controlsHeight}px;
}
      
#${parentId} {
  display: flex;
  flex-grow: 2;
  flex-direction: column;
  align-items: baseline;
  padding:0px;
  margin:0px;
}

#${parentId} .input-container {
  height: ${controlsHeight}px;
  box-sizing: border-box;
  min-width: 150px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 5px;
}

#${parentId} .btn-wrapper-icon {
  height: ${controlsHeight}px;
}

#${parentId} ${iconContainerSearch} {
  height: ${controlsHeight}px;
  width: ${iconHeight + 5}px;
  box-sizing: border-box;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  margin: -0px;
  margin-left: -5px;
  padding: 0px;
  font-weight: bold;
  text-align: center;
}

#${parentId} .flex-center {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
}

#${parentId} ${iconContainerSearch} i {
  color: #5a5f7a;
}

#${parentId} ${iconContainerSearch}:hover {
  cursor:pointer;
  background-color: #292e40;
  color: #848799;
}

#${parentId} .tooltip {
  display: none;
  position: absolute;
  padding: 10px;
  border-radius: 4px;
  background-color: #f3f3fb;
  border: 1px solid #2e3247;
 
  font-size: 12px;
  color: #000;
  font-weight: normal;
  
  white-space: nowrap;
  text-align: left;
  max-height: 300px;
  overflow-y:auto;
  overflow-x:hidden;
  width: 200px;
  white-space: initial;
}

#${parentId} .tooltip:hover {
  cursor:initial;
}

#${parentId} ${iconContainerSearch}:hover .tooltip {
  display: block;
}

#${parentId} .input-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin-top: -7px;
}

#${parentId} input[type="text"] {
  height: ${controlsHeight}px;
  max-width: ${inputWidth}px;
  border: none;
  outline: none;
  flex-grow: 1;
  background-color:#00000000;
}

#${parentId} ${testsCountSelector} {
  height: ${controlsHeight}px;
  color: #5a5f7a;
  font-weight: bold;
  border: none;
  outline: none;
  min-width:30px;
  text-align: center;
  font-size: 14px;
  /**border-right: 1px solid #2e3247;
  border-left: 1px solid #2e3247;**/
}

#${parentId} .btn {
  box-sizing: border-box;
  border: 1px solid #00000000;
 
  width: ${iconHeight + 4}px;
  height: ${controlsHeight}px;
  margin-top: 1px;
  opacity: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
}

#${parentId} .btn.show-pending {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
#${parentId} .btn.clear-input{
  border-right: 1px solid #2e3247;
  width: ${iconHeight}px;
}
#${parentId} .btn i {
  color: #5a5f7a;
}

#${parentId} .btn:hover i {
  color: #8298e1;
}

#${parentId} .btn:hover {
  background-color: #292e40;
}

#${parentId} .btn[data-show-tags="true"] {
  border-left: 1px solid #2e3247;
  background-color: #363c52;
}
#${parentId} .btn[data-show-pending="true"] {
  border-left: 1px solid #2e3247;
  background-color: #363c52;
}

#${parentId} .btn[data-show-tags="true"] i {
  color: #8298e1;
}

#${parentId} .btn[data-show-pending="true"] i {
  color: #8298e1;
}

#${parentId} .btn-wrapper::after {
  content: attr(data-tooltip);
  position: absolute;
  z-index: 2;
  padding: 4px 8px 4px 8px;
  border-radius: 4px;
  border: 1px solid #2e3247;
  background-color: #f3f3fb;
  color: #000;
  font-weight: normal;
  font-size: 12px;
  min-width: 100px;
  display: none;
  white-space: nowrap;
}

#${parentId} ${testsCountSelector}::after {
  content: attr(data-tooltip);
  z-index: 2;
  position: absolute;
  padding: 4px 8px 4px 8px;
  border-radius: 4px;
  background-color: #f3f3fb;
  color: #000;
  font-weight: normal;
  font-size: 12px;
  white-space: nowrap;
  display: none;
}

#${parentId} [data-tooltip]:hover::after {
  display: block;
}

#${parentId} .end {
  height: ${controlsHeight}px;
  margin-left: -5px;
}
`;
