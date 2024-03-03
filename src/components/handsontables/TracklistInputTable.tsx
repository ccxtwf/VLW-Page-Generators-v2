import { ForwardedRef, forwardRef } from "react";
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
  let columnWidths = [5, 5, 50, 20, 20];

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
        beforeChange={handleVlwPageUrlInputEvent}
        stretchH="all"
        minSpareRows={0}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default TracklistInputTable;