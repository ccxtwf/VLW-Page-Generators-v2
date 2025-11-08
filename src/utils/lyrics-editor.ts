import { IDictionary } from "../types";
import { detonePinyin } from "../utils";

export function parseLyricsTablesFromSourceCode(wikipageContents: string): RegExpMatchArray[] {
  const rx = /(\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]toggle[^\}]+\}\}(?:.*?)|)(\{\|\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]table[ _]class\}\}\s*\n\|-\s*class\s*=\s*["'][^\n]*\blyrics-table-header\b[^\n]*["']\s*\n!\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]header\}\})\s*\n(.*?\|\})\s*(\{\{(?:[Tt]emplate:|)[Tt]ranslator[^\}]*\}\}|)/gs;
  return Array.from(wikipageContents.matchAll(rx));
}

export function parseLyricsToggleParameters(lyricsToggleWikitext: string): { toggleElement: string, headers: string[], isoLangCode: string | null, miscParams: IDictionary<string> } {
  const headers: string[] = [];
  let isoLangCode = null;
  const miscParams: IDictionary<string> = {};
  const template = lyricsToggleWikitext.match(/\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]toggle\|(.*)\}\}/);
  
  if (template === null || template[1] === '') {
    return { 
      toggleElement: template === null ? '' : template[0], 
      headers, isoLangCode, miscParams 
    };
  } 
  for (let param of template[1].split('|')) {
    if (param.includes('=')) {
      const [_, paramKey, paramValue] = param.match(/^\s*(.*?)\s*=\s*(.*)\s*$/) || ['', '', ''];
      switch (paramKey) {
        case 'iso-lang':
          isoLangCode = paramValue;
          break;
        default:
          miscParams[paramKey] = paramValue;
          break;
      }
    } else {
      headers.push(param.replace(/^.*?:\s*?(.*)\s*?$/, '$1'));
    }
  }
  return { toggleElement: template[0], headers, isoLangCode, miscParams };
}
  
export function parseLyricsFromTable(table: RegExpMatchArray): { 
  lyrics: string[][], toggleElement: string, headers: string[], isoLangCode: string | null, numColumns: number 
} {
  const lyrics = [];
  let numColumns = 0;

  const [ _, tableDefinition, __, tableBody ] = table;

  const { toggleElement, headers, isoLangCode } = parseLyricsToggleParameters(tableDefinition);
  
  const tableRows = Array.from(tableBody.matchAll(/\|-(.*?)\n([^]*?)\n(?=\|-|\|\})/g))
    .map(function (tableRow) {
      const contents = tableRow[0];
      const m = tableRow[1].match(/style\s*=\s*["']\s*([^\n]*?)\s*;*\s*["']/);
      const customStyle = m === null ? '' : m[1]+';';
      const lines = tableRow[2];
      const rxResults = lines.matchAll(/(?<=\n\||^\|).*?(?=\n\||$)/g);
      const splitLyrics = Array.from(rxResults).map((res) => res[0]);
      numColumns = Math.max(numColumns, splitLyrics.length);
      return { contents, customStyle, splitLyrics };
    });
  numColumns = Math.min(+import.meta.env.VITE_LYRICS_TABLE_MAX_COLUMNS+1, numColumns);

  for (let tableRow of tableRows) {
    const { customStyle, splitLyrics } = tableRow;
    if (splitLyrics.length === 1) {
      const rxCheckSharedColumn = /^\s*(\{\{(?:[Tt]emplate:|)[Ss]hared[^\}]*\}\}|[^\n]*?colspan=\s*(?:["']|)\s*\d+\s*(?:["']|)[^\n]*?\|)/g;
      let sharedRow = splitLyrics[0];
      if (sharedRow.match(/^\s*<br\s*\/?\s*>\s*$/)) {
        let lyricRow = [customStyle];
        for (let j = 0; j < numColumns; j++) {
          lyricRow.push('');
        }
        lyrics.push(lyricRow);
      } else if (sharedRow.match(rxCheckSharedColumn)) {
        sharedRow = sharedRow.replace(rxCheckSharedColumn, '');
        let lyricRow = [customStyle];
        for (let j = 0; j < numColumns; j++) {
          lyricRow.push(sharedRow);
        }
        lyrics.push(lyricRow);
      } else {
        let lyricRow = [customStyle, splitLyrics[0] || ''];
        for (let j = 1; j < numColumns; j++) {
          lyricRow.push('');
        }
        lyrics.push(lyricRow);
      }
    } else {
      let lyricRow = [customStyle];
      for (let j = 0; j < numColumns; j++) {
        lyricRow.push(splitLyrics[j] || '');
      }
      lyrics.push(lyricRow);
    }
  }
  
  return { lyrics, toggleElement, headers, isoLangCode, numColumns };
}

export function consolidateCellInlineColourFormatting(lyrics: string[][]): string[][] {
  const rxCellInlineColourFormatting = /^\s*<[Ss][Pp][Aa][Nn]\s+style\s*=\s*["']\s*color\s*:\s*([a-zA-Z0-9#]+);?["']\s*>(.*)<\/\s*[Ss][Pp][Aa][Nn]\s*>\s*$/;
  const rxSpanTagHead = /<span(?:\s+[^>]+|)\s*>/i;
  return lyrics.map((lyric) => {
    let m = [];
    for (let i = 1; i < lyric.length; i++) {
      const l = (lyric[i] || '').trim()
      const rxResults = l.match(rxCellInlineColourFormatting);
      m.push({ rxResults, isEmpty: l === '' });
    }
    if (m.every((el => el.isEmpty || !!el.rxResults))) {
      // Skip if the contents enclosed within the span tags in the original lyrics contain another span tag.
      if (!!m[0].rxResults && !m[0].rxResults[2].match(rxSpanTagHead)) {
        lyric[0] = `color:${m[0].rxResults[1]};`;
        for (let i = 1; i < lyric.length; i++) {
          //@ts-ignore
          if (!!m[i-1].rxResults) lyric[i] = m[i-1].rxResults[2];
        }
      }
    }
    return lyric;
  })
}
export function decapitalizeRomanization(lyrics: string[][]): string[][] {
  return lyrics.map((lyric) => {
    lyric[2] = (lyric[2] || '').trim().replace(/^(?:["'`]*)\w/, (match: string) => {
      return match.toLowerCase();
    });
    lyric[2] = lyric[2].replace(/([\.\?!])\s*(["'`]*\s*)(\w)/g, (_, p: string, a: string, match: string) => {
      return `${p} ${a}${match.toLowerCase()}`;
    });
    return lyric;
  });
}
export function detonePinyinLyrics(lyrics: string[][]): string[][] {
  return lyrics.map((lyric) => {
    lyric[2] = detonePinyin((lyric[2] || '').trim(), true);
    return lyric;
  });
}
export function standardizeHepburnRomanization(lyrics: string[][]): string[][] {
  return lyrics.map((lyric) => {
    lyric[2] = (lyric[2] || '').trim().replace(/(?=\b)(wo|he)(?<=\b)/gi, (match: string) => {
      switch (match) {
        case 'wo':
          return 'o';
        case 'he':
          return 'e';
        default:
          return ''
      }
    });
    lyric[2] = (lyric[2] || '').trim().replace(/dzu/gi, 'zu');
    return lyric;
  });
}