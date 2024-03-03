import { ForwardedRef, forwardRef } from "react";
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
    'Additional template parameters'
  ];
  const columnDefinitions = [
    { 
      type: 'text', 
      renderer: vlwPageRenderer
    },
    { type: 'text' }
  ];
  let columnWidths = [60, 40];

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
        beforeChange={handleVlwPageUrlInputEvent}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default DiscographyInputTable;