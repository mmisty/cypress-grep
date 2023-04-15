const controlsHeight = 30;
const iconWidth = 16;

export const style = (testsCountSelector: string, iconContainerSearch: string) => (parentId: string) =>
  `
  .reporter pre {
     background-color: #f3f3fb;
     color: #696e87;
  
  }
.reporter .controls {
  height: ${controlsHeight}px;
}

.reporter .stats  {
  height: ${controlsHeight}px;
}
      
#${parentId} {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  padding:0px;
  margin:0px;
}

.input-container {
  height: ${controlsHeight}px;
  box-sizing: border-box;
  min-width: 250px;
  display: flex;
  align-items: center;
  border-radius: 5px;
  padding: 5px;
}

${iconContainerSearch} {
  height: ${controlsHeight}px;
  width: ${controlsHeight}px;
  box-sizing: border-box;
  border-radius-left: 4px;
  margin: 0px;
  margin-left: -5px;
  padding: 0px;
  font-weight: bold;
  text-align: center;
}

${iconContainerSearch} i {
  padding-top: ${controlsHeight / 3.5}px;
  color: #5a5f7a;
}

${iconContainerSearch}:hover {
  cursor:pointer;
  background-color: #292e40;
  color: #848799;
}

.tooltip {
  display: none;
  position: absolute;
  padding: 10px;
  border-radius: 5px;
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

.tooltip:hover {
  cursor:initial;
}

${iconContainerSearch}:hover .tooltip {
  display: block;
}

.input-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

input[type="text"] {
  height: ${controlsHeight}px;
  border: none;
  outline: none;
  flex-grow: 1;
  background-color:#00000000;
}

.clear-input {
  width: ${iconWidth}px;
  height: ${controlsHeight - 2}px;
  margin-top: -${2}px;
  opacity: 1;
  padding-left: 10px;
  padding-right: ${iconWidth + 2}px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: -5px;
}

.clear-input i {
  color: #5a5f7a;
}

.clear-input:hover i {
  color: #888;
}
.clear-input:hover {
  background-color: #292e40;
}

${testsCountSelector} {
  height: ${controlsHeight}px;
  padding-top: ${controlsHeight / 7}px;
  color: #5a5f7a;
  font-weight: bold;
  border: none;
  outline: none;
  min-width:30px;
  text-align: center;
  font-size: 14px;
  border-right: 1px solid #2e3247;
  border-left: 1px solid #2e3247;
}

${testsCountSelector}::after {
  content: attr(data-tooltip);
  z-index: 1;
  position: absolute;
  padding: 4px 8px 4px 8px;
  border-radius: 5px;
  background-color: #f3f3fb;
  color: #000;
  font-weight: normal;
  font-size: 12px;
  white-space: nowrap;
  display: none;
}

${testsCountSelector}:hover::after {
  display: block;
}


`;
