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
const rxMatchBoldedCss = /font-weight\s*:\s*bold\b\s*;*/;
const rxMatchItalicised = /^\s*('{2})((?<=\1)(?:(?!')|'{3}(?!')).*(?:(?<!')|(?<!')'{3})(?=\1))\1\s*$/;
const rxMatchItalicisedCss = /font-style\s*:\s*italic\b\s*;*/;

// @ts-ignore
const styleRenderer = (instance, td, row, col, prop, value, cellProperties) => {
  td.innerHTML = '';
  if (value === null) { return td; }
  const kvPairs = (value as string).matchAll(/([a-zA-Z\-0-9]+)\s*:\s*([^;]*)/g);
  const arr = [];
  for (const [_, k, v] of kvPairs) {
    arr.push( `<span style="${k}:${v};">${v}</span>` );
  }
  td.innerHTML = arr.join('; ');
  return td;
}

// @ts-ignore
const lyricRenderer = (instance, td, row, col, prop, value, cellProperties) => {
  if (value === null) {
    td.innerHTML = '';
    return td;
  }
  const customStyle = instance.getDataAtCell(row, 0) || '';
  value = value.replace(/^[^\|\{\}\n]*?\|/, '');
  value = value.replace(/<br\s*\/?\s*>/, '\n');
  value = value.replace(/<ref\s*[^>]*\/>/gi, '<i class="asterisk tiny icon"></i>');
  value = value.replace(/<ref\s*[^>]*>(.*)<\/ref>/gsi, '<i class="asterisk tiny icon"></i>');
  value = value.replace(/'{3}(.*?)'{3}/g, '<b>$1</b>');
  value = value.replace(/'{2}(.*?)'{2}/g, '<i>$1</i>');
  value = value.replace(/\{\{(?:[Tt]emplate|)[Rr]uby\|([^\|]*)\|([^\}]*)\}\}/g, '<ruby>$1 <rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
  if (customStyle !== '') value = `<span style="${customStyle}">${value}</span>`;
  value = value
    .replace(/<(?!\/?(?:b|i|u|span|div|s|small|sub|sup|strong|em|mark|ruby|rp|rt)\b)/g, '&lt;')
    .replace(/(?<!(?:b|i|u|span|div|s|small|sub|sup|strong|em|mark|ruby|rp|rt)\b[^<]*)>/g, '&gt;');
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
    { type: 'text', renderer: styleRenderer },
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
    const _cbHottableOnPaste = (_: any, selection: any, __: any) => {
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
              import.meta.env.VITE_LYRICS_TABLE_MAX_COLUMNS+1 - hiddenColumnsInternalState.length, 
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
    };
    const _cbHottableCheckForStyleInSelection = (rowInlineCss: RegExp, cellWikitextMarkup: RegExp, modeRemoveStyle: boolean) => {
      return function() {
        //@ts-ignore
        const selectedRows = getSelectedRowData(this);
        let res;
        if (modeRemoveStyle) {
          res = selectedRows.some(function (row) {
            if ((row[0] || '').match(rowInlineCss) !== null) return true; 
            for (let i = 1; i < row.length; i++) {
              if (hiddenColumnsInternalState.includes(i)) continue;
              if ((row[i] || '').trim() !== '' && row[i].match(cellWikitextMarkup) !== null) {
                return true;
              } 
            }
            return false;
          });
        } else {
          res = selectedRows.every(function (row) {
            if ((row[0] || '').match(rowInlineCss) !== null) return false; 
            for (let i = 1; i < row.length; i++) {
              if (hiddenColumnsInternalState.includes(i)) continue;
              if ((row[i] || '').trim() !== '' && row[i].match(cellWikitextMarkup) !== null) {
                return false;
              } 
            }
            return true;
          });
        }
        return !res;
      }
    }
    const _cbHottableAddStyle = (customStyle: string) => {
      //@ts-ignore
      return function (_: any, selection: any, __: any) {
        const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
        if (fromRow === null || toRow === null) return;
        //@ts-ignore
        const data = this.getData();
        for (let i = fromRow; i <= toRow; i++) {
          if ((data[i][1] || '').trim() === '') continue;
          if (!data[i][0]) data[i][0] = '';
          data[i][0] += customStyle;
        }
        //@ts-ignore
        this.loadData(data);
      }
    }
    const _cbHottableRemoveStyle = (rowInlineCss: RegExp, cellWikitextMarkup: RegExp) => {
      return function (_: any, selection: any, __: any) {
        const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
        if (fromRow === null || toRow === null) return;
        //@ts-ignore
        const data = this.getData();
        for (let i = fromRow; i <= toRow; i++) {
          data[i][0] = (data[i][0] || '').replace(rowInlineCss, "");
          for (let j = 1; j < data[i].length; j++) {
            data[i][j] = (data[i][j] || '').replace(cellWikitextMarkup, '$2');
          }
        }
        //@ts-ignore
        this.loadData(data);
      }
    }
    const contextMenu = {
      items: {
        copy: { disabled: false },
        cut: { disabled: false },
        paste: {
          name: 'Paste',
          callback: _cbHottableOnPaste,
        },
        sp1: '---------',
        undo: { disabled: false },
        redo: { disabled: false },
        sp2: '---------',
        bold: {
          name: () => ('Bold row'),
          hidden: _cbHottableCheckForStyleInSelection(rxMatchBoldedCss, rxMatchBolded, false),
          callback: _cbHottableAddStyle('font-weight: bold'),
        },
        italic: {
          name: () => ('Italicize row'),
          hidden: _cbHottableCheckForStyleInSelection(rxMatchItalicisedCss, rxMatchItalicised, false),
          callback: _cbHottableAddStyle('font-style: italic'),
        },
        unbold: {
          name: () => ('Unbold row'),
          hidden: _cbHottableCheckForStyleInSelection(rxMatchBoldedCss, rxMatchBolded, true),
          callback: _cbHottableRemoveStyle(rxMatchBoldedCss, rxMatchBolded),
        },
        unitalic: {
          name: () => ('Unitalicize row'),
          hidden: _cbHottableCheckForStyleInSelection(rxMatchItalicisedCss, rxMatchItalicised, true),
          callback: _cbHottableRemoveStyle(rxMatchItalicisedCss, rxMatchItalicised),
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
      contextMenu.items['col_left'] = {
        disabled() {
          const { from: { col: fromCol = null } = {} } = (this.getSelectedRange() || [{}])[0];
          if (fromCol === null) { return true; }
          return fromCol === 0;
        },
        callback() {
          const { from: { col: fromCol = null } = {} } = (this.getSelectedRange() || [{}])[0];
          if (fromCol === null) { return; }
          const data = this.getData().map((rw: (string | undefined | null)[]) => {
            return [...rw.slice(0, fromCol), '', ...rw.slice(fromCol, -1)];
          });
          this.loadData(data);
          let minHidden = Math.min(...hiddenColumnsInternalState);
          setHiddenColumnsInternalState([...hiddenColumnsInternalState.filter(el => el !== minHidden)]);
        }
      };
      //@ts-ignore
      contextMenu.items['col_right'] = {
        disabled() {
          return hiddenColumnsInternalState.length === 0;
        },
        callback() {
          const { from: { col: fromCol = null } = {} } = (this.getSelectedRange() || [{}])[0];
          if (fromCol === null) { return; }
          const data = this.getData().map((rw: (string | undefined | null)[]) => {
            return [...rw.slice(0, fromCol+1), '', ...rw.slice(fromCol+1, -1)];
          });
          this.loadData(data);
          let minHidden = Math.min(...hiddenColumnsInternalState);
          setHiddenColumnsInternalState([...hiddenColumnsInternalState.filter(el => el !== minHidden)]);
        }
      };
      //@ts-ignore
      contextMenu.items['remove_col'] = {
        disabled: function () {
          const { from: { col: fromCol = null } = {} } = (this.getSelectedRange() || [{}])[0];
          if (fromCol === 0) return true;
          let minHidden = Math.min(...hiddenColumnsInternalState);
          return minHidden === 2;
        },
        callback: function () {
          const { from: { col: fromCol = null } = {} } = (this.getSelectedRange() || [{}])[0];
          if (fromCol === null) { return; }
          let hideColumnAtIndex;
          if (hiddenColumnsInternalState.length === 0) {
            hideColumnAtIndex = +import.meta.env.VITE_LYRICS_TABLE_MAX_COLUMNS;
          } else {
            hideColumnAtIndex = Math.min(...hiddenColumnsInternalState) - 1;
          }
          setHiddenColumnsInternalState([hideColumnAtIndex, ...hiddenColumnsInternalState]);
          const data = this.getData().map((rw: (string | undefined | null)[]) => {
            return [...rw.slice(0, fromCol), ...rw.slice(fromCol+1), ''];
          });
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