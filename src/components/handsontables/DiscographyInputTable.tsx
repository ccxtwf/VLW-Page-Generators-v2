import { ForwardedRef, forwardRef, useMemo } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';
import { sharedContextMenuOptions } from "./shared";

interface DiscographyTableInterface {
  forAlbums?: boolean
}

const DiscographyInputTable = forwardRef(function DiscographyInputTable(
  { forAlbums = false }: DiscographyTableInterface, 
  ref: ForwardedRef<any>
) {

  // @ts-ignore
  const vlwPageRenderer = useMemo(() => (instance, td, row, col, prop, value, cellProperties) => {
    if (!value || value === '') {
      td.innerText = '';
      return td;
    } else {
      value = value.replace('<', '&lt;').replace('>', '&gt;');
      let slug = encodeURI(value).replace(/\?/g, '%3F');
      td.innerHTML = `<a href="${import.meta.env.VITE_VLW_WIKI_DOMAIN}${import.meta.env.VITE_WIKI_ENTRYPOINT}/${slug}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    }
    return td;
  }, []);

  const { headerText, columnDefinitions, columnWidths } = useMemo(() => {
    let headerText = null;
    let columnDefinitions = null;
    let columnWidths = null;
    if (forAlbums) {
      headerText = [
        'Album pages', 
        'Additional template parameters',
        'Is Compilation?'
      ];
      columnDefinitions = [
        { 
          type: 'text', 
          renderer: vlwPageRenderer
        },
        { type: 'text' },
        { type: 'checkbox', className: 'htCenter htMiddle' },
      ];
      columnWidths = [60, 25, 15];
    } else {
      headerText = [
        'Song pages', 
        'Additional template parameters'
      ];
      columnDefinitions = [
        { 
          type: 'text', 
          renderer: vlwPageRenderer
        },
        { type: 'text' }
      ];
      columnWidths = [60, 40];
    }
    return { headerText, columnDefinitions, columnWidths };
  }, []);

  const handleVlwPageUrlInputEvent = useMemo(() => (changes: (any[] | null)[]) => {
    for (let change of changes) {
      // @ts-ignore
      let [rowId, colId, prevValue, newValue] = change || [];
      newValue = `${newValue || ''}`;
      if (colId === 0) {
        // Detect if inputted value in page name cell is a URL that links to VLW
        // If so, automatically change the cell value to the page title
        const ownWikiUrlHead = `${import.meta.env.VITE_VLW_WIKI_DOMAIN}${import.meta.env.VITE_WIKI_ENTRYPOINT}/`;
        if ((newValue as string).startsWith(ownWikiUrlHead)) {
          let wikiPageName = (newValue as string).replace(ownWikiUrlHead, '');
          wikiPageName = decodeURI(wikiPageName).replace(/_/g, ' ').replace(/%3F/g, '?');
          // @ts-ignore
          change[3] = wikiPageName;
        }
      }
    }
  }, []);

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