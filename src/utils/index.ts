import { CONST_COLOUR_NAMES } from "../constants/colours";
import { CONST_TRANSLATOR_LICENSES } from "../constants/translators";
import { Lyric } from "../generators/classes";

export const validateColour = (colour: string) => {
  return (
    colour === "" || 
    colour.match(/^#[0-9a-fA-F]{3,6}$/) || 
    Object.keys(CONST_COLOUR_NAMES).includes(colour)
  );
}

export const convertColourStringToHexCode = (colour: string): string => {
  return (CONST_COLOUR_NAMES as any)[colour] || colour
}

export const parseHeadersFromLanguages = (
  languages: { name: string, transliteration?: string }[]
): [boolean, boolean, string[], boolean] => {

  let needsRomanization = false;
  let needsEnglishTranslation = false;
  let headersText: string[] = ["Colour", "Original", "Romanized", "English"];
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
      "Colour", 
      headerOriginalLanguages.join("/"),
      (needsRomanization ? headerRomanizedLanguages.join("/") : ''),
      "English"
    ];
  }

  return [needsRomanization, needsEnglishTranslation, headersText, isChinese]
}

export function detonePinyin(romText: string, bShowUmlaut = false) {
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
    needsRomanization: boolean,
    needsEnglishTranslation: boolean
  }
  translator: string
  isOfficialTranslation: boolean
  bgColour: string
  fgColour: string
  overrideShowEnglishColumn?: boolean
}
export function generateLyricsTable(
  lyrics: Lyric[], 
  { 
    langOptions: { headersText, needsRomanization, needsEnglishTranslation }, 
    translator, isOfficialTranslation,
    bgColour, fgColour,
    overrideShowEnglishColumn = false
  }: LyricsGeneratorParams
): string {
  const outputAsWikiTable = needsRomanization || needsEnglishTranslation;
  const hasEnglishTranslation = lyrics.some(lyric => !!lyric.english && lyric.english !== '');
  const showEnglishColumn = overrideShowEnglishColumn || (needsEnglishTranslation && hasEnglishTranslation);

  headersText = headersText.filter((header) => (header !== ''));
  
  let showNotes: boolean = false;
  let isTranslationNote: boolean | null = null;
  const rxRefTag = /<ref(?:[^>]*)>/;
  let usedColours: Set<string> = new Set();
  for (let lyric of lyrics) {
    usedColours.add(lyric.colour);
    if (lyric.original.match(rxRefTag) || (lyric?.romanized || '').match(rxRefTag)) {
      showNotes = true;
      isTranslationNote = isTranslationNote || false;
    } else if (hasEnglishTranslation && (lyric?.english || '').match(rxRefTag)) {
      showNotes = true;
      isTranslationNote = true;
    }
  }

  let res: string = '';

  // Translator license
  const referLicense = CONST_TRANSLATOR_LICENSES.find(el => (
    el.id[0] === translator
  ));
  if (referLicense) {
    res += `{{TranslatorLicense|${referLicense.id[0]}|${referLicense.license}}}\n`;
  }

  // Singer coloured lines
  if (usedColours.size > 1) {
    let hasMultipleSingerLines = usedColours.has('');
    if (hasMultipleSingerLines) usedColours.delete('');
    let singerTabs = [...usedColours].map(el => (
      `|<span style="color:${el}">Singer</span>\n`
    )).join('');
    if (hasMultipleSingerLines) singerTabs += '|All';
    res += `{| border="1" cellpadding="4" style="border-collapse:collapse; border:1px groove; line-height:1.5"\n!style="background-color:${bgColour}; color:${fgColour}"|Singer\n${
      singerTabs
    }\n|}\n`;
  }

  if (outputAsWikiTable) {
    // Generate as multi-column table
    let wikiHeaders: string = '';
    if (hasEnglishTranslation && isOfficialTranslation) {
      wikiHeaders = headersText.map((el) => {
        if (el === 'English') {
          return '|{{OfficialEnglish}}\n';
        } else {
          return `|'''''${el}'''''\n`
        }
      }).join('');
    } else {
      wikiHeaders = headersText.map(el => {
        if (!showEnglishColumn && el === 'English') return '';
        return `|'''''${el}'''''\n`
      }).join('');
    }

    res += `{| style="width:100%"\n${
      wikiHeaders
    }${
      lyrics.map(lyric => lyric.getWikitext(showEnglishColumn)).join('')
    }|}`;

    if (hasEnglishTranslation && (!isOfficialTranslation || translator !== '')) {
      res += `\n{{Translator|${
        translator === '' ? 'Anonymous' : translator
      }}}\n`
    }
  } else {
    // Generate as single-column div
    let prevLyrics: Lyric | null = null;
    const arrSpans: { contents: string, colour: string | null }[] = [];
    let curSpan: { contents: string, colour: string | null } = { contents: '', colour: null };
    for (let lyric of lyrics) {
      // Skip line breaks
      if (lyric.original === '') {
        curSpan.contents += '\n';
        continue;
      }
      // Add to array of spans to take note of when a change in text colour is detected
      if (prevLyrics !== null && lyric.colour !== prevLyrics.colour) {
        arrSpans.push(curSpan);
        curSpan = { contents: '',  colour: null };
      }
      if (lyric.colour !== '') curSpan.colour = lyric.colour;
      // Store current line
      curSpan.contents += lyric.original + '\n';
      // Save lyrics to be compared
      prevLyrics = lyric;
    }
    arrSpans.push(curSpan);
    console.log(arrSpans);
    
    res += `<poem>${
      arrSpans.map(({ contents, colour }) => {
        contents = contents.replace(/\n$/, '');
        if (colour !== null) contents = `<span style="color:${colour};">${contents}</span>`;
        return contents;
      }).join('\n')
    }</poem>`
  }

  // Lyrics/Translation Notes
  if (showNotes) {
    res += `\n==${isTranslationNote ? 'Translation ' : ''}Notes==\n<references />\n`;
  }
  return res;
}