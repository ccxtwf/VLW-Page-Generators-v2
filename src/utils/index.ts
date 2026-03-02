import { COLOURS } from "../constants/colours";
import { TRANSLATOR_LICENSES } from "../constants/translators";
import { Lyric } from "../generators/classes";
import { IDictionary } from "../types";

export const validateColour = (colour: string) => {
  return (
    colour === "" || 
    colour.match(/^#[0-9a-fA-F]{3,6}$/) || 
    Object.keys(COLOURS).includes(colour)
  );
}

export const convertColourStringToHexCode = (colour: string): string => {
  return (COLOURS as any)[colour] || colour
}

export const parseHeadersFromLanguages = (
  languages: { name: string, transliteration?: string }[]
): [boolean, boolean, string[], boolean] => {

  let needsRomanization = false;
  let needsEnglishTranslation = false;
  let headersText: string[] = ["Row Styling", "Original", "Romanized", "English"];
  let isChinese = false;

  if (languages.length === 0) {
    needsRomanization = true;
    needsEnglishTranslation = true;
  } else {
    const headerOriginalLanguages: string[] = [];
    const headerRomanizedLanguages: string[] = [];

    languages.forEach(lang => {
      if (lang.name !== 'English') needsEnglishTranslation = true;
      if (lang.name === 'Mandarin') {
        isChinese = true;
        headerOriginalLanguages.push('Chinese');
      } else if (lang.name === 'Cantonese') {
        isChinese = true;
        headerOriginalLanguages.push(lang.name);
      } else {
        headerOriginalLanguages.push(lang.name);
      }
      if (lang.transliteration) {
        needsRomanization = true;
        headerRomanizedLanguages.push(lang.transliteration);
      }
    });

    headersText = [
      "Row Styling", 
      headerOriginalLanguages.join("/"),
      (needsRomanization ? headerRomanizedLanguages.join("/") : ''),
      "English"
    ];
  }

  return [needsRomanization, needsEnglishTranslation, headersText, isChinese]
}

export function detonePinyin(romText: string, bShowUmlaut = false): string {
  romText = romText.replace(/[āáǎà]/gm, "a");
  romText = romText.replace(/[ĀÁǍÀ]/gm, "A");
  romText = romText.replace(/[īíǐì]/gm, "i");
  romText = romText.replace(/[ĪÍǏÌ]/gm, "I");
  romText = romText.replace(/[ūúǔù]/gm, "u");
  romText = romText.replace(/[ŪÚǓÙ]/gm, "U");
  romText = romText.replace(/[ēéěè]/gm, "e");
  romText = romText.replace(/[ĒÉĚÈ]/gm, "E");
  romText = romText.replace(/[ōóǒò]/gm, "o");
  romText = romText.replace(/[ŌÓǑÒ]/gm, "O");
  if (bShowUmlaut) {
      romText = romText.replace(/[ǖǘǚǜ]/gm, "ü");
      romText = romText.replace(/[ǕǗǙǛ]/gm, "Ü");
  }
  else {
      romText = romText.replace(/[ǖǘǚǜ]/gm, "v");
      romText = romText.replace(/[ǕǗǙǛ]/gm, "V");
  }
  return romText;
}

interface LyricsGeneratorParams {
  langOptions: {
    headersText: string[],
    skipColumns?: number[]
  }
  isoLangCode: string
  translator: string
  isOfficialTranslation: boolean
  bgColour: string
  fgColour: string
  createToggleElement?: boolean
}
function generateLyricsToggle(headersText: string[], needsRomanization: boolean, showEnglishColumn: boolean, isoLangCode: string) {
  const lookupOriginalColumnSemanticId: IDictionary<string> = {
    'Japanese': 'jp',
    'Chinese': 'cn',
    'Korean': 'kr',
    'Cantonese': 'yue',
    'Spanish': 'sp',
    'Portuguese': 'pt',
    'Indonesian': 'id',
    'French': 'fr',
    'German': 'de',
    'Russian': 'ru',
  };
  const lookupRomanizedColumnSemanticId: IDictionary<string> = {
    'Romanized': 'rom',
    'Romaji': 'rom',
    'Romaja': 'rom',
    'Pinyin': 'py',
  };
  const skipCustomLangIsoCode: IDictionary<string> = {
    'Japanese': 'ja',
    'Chinese': 'zh-Hans',
    'Korean': 'ko',
    'Cantonese': 'zh-Hant',
    'Spanish': 'es',
    'Portuguese': 'pt',
    'Indonesian': 'id',
    'French': 'fr',
    'German': 'de',
    'Russian': 'ru',
  }
  
  let res = "{{lyrics toggle|";
  let idx = 0;
  res += `${(lookupOriginalColumnSemanticId[headersText[idx]] || 'org')}:${headersText[idx++]}`;
  if (needsRomanization) {
    res += `|${(lookupRomanizedColumnSemanticId[headersText[idx]] || 'rom')}:${headersText[idx++]}`;
  }
  if (showEnglishColumn) {
    res += `|eng:${headersText[idx++]}`;
  }
  if (!(headersText[0] in skipCustomLangIsoCode) || (isoLangCode !== '' && skipCustomLangIsoCode[headersText[0]] !== isoLangCode)) {
    res += `|iso-lang=${isoLangCode}`;
  }
  res += "}}";
  return res;
}
export function generateLyricsTable(
  lyrics: Lyric[], 
  { 
    langOptions: { headersText, skipColumns = [] }, 
    isoLangCode, translator, isOfficialTranslation,
    bgColour, fgColour,
    createToggleElement = true,
  }: LyricsGeneratorParams
): string {
  const needsRomanization = !skipColumns.includes(2);
  const needsEnglishTranslation = !skipColumns.includes(3);
  const outputAsWikiTable = needsRomanization || needsEnglishTranslation;
  const hasEnglishTranslation = lyrics.some(lyric => !!lyric.english && lyric.english !== '');
  const showEnglishColumn = needsEnglishTranslation && hasEnglishTranslation;

  headersText = headersText.filter((header) => (header !== ''));
  
  let showNotes: boolean = false;
  let isTranslationNote: boolean | null = null;
  const rxRefTag = /<ref(?:[^>]*)>/;
  const rxSpanInlineColour = /<span\s+style\s*=\s*["'][^>]*color\s*:\s*([a-zA-Z0-9#]+)\s*[^>]*["']>.*?<\/span>/gm;
  let usedColours: Set<string> = new Set();
  for (let lyric of lyrics) {
    let detectedRowColour = lyric.customStyle.match(/color\s*:\s*([#0-9a-zA-Z]+);?/);
    if (detectedRowColour === null) {
      usedColours.add('');
    } else {
      usedColours.add(detectedRowColour[1]);
    }
    const detectedInlineColours = lyric.original.matchAll(rxSpanInlineColour);
    for (let [_, colour] of detectedInlineColours) {
      usedColours.add(colour);
    }
    if (lyric.original.match(rxRefTag) || (lyric?.romanized || '').match(rxRefTag)) {
      showNotes = true;
      isTranslationNote = isTranslationNote || false;
    } else if (hasEnglishTranslation && (lyric?.english || '').match(rxRefTag)) {
      showNotes = true;
      isTranslationNote = true;
    }
  }

  let res: string = '';

  if (createToggleElement && (needsRomanization || needsEnglishTranslation)) {
    // Lyrics toggle & column headers definition
    res += generateLyricsToggle(headersText, needsRomanization, showEnglishColumn, isoLangCode);
    res += "\n";
  }

  if (outputAsWikiTable && hasEnglishTranslation && isOfficialTranslation) {
    res += '{{OfficialEnglishNotify}}\n';
  }

  // Translator license
  const referLicense = TRANSLATOR_LICENSES.find(el => (
    el.id[0] === translator
  ));
  if (referLicense) {
    res += `{{TranslatorLicense2|${referLicense.id[0]}}}\n`;
  }

  // Singer coloured lines
  if (usedColours.size > 1) {
    let hasMultipleSingerLines = usedColours.has('');
    if (hasMultipleSingerLines) usedColours.delete('');
    let singerTabs = [...usedColours].map(el => (
      `|<span style="color:${el};">Singer</span>\n`
    )).join('');
    if (hasMultipleSingerLines) singerTabs += '|All\n';
    res += `{| border="1" cellpadding="4" style="border-collapse:collapse; border:1px groove; line-height:1.5"\n!style="background-color:${bgColour}; color:${fgColour};"|Singer\n${
      singerTabs
    }|}\n`;
  }

  if (outputAsWikiTable) {
    // Generate as multi-column table
    res += `{| {{lyrics table class}}\n|- class="lyrics-table-header"\n! {{lyrics header}}\n`;
    res += lyrics.map(lyric => lyric.getWikitext(showEnglishColumn)).join('');
    res += '|}';

    if (hasEnglishTranslation && (!isOfficialTranslation || translator !== '')) {
      res += `\n{{Translator|${
        translator === '' ? 'Anonymous' : translator
      }}}`
    }
  } else {
    // Generate as single-column div
    let prevLyrics: Lyric | null = null;
    const arrSpans: { contents: string, customStyle: string | null }[] = [];
    let curSpan: { contents: string, customStyle: string | null } = { contents: '', customStyle: null };
    for (let lyric of lyrics) {
      // Skip line breaks
      if (lyric.original === '') {
        curSpan.contents += '\n';
        continue;
      }
      // Add to array of spans to take note of when a change in text colour is detected
      if (prevLyrics !== null && lyric.customStyle !== prevLyrics.customStyle) {
        arrSpans.push(curSpan);
        curSpan = { contents: '',  customStyle: null };
      }
      if (lyric.customStyle !== '') curSpan.customStyle = lyric.customStyle;
      // Store current line
      curSpan.contents += lyric.original + '\n';
      // Save lyrics to be compared
      prevLyrics = lyric;
    }
    arrSpans.push(curSpan);
    console.log(arrSpans);
    
    res += `<poem>${
      arrSpans.map(({ contents, customStyle }) => {
        contents = contents.replace(/\n$/, '');
        if (customStyle !== null) contents = `<span style="${customStyle}">${contents}</span>`;
        return contents;
      }).join('\n')
    }</poem>`;
  }

  // Lyrics/Translation Notes
  if (showNotes) {
    res += `\n\n==${isTranslationNote ? 'Translation ' : ''}Notes==\n{{Reflist}}`;
  }
  return res;
}

export function convertAvidToBvId(url: string): string {
  let id: string | RegExpMatchArray | null = url.match(/^https?:\/\/www\.bilibili\.com\/video\/av(\d+)/);
  if (id === null) {
    return url;
  }
  id = id[1];
  const XOR_CODE = 23442827791579n;
  const MAX_AID = 1n << 51n;
  const BASE = 58n;
  const data = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';
  const bytes = ['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
  let bvIndex = bytes.length - 1;
  let tmp = (MAX_AID | BigInt(id)) ^ XOR_CODE;
  while (tmp > 0) {
    bytes[bvIndex] = data[Number(tmp % BigInt(BASE))];
    tmp = tmp / BASE;
    bvIndex -= 1;
  }
  [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
  [bytes[4], bytes[7]] = [bytes[7], bytes[4]];
  return `https://www.bilibili.com/video/${bytes.join('')}`;
}

export function standardizeYoutubeLink(url: string) {
  const matchDomain = /^https?:\/\/(?:(?:www\.|)youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/;
  const m = url.match(matchDomain);
  if (m === null) return url;
  return `https://www.youtube.com/watch?v=${m[1]}`;
}

export function upgradeInsecureHttpLink(url: string) {
  return url.replace(/^http:\/\//, 'https://');
}

export function convertTwitterLink(url: string) {
  const matchDomain = /^https?:\/\/(?:www\.|)twitter\.com\/(.*)$/;
  const m = url.match(matchDomain);
  if (m === null) return url;
  return `https://x.com/${m[1]}`;
}

export function parseDateAsUtc(dateIsoFormat: string) {
  const d = new Date(dateIsoFormat);
  return `${d.getUTCFullYear()}-${
    (d.getUTCMonth() + 1).toString().padStart(2, '0')
  }-${
    d.getUTCDate().toString().padStart(2, '0')
  }`;
}