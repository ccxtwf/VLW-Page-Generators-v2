import { ForwardedRef, forwardRef, useMemo } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';

const TracklistInputTable = forwardRef(function TracklistInputTable(
  _, 
  ref: ForwardedRef<any>
) {

  // @ts-ignore
  const vlwPageRenderer = useMemo(() => (instance, td, row, col, prop, value, cellProperties) => {
    if (!value || value === '') {
      td.innerText = '';
      return td;
    }
    const tryMatch = value?.match(/^(?:\[\[(?!fandom:|wikia:|mh:|m:|meta:|metawiki:|commons:|w:))(?:([^\|]*)(?:|\|.*))\]\]$/i) || null;
    if (tryMatch !== null) {
      value = value.replace('<', '&lt;').replace('>', '&gt;');
      let slug = encodeURI(tryMatch[1]).replace(/\?/g, '%3F');
      td.innerHTML = `<a href="${import.meta.env.VITE_VLW_WIKI_DOMAIN}${import.meta.env.VITE_WIKI_ENTRYPOINT}/${slug}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    } else {
      td.innerText = value;
    }
    return td;
  }, []);

  const { headerText, columnDefinitions, columnWidths } = useMemo(() => {
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
    return { headerText, columnDefinitions, columnWidths };
  }, []);

  const rxListSeparator = useMemo(() => (
    /(,\s*(?!and\b)|,?\s+and\s+|\s+&\s+)/
  ), []);

  const contextMenuOptions = useMemo(() => ({
    items: {
      copy: { disabled: false },
      cut: { disabled: false },
      paste: {
        name: 'Paste',
        //@ts-ignore
        callback(key, selection, clickEvent) {
          let { 
            start: { row: fromRow = null, col: fromCol = null } = {}, 
            end: { row: toRow = null, col: toCol = null } = {} 
          } = (selection || [{}])[0];
          if (fromRow === null || fromCol === null || toRow === null || toCol === null) return;
          if (fromRow > toRow) [fromRow, toRow] = [toRow, fromRow];
          if (fromCol > toCol) [fromCol, toCol] = [toCol, fromCol];
          navigator.clipboard.readText()
            .then((str) => {
              const pasted = str.split(/\n/).map((line) => line.split(/\t/));

              //@ts-ignore
              // let data = this.getData();
              let numExistingRows = this.getData().length;
              let numOverlappedExistingRows = Math.min(
                numExistingRows - fromRow,
                pasted.length
              );
              let numOverflowedRows = pasted.length - numOverlappedExistingRows;
              const changes: (number | string)[][] = [];

              if (fromRow === toRow && fromCol === toCol) {
                // Starting cell is a single cell
                // In this case, limit the paste range to rows after fromRow and columns after fromCol
                let numOverlappedExistingColumns = Math.min(
                  5, Math.max(...pasted.map(line => line.length))
                );
                for (let i = 0; i < numOverlappedExistingRows; i++) {
                  for (let j = 0; j < numOverlappedExistingColumns; j++) {
                    changes.push([fromRow+i, fromCol+j, pasted[i][j] || '']);
                  }
                }
                for (let i = 0; i < numOverflowedRows; i++) {
                  for (let j = 0; j < numOverlappedExistingColumns; j++) {
                    changes.push([numExistingRows+i, fromCol+j, pasted[numOverlappedExistingRows+i][j] || '']);
                  }
                }
              } else {
                // Starting cell is a multi-cell range
                // In this case, limit the paste range to the columns within fromCol & toCol, 
                // and to rows below (equal to or more than) fromRow
                for (let i = 0; i < numOverlappedExistingRows; i++) {
                  for (let j = fromCol; j <= toCol; j++) {
                    changes.push([fromRow+i, fromCol+j, pasted[i][j-fromCol] || '']);
                  }
                }
                for (let i = 0; i < numOverflowedRows; i++) {
                  for (let j = fromCol; j <= toCol; j++) {
                    changes.push([numExistingRows+i, fromCol+j, pasted[numOverlappedExistingRows+i][j-fromCol] || '']);
                  }
                }
              }

              //@ts-ignore
              this.setDataAtCell(changes);
            })
            .catch(() => {
              window.alert("Unable to paste! Please use keyboard command (Ctrl/Cmd + V)!");
            })
        }
      },
      sp1: '---------',
      undo: { disabled: false },
      redo: { disabled: false },
      sp2: '---------',
      producerMarkup: {
        name: () => 'Add producer markup',
        hidden() {
          const { 
            from: { col: fromCol = null } = {}, 
            to: { col: toCol = null } = {} 
          //@ts-ignore
          } = (this.getSelectedRange() || [{}])[0];
          if (fromCol !== 3 || toCol !== 3) return true;
          return false;
        },
        //@ts-ignore
        callback(key, selection, clickEvent) {
          const { 
            start: { row: fromRow = null, col: fromCol = null } = {}, 
            end: { row: toRow = null, col: toCol = null } = {} 
          } = (selection || [{}])[0];
          if (fromRow === null || toRow === null) return;
          if (fromCol !== 3 || toCol !== 3) return;
          //@ts-ignore
          const data = this.getData();
          for (let i = fromRow; i <= toRow; i++) {
            const row = data[i];
            let producer = (row[3] || '').trim();
            let producerSplit = producer.split(rxListSeparator);
            console.log(producerSplit);
            producer = '';
            for (let substring of producerSplit) {
              if (!substring.match(rxListSeparator) && substring !== '') substring = `[[${substring}]]`;
              producer += substring;
            }
            row[3] = producer;
          }
          //@ts-ignore
          this.loadData(data);
        },
      },
      singerMarkup: {
        name: () => 'Add singer markup',
        hidden() {
          const { 
            from: { col: fromCol = null } = {}, 
            to: { col: toCol = null } = {} 
          //@ts-ignore
          } = (this.getSelectedRange() || [{}])[0];
          if (fromCol !== 4 || toCol !== 4) return true;
          return false;
        },
        //@ts-ignore
        callback(key, selection, clickEvent) {
          const { 
            start: { row: fromRow = null, col: fromCol = null } = {}, 
            end: { row: toRow = null, col: toCol = null } = {} 
          } = (selection || [{}])[0];
          if (fromRow === null || toRow === null) return;
          if (fromCol !== 4 || toCol !== 4) return;
          //@ts-ignore
          const data = this.getData();
          for (let i = fromRow; i <= toRow; i++) {
            const row = data[i];
            let singer = (row[4] || '').trim();
            let singerSplit = singer.split(rxListSeparator);
            singer = '';
            for (let substring of singerSplit) {
              if (!substring.match(rxListSeparator) && substring !== '') substring = `[[${substring}]]`;
              singer += substring;
            }
            row[4] = singer;
          }
          //@ts-ignore
          this.loadData(data);
        },
      },
      sp3: '---------',
      row_above: { disabled: false }, 
      row_below: { disabled: false }, 
      remove_row: { disabled: false },
      clear_column: { disabled: false }
    }
  }), []);

  const handleVlwPageUrlInputEvent = useMemo(() => (changes: (any[] | null)[]) => {
    for (let change of changes) {
      // @ts-ignore
      let [rowId, colId, prevValue, newValue] = change || [];
      newValue = `${newValue || ''}`;  
      if (colId === 2) {
        // Detect if inputted value in track name cell is a URL that links to VLW
        // If so, automatically change the cell value to the page title
        const ownWikiUrlHead = `${import.meta.env.VITE_VLW_WIKI_DOMAIN}${import.meta.env.VITE_WIKI_ENTRYPOINT}/`;
        if ((newValue as string).startsWith(ownWikiUrlHead)) {
          let wikiPageName = (newValue as string).replace(ownWikiUrlHead, '');
          wikiPageName = decodeURI(wikiPageName).replace(/_/g, ' ').replace(/%3F/g, '?');
          // @ts-ignore
          change[3] = `[[${wikiPageName}]]`;
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
        contextMenu={contextMenuOptions}
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