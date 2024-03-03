import { ForwardedRef, forwardRef } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';
import { urlRenderer, sharedContextMenuOptions } from "./shared";
import { CONST_RECOGNIZED_LINKS } from "../../constants/linkDomains";

interface ExternalLinksTableInterface {
  forProducerPages?: boolean
}

const ExternalLinksInputTable = forwardRef(function ExternalLinksInputTable(
  { forProducerPages = false }: ExternalLinksTableInterface, 
  ref: ForwardedRef<any>
) {

  const headerText = ['URL', 'Description', 'Official'];
  const columnDefinitions = [
    { 
      type: 'text', 
      renderer: urlRenderer
    },
    { type: 'text' },
    { type: 'checkbox', className: 'htCenter htMiddle' }
  ];
  let columnWidths = [60, 30, 10];
  if (forProducerPages) {
    headerText.push(...['Media', 'Inactive?']);
    columnDefinitions.push(...[
      { type: 'checkbox', className: 'htCenter htMiddle' },
      { type: 'checkbox', className: 'htCenter htMiddle' }
    ])
    columnWidths = [60, 25, 5, 5, 5];
  }

  const handleChanges = (changes: any[][] | null) => {
    for (let change of (changes || [])) {
      const [rowId, colId, _, newValue] = change;      
      if (colId === 0) {    // changed cell is URL 
        const referUrl = CONST_RECOGNIZED_LINKS.find(({ re }) => {
          return newValue.match(re) !== null;
        });
        if (referUrl !== null) {
          // @ts-ignore
          ref?.current?.hotInstance?.setDataAtCell(rowId, 1, referUrl?.site);   // set description automatically
        }

        // Auto-detect YT URLs
        let detectYTWatchId = /^https?:\/\/youtu\.be\/([^\?]+)/.exec(newValue);
        if (detectYTWatchId === null) detectYTWatchId = /^https?:\/\/www\.youtube\.com\/watch\?v=([^\?&]+)/.exec(newValue);
        if (detectYTWatchId !== null) {
          change[3] = `https://www.youtube.com/watch?v=${detectYTWatchId[1]}`;
        }
      }
    }
  }

  return (
    <div className="table-container">
      <HotTable
        ref={ref}
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
        rowHeights={30}
        colWidths={columnWidths}
        stretchH="all"
        minSpareRows={0}
        afterChange={handleChanges}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default ExternalLinksInputTable;