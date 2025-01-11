import { ForwardedRef, forwardRef, useState, useRef, useEffect } from "react";
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
  if (forProducerPages) {
    headerText.push(...['Media', 'Inactive?']);
    columnDefinitions.push(...[
      { type: 'checkbox', className: 'htCenter htMiddle' },
      { type: 'checkbox', className: 'htCenter htMiddle' }
    ]);
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

  const [colWidths, setColWidths] = useState<number[]>(
    forProducerPages ? [400, 200, 100, 100, 100] : [450, 240, 80]
  );
  const [showRowHeaders, setShowRowHeaders] = useState<boolean>(true);
  const calculateColWidths = () => {
    const maxWidth = (containerRef.current as HTMLDivElement).clientWidth;
    if (maxWidth < 450) {
      setColWidths([
        200, 
        maxWidth - 200 - 50, 
        50
      ]);
      setShowRowHeaders(false);
      return;
    }
    let calcColWidths = [450, 240, 80];
    const minWidth = calcColWidths.reduce((s, cur) => s + cur, 50);
    if (maxWidth >= minWidth) {
      calcColWidths[0] += (maxWidth - minWidth);
    } else {
      calcColWidths = [
        0.6 * (maxWidth - 50 - 60),
        0.4 * (maxWidth - 50 - 60),
        60,
      ];
    }
    setShowRowHeaders(true);
    setColWidths(calcColWidths);
  };
  const calculateColWidthsForProducerPages = () => {
    const maxWidth = (containerRef.current as HTMLDivElement).clientWidth;
    if (maxWidth < 450) {
      setColWidths([
        100, 
        maxWidth - 100 - 40*3, 
        40, 40, 40
      ]);
      setShowRowHeaders(false);
      return;
    }
    let calcColWidths = [400, 200, 100, 100, 100];
    const minWidth = calcColWidths.reduce((s, cur) => s + cur, 50);
    if (maxWidth >= minWidth) {
      calcColWidths[0] += (maxWidth - minWidth);
    } else {
      calcColWidths = [
        0.6 * (maxWidth - 50 - 80 * 3),
        0.4 * (maxWidth - 50 - 80 * 3),
        80,
        80,
        80,
      ];
    }
    setShowRowHeaders(true);
    setColWidths(calcColWidths);
  };
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(
    forProducerPages ? calculateColWidthsForProducerPages : calculateColWidths  
  , [forProducerPages]);

  return (
    <div className="table-container" ref={containerRef}>
      <HotTable
        ref={ref}
        rowHeaders={showRowHeaders}
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
        colWidths={colWidths}
        stretchH="all"
        afterRefreshDimensions={
          forProducerPages ? calculateColWidthsForProducerPages : calculateColWidths
        }
        minSpareRows={0}
        afterChange={handleChanges}
        className='ht-theme-main'
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default ExternalLinksInputTable;