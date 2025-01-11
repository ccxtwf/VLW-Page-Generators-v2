import { ForwardedRef, forwardRef, useState, useRef, useEffect } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';
import { sharedContextMenuOptions } from "./shared";
import { CONST_WIKI_DOMAIN } from "../../constants/linkDomains";

const TracklistInputTable = forwardRef(function TracklistInputTable(
  _, 
  ref: ForwardedRef<any>
) {

  // @ts-ignore
  const vlwPageRenderer = (instance, td, row, col, prop, value, cellProperties) => {
    if (!value || value === '') {
      td.innerText = '';
      return td;
    }
    const tryMatch = value?.match(/^(?:\[\[(?!w:c:))(?:([^\|]*)(?:|\|.*))\]\]$/i) || null;
    if (tryMatch !== null) {
      value = value.replace('<', '&lt;').replace('>', '&gt;');
      let slug = encodeURI(tryMatch[1]).replace(/\?/g, '%3F');
      td.innerHTML = `<a href="https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/${slug}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    } else {
      td.innerText = value;
    }
    return td;
  }

  const headerText = ['Disk no', 'Track no', 'Track name/VLW Page Title', 'Feat. Producers', 'Feat. Singers'];
  const columnDefinitions = [
    { type: 'numeric' },
    { type: 'numeric' },
    { 
      type: 'text',
      renderer: vlwPageRenderer
    },
    { type: 'text' },
    { type: 'text' }
  ];

  const handleVlwPageUrlInputEvent = (changes: (any[] | null)[]) => {
    for (let change of changes) {
      // @ts-ignore
      const [rowId, colId, prevValue, newValue] = change || [];      
      if (colId === 2) {
        // Detect if inputted value in track name cell is a URL that links to VLW
        // If so, automatically change the cell value to the page title
        const tryMatch = newValue?.match(/^https?:\/\/vocaloidlyrics\.fandom\.com\/wiki\/([^\?]+)/) || null;
        if (tryMatch !== null) {
          let wikiPageName = tryMatch[1];
          wikiPageName = decodeURI(wikiPageName).replace(/_/g, ' ').replace(/%3F/g, '?');
          // @ts-ignore
          change[3] = `[[${wikiPageName}]]`;
        }
      }
    }
  }

  const [colWidths, setColWidths] = useState<number[]>(
    [90, 90, 500, 160, 160]
  );
  const [showRowHeaders, setShowRowHeaders] = useState<boolean>(true);
  const calculateColWidths = () => {
    const maxWidth = (containerRef.current as HTMLDivElement).clientWidth;
    if (maxWidth < 450) {
      setColWidths([
        40, 40,
        maxWidth - 40*2 - 60*2, 
        60, 60
      ]);
      setShowRowHeaders(false);
      return;
    }
    let calcColWidths = [90, 90, 500, 160, 160];
    const minWidth = calcColWidths.reduce((s, cur) => s + cur, 50);
    if (maxWidth >= minWidth) {
      calcColWidths[2] += (maxWidth - minWidth);
    } else {
      calcColWidths = [
        80, 80,
        maxWidth - 50 - 80 - 80 - 140 - 140,
        140, 140,
      ];
    }
    setShowRowHeaders(true);
    setColWidths(calcColWidths);
  };
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(calculateColWidths, []);

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
        afterRefreshDimensions={calculateColWidths}
        beforeChange={handleVlwPageUrlInputEvent}
        minSpareRows={0}
        className='ht-theme-main'
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default TracklistInputTable;