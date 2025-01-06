import { ForwardedRef, forwardRef, useState, useRef, useEffect } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';
import { CONST_PV_SERVICES } from "../../constants/linkDomains";
import { urlRenderer, sharedContextMenuOptions } from "./shared";

const PlayLinksInputTable = forwardRef(function PlayLinksInputTable(
  _,
  ref: ForwardedRef<any>
) {

  const headerText = ['Site', 'URL', 'Reprint?', 'Auto-gen?', 'Deleted?', 'View Count'];

  const handleChanges = (changes: any[][] | null) => {
    for (let change of (changes || [])) {
      let [rowId, colId, _, newValue] = change;      
      if (colId === 1) {    // changed cell is URL 
        const referUrl = CONST_PV_SERVICES.find(({ re }) => {
          return newValue.match(re) !== null;
        });
        if (referUrl !== null) {
          // @ts-ignore
          ref?.current?.hotInstance?.setDataAtCell(rowId, 0, referUrl?.site);   // set description automatically
          const tryYtMatch = newValue.match(/https?:\/\/youtu\.be\/([^\/\?&]+)/);
          if (tryYtMatch !== null) {
            newValue = `https://www.youtube.com/watch?v=${tryYtMatch[1]}`;
            change[3] = newValue;
          }
        }
      }
    }
  }
  
  const columnDefinitions = [
    { 
      type: 'dropdown',
      source: CONST_PV_SERVICES.map(el => el.site),
      strict: false,
      allowInvalid: true,
      validator: undefined
    },
    { 
      type: 'text', 
      renderer: urlRenderer
    },
    { type: 'checkbox', className: 'htCenter htMiddle' },
    { type: 'checkbox', className: 'htCenter htMiddle' },
    { type: 'checkbox', className: 'htCenter htMiddle' },
    { type: 'text' }
  ];

  const [colWidths, setColWidths] = useState<number[]>([130, 250, 90, 90, 90, 90]);
  const calculateColWidths = () => {
    const maxWidth = (containerRef.current as HTMLDivElement).clientWidth;
    const calcColWidths = [130, 250, 90, 90, 90, 90];
    const minWidth = calcColWidths.reduce((s, cur) => s + cur, 50);
    if (maxWidth >= minWidth) {
      calcColWidths[1] += (maxWidth - minWidth);
    } else {
      calcColWidths[1] = 200;
      calcColWidths[2] = calcColWidths[3] = calcColWidths[4] = calcColWidths[5] = 
        Math.floor((maxWidth - 50 - calcColWidths[0] - calcColWidths[1]) / 4);
    }
    setColWidths(calcColWidths);
  };
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(calculateColWidths, []);

  return (
    <div className="table-container" ref={containerRef}>
      <HotTable
        ref={ref}
        tableClassName='playlinks-table'
        rowHeaders={true}
        colHeaders={headerText}
        columns={columnDefinitions}
        width="100%"
        contextMenu={sharedContextMenuOptions}
        autoWrapRow={true}
        autoWrapCol={true}
        manualColumnResize={true}
        // imeFastEdit={true}
        selectionMode="multiple"
        // rowHeights={30}
        colWidths={colWidths}
        stretchH="all"
        afterRefreshDimensions={calculateColWidths}
        // minSpareRows={0}
        afterChange={handleChanges}
        className='ht-theme-main'
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default PlayLinksInputTable;