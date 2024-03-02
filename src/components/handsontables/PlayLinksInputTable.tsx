import { ForwardedRef, forwardRef } from "react";
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

  return (
    <div className="table-container">
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
        imeFastEdit={true}
        selectionMode="multiple"
        rowHeights={30}
        colWidths={[20, 35, 10, 10, 10, 15]}
        stretchH="all"
        // minSpareRows={0}
        afterChange={handleChanges}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default PlayLinksInputTable;