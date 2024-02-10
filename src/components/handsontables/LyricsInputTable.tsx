import { ForwardedRef, forwardRef } from "react";
import { HotTable } from '@handsontable/react';
import { sharedContextMenuOptions } from "./shared";

interface LyricsInputTableInterface {
  headersText: string[]
  needsRomanization: boolean
  needsEnglishTranslation: boolean
  mode?: 'dark' | 'light'
}

// @ts-ignore
const lyricRenderer = (instance, td, row, col, prop, value, cellProperties) => {
  if (value === null) {
    td.innerHTML = '';
    return td;
  }
  const colour = instance.getDataAtCell(row, 0) || '';
  value = value.replace(/<ref\s*[^>]*\/>/gi, '<i class="asterisk tiny icon"></i>');
  value = value.replace(/<ref\s*[^>]*>(.*)<\/ref>/gi, '<i class="asterisk tiny icon"></i>');
  value = value.replace(/'{3}([^']*)'{3}/g, '<b>$1</b>');
  value = value.replace(/'{2}([^']*)'{2}/g, '<i>$1</i>');
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
  ]

  return (
    <div className="table-container">
      <HotTable
        ref={ref}
        rowHeaders={true}
        colHeaders={headersText}
        width="100%"
        contextMenu={sharedContextMenuOptions}
        hiddenColumns={hiddenColumns}
        columns={columnDefinitions}
        autoWrapRow={true}
        autoWrapCol={true}
        selectionMode="multiple"
        manualColumnResize={true}
        imeFastEdit={true}
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