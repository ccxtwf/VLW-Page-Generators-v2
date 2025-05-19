import { ForwardedRef, forwardRef, useMemo, useState, useEffect } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';

interface LyricsInputTableInterface {
  headersText: string[]
  hideColumns: number[]
  allowColumnAdditionRemoval?: boolean
  mode?: 'dark' | 'light'
}

const rxMatchBolded = /^\s*('{3})(.*)\1\s*$/;
const rxMatchItalicised = /^\s*('{2})((?<=\1)(?:(?!')|'{3}(?!')).*(?:(?<!')|(?<!')'{3})(?=\1))\1\s*$/;

// @ts-ignore
const lyricRenderer = (instance, td, row, col, prop, value, cellProperties) => {
  if (value === null) {
    td.innerHTML = '';
    return td;
  }
  const colour = instance.getDataAtCell(row, 0) || '';
  value = value.replace(/^[^\|\{\}\n]*?\|/, '');
  value = value.replace(/<br\s*\/?\s*>/, '\n');
  value = value.replace(/<ref\s*[^>]*\/>/gi, '<i class="asterisk tiny icon"></i>');
  value = value.replace(/<ref\s*[^>]*>(.*)<\/ref>/gsi, '<i class="asterisk tiny icon"></i>');
  value = value.replace(/'{3}(.*?)'{3}/g, '<b>$1</b>');
  value = value.replace(/'{2}(.*?)'{2}/g, '<i>$1</i>');
  if (colour !== '') value = `<span style="color:${colour};">${value}</span>`;
  value = value
    .replace(/<(?!\/?(?:b|i|u|span|div|s|small|sub|sup|strong|em|mark)\b)/g, '&lt;')
    .replace(/(?<!(?:b|i|u|span|div|s|small|sub|sup|strong|em|mark)\b[^<]*)>/g, '&gt;');
  td.innerHTML = value;
  return td;
}

const LyricsInputTable = forwardRef(function LyricsInputTable(
  { headersText, hideColumns, allowColumnAdditionRemoval = true, mode = 'light' }: LyricsInputTableInterface, 
  ref: ForwardedRef<any>
) {

  const [hiddenColumnsInternalState, setHiddenColumnsInternalState] = useState<number[]>([...hideColumns]);

  useEffect(() => {
    setHiddenColumnsInternalState([...hideColumns]);
  }, [hideColumns]);

  const hiddenColumnsHotTableDefinition: { columns: number[], indicators: boolean } = useMemo(() => {
    return { columns: hiddenColumnsInternalState, indicators: false };
  }, [hiddenColumnsInternalState]);

  const columnDefinitions = useMemo(() => [
    { type: 'text' },
    { type: 'text', renderer: lyricRenderer },
    { type: 'text', renderer: lyricRenderer },
    { type: 'text', renderer: lyricRenderer },
    { type: 'text', renderer: lyricRenderer },
    { type: 'text', renderer: lyricRenderer },
  ], []);

  const getSelectedRowData = useMemo(() => {
    //@ts-ignore
    return (instance) => {
      //@ts-ignore
      const { from: { row: fromRow = null } = {}, to: { row: toRow = null } = {} } = (instance.getSelectedRange() || [{}])[0];
      if (fromRow === null || toRow === null) return [];
      const selectedRows = [];
      for (let i = fromRow; i <= toRow; i++) {
        //@ts-ignore
        selectedRows.push(instance.getDataAtRow(i));
      }
      return selectedRows;
    }
  }, []);

  const contextMenuOptions = useMemo(() => {
    const contextMenu = {
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
                    6 - hiddenColumnsInternalState.length, 
                    Math.max(...pasted.map(line => line.length))
                  );
                  for (let i = 0; i < numOverlappedExistingRows; i++) {
                    let z = 0;
                    for (let j = 0; j < numOverlappedExistingColumns; j++) {
                      while (hiddenColumnsInternalState.includes((fromCol+z))) z++;
                      changes.push([fromRow+i, fromCol+z++, pasted[i][j] || '']);
                    }
                  }
                  for (let i = 0; i < numOverflowedRows; i++) {
                    let z = 0;                  
                    for (let j = 0; j < numOverlappedExistingColumns; j++) {
                      while (hiddenColumnsInternalState.includes((fromCol+z))) z++;
                      changes.push([numExistingRows+i, fromCol+z++, pasted[numOverlappedExistingRows+i][j] || '']);
                    }
                  }
                } else {
                  // Starting cell is a multi-cell range
                  // In this case, limit the paste range to the columns within fromCol & toCol, 
                  // and to rows below (equal to or more than) fromRow
                  for (let i = 0; i < numOverlappedExistingRows; i++) {
                    let z = 0;
                    for (let j = fromCol; j <= toCol; j++) {
                      while (hiddenColumnsInternalState.includes((fromCol+z))) z++;
                      changes.push([fromRow+i, fromCol+z++, pasted[i][j-fromCol] || '']);
                    }
                  }
                  for (let i = 0; i < numOverflowedRows; i++) {
                    let z = 0;
                    for (let j = fromCol; j <= toCol; j++) {
                      while (hiddenColumnsInternalState.includes((fromCol+z))) z++;
                      changes.push([numExistingRows+i, fromCol+z++, pasted[numOverlappedExistingRows+i][j-fromCol] || '']);
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
        bold: {
          name: () => ('Bold row'),
          hidden() {
            const selectedRows = getSelectedRowData(this);
            return selectedRows.some((lyrics) => {
              // Check if there are cells in the lyrics row that have been bolded 
              let res = false;
              for (let i = 1; i < lyrics.length; i++) {
                if (hiddenColumnsInternalState.includes(i)) continue;
                if ((lyrics[i] || '').trim() !== '' && lyrics[i].match(rxMatchBolded) !== null) {
                  res = true;
                  break;
                }
              }
              return res;
            });
          },
          //@ts-ignore
          callback(key, selection, clickEvent) {
            const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
            if (fromRow === null || toRow === null) return;
            //@ts-ignore
            const data = this.getData();
            for (let i = fromRow; i <= toRow; i++) {
              for (let j = 1; i < data[i].length; j++) {
                if (hiddenColumnsInternalState.includes(i)) continue;
                data[i][j] = `'''${(data[i][j] || '').trim()}'''`;
              }
            }
            //@ts-ignore
            this.loadData(data);
          }
        },
        italic: {
          name: () => ('Italicize row'),
          hidden() {
            const selectedRows = getSelectedRowData(this);
            return selectedRows.some((lyrics) => {
              // Check if there are cells in the lyrics row that have been italicized 
              let res = false;
              for (let i = 1; i < lyrics.length; i++) {
                if (hiddenColumnsInternalState.includes(i)) continue;
                if ((lyrics[i] || '').trim() !== '' && lyrics[i].match(rxMatchItalicised) !== null) {
                  res = true;
                  break;
                }
              }
              return res;
            });
          },
          //@ts-ignore
          callback(key, selection, clickEvent) {
            const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
            if (fromRow === null || toRow === null) return;
            //@ts-ignore
            const data = this.getData();
            for (let i = fromRow; i <= toRow; i++) {
              for (let j = 1; i < data[i].length; j++) {
                if (hiddenColumnsInternalState.includes(i)) continue;
                data[i][j] = `''${(data[i][j] || '').trim()}''`;
              }
            }
            //@ts-ignore
            this.loadData(data);
          }
        },
        unbold: {
          name: () => ('Unbold row'),
          hidden() {
            const selectedRows = getSelectedRowData(this);
            return !selectedRows.some((lyrics) => {
              // Check if there are cells in the lyrics row that have been bolded 
              let res = false;
              for (let i = 1; i < lyrics.length; i++) {
                if (hiddenColumnsInternalState.includes(i)) continue;
                if ((lyrics[i] || '').trim() !== '' && lyrics[i].match(rxMatchBolded) !== null) {
                  res = true;
                  break;
                }
              }
              return res;
            });
          },
          //@ts-ignore
          callback(key, selection, clickEvent) {
            const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
            if (fromRow === null || toRow === null) return;
            //@ts-ignore
            const data = this.getData();
            for (let i = fromRow; i <= toRow; i++) {
              for (let j = 1; i < data[i].length; j++) {
                if (hiddenColumnsInternalState.includes(i)) continue;
                data[i][j] = (data[i][j] || '').replace(rxMatchBolded, '$2');
              }
            }
            //@ts-ignore
            this.loadData(data);
          }
        },
        unitalic: {
          name: () => ('Unitalicize row'),
          hidden() {
            const selectedRows = getSelectedRowData(this);
            return selectedRows.some((lyrics) => {
              // Check if there are cells in the lyrics row that have been italicized 
              let res = false;
              for (let i = 1; i < lyrics.length; i++) {
                if (hiddenColumnsInternalState.includes(i)) continue;
                if ((lyrics[i] || '').trim() !== '' && lyrics[i].match(rxMatchItalicised) !== null) {
                  res = true;
                  break;
                }
              }
              return res;
            });
          },
          //@ts-ignore
          callback(key, selection, clickEvent) {
            const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
            if (fromRow === null || toRow === null) return;
            //@ts-ignore
            const data = this.getData();
            for (let i = fromRow; i <= toRow; i++) {
              for (let j = 1; i < data[i].length; j++) {
                if (hiddenColumnsInternalState.includes(i)) continue;
                data[i][j] = (data[i][j] || '').replace(rxMatchItalicised, '$2');
              }
            }
            //@ts-ignore
            this.loadData(data);
          }
        },
        sp3: '---------',
        row_above: { disabled: false }, 
        row_below: { disabled: false }, 
        remove_row: { disabled: false },
        clear_column: { disabled: false },
      }
    };
    if (allowColumnAdditionRemoval) {
      //@ts-ignore
      contextMenu.items['sp4'] = '---------';
      //@ts-ignore
      contextMenu.items['col_right'] = { 
        name: () => 'Add new column at last position',
        disabled() {
          return hiddenColumnsInternalState.length === 0;
        },
        callback() {
          let minHidden = Math.min(...hiddenColumnsInternalState);
          setHiddenColumnsInternalState([...hiddenColumnsInternalState.filter(el => el !== minHidden)]);
        }
      };
      //@ts-ignore
      contextMenu.items['remove_col'] = { 
          name: () => 'Remove last column',
          disabled: function () {
            let minHidden = Math.min(...hiddenColumnsInternalState);
            return minHidden === 2;
          },
          callback: function () {
            let hideColumnAtIndex;
            if (hiddenColumnsInternalState.length === 0) {
              hideColumnAtIndex = 5;
            } else {
              hideColumnAtIndex = Math.min(...hiddenColumnsInternalState) - 1;
            }
            setHiddenColumnsInternalState([hideColumnAtIndex, ...hiddenColumnsInternalState]);
            //@ts-ignore
            const data = this.getData();
            for (let i = 0; i < data.length; i++) {
              data[i][hideColumnAtIndex] = '';
            }
            //@ts-ignore
            this.loadData(data);
          }
        };
    }
    return contextMenu;
  }, [hiddenColumnsInternalState]);

  return (
    <div className="table-container">
      <HotTable
        ref={ref}
        rowHeaders={true}
        colHeaders={headersText}
        width="100%"
        contextMenu={contextMenuOptions}
        hiddenColumns={hiddenColumnsHotTableDefinition}
        columns={columnDefinitions}
        autoWrapRow={true}
        autoWrapCol={true}
        selectionMode="multiple"
        manualColumnResize={true}
        // imeFastEdit={true}
        colWidths={[20]}
        stretchH="all"
        minSpareRows={0}
        className={`lyrics-table ${mode}-mode`}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default LyricsInputTable;