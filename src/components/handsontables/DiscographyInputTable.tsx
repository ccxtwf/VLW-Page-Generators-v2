import { ForwardedRef, forwardRef, useState, useRef, useEffect } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';
import { sharedContextMenuOptions } from "./shared";

import { CONST_WIKI_DOMAIN } from "../../constants/linkDomains";

interface DiscographyTableInterface {
  forAlbums?: boolean
}

const DiscographyInputTable = forwardRef(function DiscographyInputTable(
  { forAlbums = false }: DiscographyTableInterface, 
  ref: ForwardedRef<any>
) {

  // @ts-ignore
  const vlwPageRenderer = (instance, td, row, col, prop, value, cellProperties) => {
    if (!value || value === '') {
      td.innerText = '';
      return td;
    } else {
      value = value.replace('<', '&lt;').replace('>', '&gt;');
      let slug = encodeURI(value).replace(/\?/g, '%3F');
      td.innerHTML = `<a href="https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/${slug}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    }
    return td;
  }

  const headerText = [
    forAlbums ? 'Album pages' : 'Song pages', 
    `${forAlbums ? 'AWT' : 'PWT'} Parameters`
  ];
  const columnDefinitions = [
    { 
      type: 'text', 
      renderer: vlwPageRenderer
    },
    { type: 'text' }
  ];

  const handleVlwPageUrlInputEvent = (changes: (any[] | null)[]) => {
    for (let change of changes) {
      // @ts-ignore
      const [rowId, colId, prevValue, newValue] = change || [];      
      if (colId === 0) {
        // Detect if inputted value in page name cell is a URL that links to VLW
        // If so, automatically change the cell value to the page title
        const tryMatch = newValue?.match(/^https?:\/\/vocaloidlyrics\.fandom\.com\/wiki\/([^\?]+)/) || null;
        if (tryMatch !== null) {
          let wikiPageName = tryMatch[1];
          wikiPageName = decodeURI(wikiPageName).replace(/_/g, ' ').replace(/%3F/g, '?');
          // @ts-ignore
          change[3] = wikiPageName;
        }
      }
    }
  }

  const [colWidths, setColWidths] = useState<number[]>([600, 200]);
  const calculateColWidths = () => {
    const maxWidth = (containerRef.current as HTMLDivElement).clientWidth;
    let calcColWidths =[600, 200];
    const minWidth = calcColWidths.reduce((s, cur) => s + cur, 50);
    if (maxWidth >= minWidth) {
      calcColWidths[0] += (maxWidth - minWidth);
    } else {
      calcColWidths = [
        0.75 * (maxWidth - 50),
        0.25 * (maxWidth - 50),
      ];
    }
    setColWidths(calcColWidths);
  };
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(calculateColWidths, []);

  return (
    <div className="table-container" ref={containerRef}>
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
        colWidths={colWidths}
        stretchH="all"
        afterRefreshDimensions={calculateColWidths}
        minSpareRows={0}
        beforeChange={handleVlwPageUrlInputEvent}
        className='ht-theme-main'
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default DiscographyInputTable;