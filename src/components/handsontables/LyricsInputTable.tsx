import { ForwardedRef, forwardRef, useMemo } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';
// import { sharedContextMenuOptions } from "./shared";

interface LyricsInputTableInterface {
  headersText: string[]
  needsRomanization: boolean
  needsEnglishTranslation: boolean
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
  value = value.replace(/<ref\s*[^>]*\/>/gi, '<i class="asterisk tiny icon"></i>');
  value = value.replace(/<ref\s*[^>]*>(.*)<\/ref>/gi, '<i class="asterisk tiny icon"></i>');
  value = value.replace(/'{3}(.*?)'{3}/g, '<b>$1</b>');
  value = value.replace(/'{2}(.*?)'{2}/g, '<i>$1</i>');
  if (colour !== '') value = `<span style="color:${colour};">${value}</span>`;
  value = value
    .replace(/<(?!\/?(?:b|i|u|span|div|s|sub|sup|strong|em|mark)\b)/g, '&lt;')
    .replace(/(?<!(?:b|i|u|span|div|s|sub|sup|strong|em|mark)\b[^<]*)>/g, '&gt;');
  td.innerHTML = value;
  return td;
}

const LyricsInputTable = forwardRef(function LyricsInputTable(
  { headersText, needsRomanization, needsEnglishTranslation, mode = 'light' }: LyricsInputTableInterface, 
  ref: ForwardedRef<any>
) {

  const hiddenColumns: { columns: number[], indicators: boolean } = { columns: [], indicators: false };
  if (!needsRomanization) hiddenColumns.columns.push(2);
  if (!needsEnglishTranslation) hiddenColumns.columns.push(3);

  const columnDefinitions = [
    { type: 'text' },
    { type: 'text', renderer: lyricRenderer },
    { type: 'text', renderer: lyricRenderer },
    { type: 'text', renderer: lyricRenderer },
  ];

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

  const contextMenuOptions = useMemo(() => ({
    items: {
      copy: { disabled: false },
      cut: { disabled: false },
      sp1: '---------',
      undo: { disabled: false },
      redo: { disabled: false },
      sp2: '---------',
      bold: {
        name: () => ('Bold row'),
        hidden() {
          const selectedRows = getSelectedRowData(this);
          const isNotBolded = selectedRows.every(([_, orig, rom, eng]) => {
            return (
              ((orig || '').trim() === '' || orig.match(rxMatchBolded) === null) &&
              (!needsRomanization || (rom || '').trim() === '' || rom.match(rxMatchBolded) === null) &&
              (!needsEnglishTranslation || (eng || '').trim() === '' || eng.match(rxMatchBolded) === null)
            )
          });
          return !isNotBolded;
        },
        //@ts-ignore
        callback(key, selection, clickEvent) {
          const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
          if (fromRow === null || toRow === null) return;
          //@ts-ignore
          const data = this.getData();
          for (let i = fromRow; i <= toRow; i++) {
            const row = data[i];
            let orig = (row[1] || '').trim();
            row[1] = `'''${orig}'''`;
            let rom = (row[2] || '').trim();
            if (needsRomanization && rom !== '') row[2] = `'''${rom}'''`;
            let eng = (row[3] || '').trim();
            if (needsEnglishTranslation && eng !== '') row[3] = `'''${eng}'''`;
          }
          //@ts-ignore
          this.loadData(data);
        }
      },
      italic: {
        name: () => ('Italicize row'),
        hidden() {
          const selectedRows = getSelectedRowData(this);
          const isNotItalicized = selectedRows.every(([_, orig, rom, eng]) => {
            return (
              ((orig || '').trim() === '' || orig.match(rxMatchItalicised) === null) &&
              (!needsRomanization || (rom || '').trim() === '' || rom.match(rxMatchItalicised) === null) &&
              (!needsEnglishTranslation || (eng || '').trim() === '' || eng.match(rxMatchItalicised) === null)
            )
          });
          return !isNotItalicized;
        },
        //@ts-ignore
        callback(key, selection, clickEvent) {
          const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
          if (fromRow === null || toRow === null) return;
          //@ts-ignore
          const data = this.getData();
          for (let i = fromRow; i <= toRow; i++) {
            const row = data[i];
            let orig = (row[1] || '').trim();
            row[1] = `''${orig}''`;
            let rom = (row[2] || '').trim();
            if (needsRomanization && rom !== '') row[2] = `''${rom}''`;
            let eng = (row[3] || '').trim();
            if (needsEnglishTranslation && eng !== '') row[3] = `''${eng}''`;
          }
          //@ts-ignore
          this.loadData(data);
        }
      },
      unbold: {
        name: () => ('Unbold row'),
        hidden() {
          const selectedRows = getSelectedRowData(this);
          const isBolded = selectedRows.some(([_, orig, rom, eng]) => {
            return (
              ((orig || '').match(rxMatchBolded) !== null) ||
              (!needsRomanization || (rom || '').match(rxMatchBolded) !== null) ||
              (!needsEnglishTranslation || (eng || '').match(rxMatchBolded) !== null)
            )
          });
          return !isBolded;
        },
        //@ts-ignore
        callback(key, selection, clickEvent) {
          const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
          if (fromRow === null || toRow === null) return;
          //@ts-ignore
          const data = this.getData();
          for (let i = fromRow; i <= toRow; i++) {
            const row = data[i];
            let orig = (row[1] || '').trim();
            row[1] = orig.replace(rxMatchBolded, '$2');
            let rom = (row[2] || '').trim();
            if (needsRomanization && rom !== '') row[2] = rom.replace(rxMatchBolded, '$2');
            let eng = (row[3] || '').trim();
            if (needsEnglishTranslation && eng !== '') row[3] = eng.replace(rxMatchBolded, '$2');
          }
          //@ts-ignore
          this.loadData(data);
        }
      },
      unitalic: {
        name: () => ('Unitalicize row'),
        hidden() {
          const selectedRows = getSelectedRowData(this);
          const isItalicized = selectedRows.some(([_, orig, rom, eng]) => {
            return (
              ((orig || '').match(rxMatchItalicised) !== null) ||
              (!needsRomanization || (rom || '').match(rxMatchItalicised) !== null) ||
              (!needsEnglishTranslation || (eng || '').match(rxMatchItalicised) !== null)
            )
          });
          return !isItalicized;
        },
        //@ts-ignore
        callback(key, selection, clickEvent) {
          const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
          if (fromRow === null || toRow === null) return;
          //@ts-ignore
          const data = this.getData();
          for (let i = fromRow; i <= toRow; i++) {
            const row = data[i];
            let orig = (row[1] || '').trim();
            row[1] = orig.replace(rxMatchItalicised, '$2');
            let rom = (row[2] || '').trim();
            if (needsRomanization && rom !== '') row[2] = rom.replace(rxMatchItalicised, '$2');
            let eng = (row[3] || '').trim();
            if (needsEnglishTranslation && eng !== '') row[3] = eng.replace(rxMatchItalicised, '$2');
          }
          //@ts-ignore
          this.loadData(data);
        }
      },
      sp3: '---------',
      row_above: { disabled: false }, 
      row_below: { disabled: false }, 
      remove_row: { disabled: false },
      clear_column: { disabled: false }
    }
  }), []);

  return (
    <div className="table-container">
      <HotTable
        ref={ref}
        rowHeaders={true}
        colHeaders={headersText}
        width="100%"
        contextMenu={contextMenuOptions}
        hiddenColumns={hiddenColumns}
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