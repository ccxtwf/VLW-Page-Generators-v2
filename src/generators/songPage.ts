import { ENUM_AI_WARNING_TYPE, ENUM_CW_STATES } from "../types";
import { Lyric, PlayLink, ExternalLink } from "./classes";
import { PV_SERVICE_ABBREVIATIONS } from '../constants/linkDomains';
import { MONTHS } from "../constants/months";
import { generateLyricsTable, detonePinyin, validateColour } from "../utils";
import { LANGUAGES } from "../constants/languages";

interface RawInput {
  data: {
    aiCwState: ENUM_AI_WARNING_TYPE
    aiWarningText1: string
    aiWarningText2: string
    cwState: ENUM_CW_STATES
    cwText: string
    hasEpilepsyWarning: boolean
    origTitle: string
    altChTitle: string
    altChIsTraditional: boolean
    romTitle: string
    engTitle: string
    titleIsOfficiallyTranslated: boolean
    languageIds: number[]
    isoLangCode: string
    bgColour: string
    fgColour: string
    uploadDate: string
    isAlbumOnly: boolean
    isUnavailable: boolean
    singers: string
    producers: string
    description: string
    translator: string
    isOfficialTranslation: boolean
    categoriesRaw: string
  }
  langOptions: {
    headersText: string[]
    skipColumns?: number[]
  },
  playLinksData: any[][]
  lyricsData: any[][]
  extLinksData: any[][]
}
interface ProcessedInput {
  data: {
    aiCwState: ENUM_AI_WARNING_TYPE
    aiWarningText1: string
    aiWarningText2: string
    cwState: ENUM_CW_STATES
    cwText: string
    hasEpilepsyWarning: boolean
    languages: string[]
    isoLangCode: string
    origTitle: string
    altChTitle: string
    altChIsTraditional: boolean
    romTitle: string
    engTitle: string
    titleIsOfficiallyTranslated: boolean
    bgColour: string
    fgColour: string
    uploadDate: Date | null
    singers: string
    producers: string
    description: string
    isAlbumOnly: boolean
    isUnavailable: boolean
    translator: string
    isOfficialTranslation: boolean
    categories: string[]
  },
  langOptions: {
    headersText: string[],
    skipColumns?: number[]
  },
  playLinks: PlayLink[],
  lyrics: Lyric[],
  extLinks: ExternalLink[]
}
interface AutoloadCategoriesInput {
  needsEnglishTranslation: boolean 
  producers: string
  isAlbumOnly: boolean
  lyricsData: string[][]
}

export function parseInput({
  data, langOptions,
  playLinksData, lyricsData, extLinksData
}: RawInput): ProcessedInput {
  let {
    aiWarningText1, aiWarningText2, cwText, 
    origTitle, altChTitle, romTitle, engTitle, isoLangCode,
    bgColour, fgColour,
    uploadDate: uploadDateRaw,
    singers, producers,
    description,
    translator, 
    categoriesRaw
  } = data;
  aiWarningText1 = aiWarningText1.trim();
  aiWarningText2 = aiWarningText2.trim();
  cwText = cwText.trim();
  isoLangCode = isoLangCode.trim();
  origTitle = origTitle.trim();
  altChTitle = altChTitle.trim();
  romTitle = romTitle.trim();
  engTitle = engTitle.trim();
  bgColour = bgColour.trim();
  fgColour = fgColour.trim();
  translator = translator.trim();
  uploadDateRaw = uploadDateRaw.trim();
  let uploadDate: Date | null = uploadDateRaw === '' ? null : new Date(uploadDateRaw);
  const convertRawTextAreaInput = (input: string) => (input.replace(/[\r \t]*\n[\r \t]*/g, '<br />'));
  singers = convertRawTextAreaInput(singers.trim());
  producers = convertRawTextAreaInput(producers.trim());
  description = convertRawTextAreaInput(description.trim());
  const languages = data.languageIds.map((languageId) => {
    const { name } = LANGUAGES[languageId] || {};
    if (name === 'Non-lexical lyrics') return 'Nonlexical';
    return name;
  })
  let categories: string[] = [];
  categoriesRaw = categoriesRaw.trim();
  if (categoriesRaw !== '') categories = categoriesRaw.split(/[\r\s]*\n+[\r\s]*/);

  const playLinks: PlayLink[] = playLinksData
    .map(arr => new PlayLink(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]))
    .filter(el => el.url !== '');
  const extLinks: ExternalLink[] = extLinksData
    .map(arr => new ExternalLink(arr[0], arr[1], arr[2]))
    .filter(el => el.url !== '');
  const lyrics: Lyric[] = lyricsData.map(arr => (
    new Lyric(
      { 
        hasAdditionalColumns: false,
        skipColumns: langOptions.skipColumns,
      }, 
      ...arr)
  ));

  return {
    data: {
      aiCwState: data.aiCwState, aiWarningText1, aiWarningText2,
      cwState: data.cwState, cwText, 
      hasEpilepsyWarning: data.hasEpilepsyWarning,
      origTitle, altChTitle, altChIsTraditional: data.altChIsTraditional, romTitle, engTitle, 
      titleIsOfficiallyTranslated: data.titleIsOfficiallyTranslated,
      languages: languages, 
      isoLangCode,
      bgColour, fgColour,
      uploadDate, 
      isAlbumOnly: data.isAlbumOnly, isUnavailable: data.isUnavailable,
      singers, producers, description,
      translator, isOfficialTranslation: data.isOfficialTranslation,
      categories
    },
    langOptions,
    playLinks, extLinks, lyrics
  }
}

export function autoloadCategories({
  needsEnglishTranslation, 
  producers, 
  lyricsData
}: AutoloadCategoriesInput): string[] {
  const res = [];
  
  const tryMatchCircle = /'{2,}\[\[(?<base>[^\|\n\]]*)\|?(?<cap>(?<=\|)[^\|\n\]]*)?\]\]'{2,}/
    .exec(producers);
  if (tryMatchCircle !== null) {
    let { base = '' } = tryMatchCircle.groups || {};
    base = base.trim();
    if (base !== '' && base.match(/^w:c:/i) === null) {
      if (base.match(/^:Category:(?:.*) songs list/i) !== null) {
        base = base.replace(/^:Category:\s*/i, '');
      } else {
        base = `${base} songs list`;
      }
      res.push(base);
    }
  }

  const producersInMarkup = producers.matchAll(
    /\[\[(?<base>[^\|\n\]]*)\|?(?<cap>(?<=\|)[^\|\n\]]*)?\]\]\s*\((?<role>.*)\)/g
  );
  for (let producer of producersInMarkup) {
    
    let prodCategoryTag: string = '';
    let { base = '', role = '' } = producer.groups || {};

    // Infer base producer category
    if (base === '') continue;
    base = base.trim();
    if (base.match(/^:Category:(?:.*) songs list/i) !== null) {
      prodCategoryTag = base.replace(/^:Category:\s*/i, '');
    } else {
      prodCategoryTag = `${base} songs list`;
    }

    // Infer subcategories if any
    const splitRoles = role.toLowerCase().split(/\s*,\s*/g);
    let matchedSubtags: Set<string> = new Set();
    for (let role of splitRoles) {
      if (role === 'music' || role === 'compose' || role === 'composition') {
        matchedSubtags = new Set();
        matchedSubtags.add('');
        break;
      }
      switch (role) {
        case "lyrics":
          matchedSubtags.add('/Lyrics');
          break;
        case "tuning":
          matchedSubtags.add('/Tuning');
          break;
        case "arrange":
        case "arrangement":
          matchedSubtags.add('/Arrangement');
          break;
        case "illust":
        case "illustration":
        case "pv":
        case "movie":
        case "video":
        case "animation":
          matchedSubtags.add('/Visuals');
          break;
        case "mix":
        case "master":
        case "mastering":
        case "instruments":
        case "other":
          matchedSubtags.add('/Other');
          break;
        default:
          matchedSubtags.add('');
          break;
      }
    }
    if (matchedSubtags.has('')) {
      res.push(`${prodCategoryTag}`);
      matchedSubtags.delete('');
    }
    for (let subtag of matchedSubtags) {
      res.push(`${prodCategoryTag}${subtag}`);
    }
  }

  if (needsEnglishTranslation && lyricsData.every(el => !el[3] || el[3].trim() === '')) {
    res.push('Pages in need of English translation');
  }

  return res;
}

export function validate(input: ProcessedInput): {
  errors: ( boolean | string )[][],
  recommendToAutoloadCategories: boolean
} {
  let { 
    data: {
      aiCwState, aiWarningText1, aiWarningText2,
      cwState, cwText, 
      origTitle, languages,
      bgColour, fgColour, uploadDate,
      singers, producers, isAlbumOnly, isUnavailable,
      translator, isOfficialTranslation,
      categories
    }, 
    langOptions: { skipColumns }, 
    playLinks, lyrics 
  } = input;

  let recommendToAutoloadCategories = false;
  const res = [];

  if (cwState !== ENUM_CW_STATES.noWarnings && cwText === '') {
    res.push([
      true, 
      'You must add a reason for wanting to add a content warning onto the page, e.g. violent content, sexual content, etc.', 
      'cwText'
    ]);
  }
  if (aiCwState !== ENUM_AI_WARNING_TYPE.none && aiWarningText1 === '') {
    res.push([
      true, 
      'You must specify which part of the song/video uses Generative AI, e.g. illustration, lyrics.', 
      'aiWarningText'
    ]);
  }
  if (aiCwState !== ENUM_AI_WARNING_TYPE.none && aiWarningText2 === '') {
    res.push([
      true, 
      'You must add a source/explanation attributing to the verified/suspected usage of Generative AI.', 
      'aiWarningText'
    ]);
  }

  if (languages.length === 0) {
    res.push([
      true, 
      'You haven\'t chosen a language.', 
      'languageIds'
    ]);
    recommendToAutoloadCategories = true;
  }

  if (origTitle === '') {
    res.push([
      true, 
      'You haven\'t entered a song title.', 
      'origTitle'
    ]);
  }

  if (uploadDate === null) {
    res.push([
      true, 
      'You haven\'t entered the date of publication.', 
      'uploadDate'
    ]);
  }

  if (bgColour === '') res.push([
    true, 
    'Please add a background colour.', 
    'bgColour'
  ]);
  if (fgColour === '') res.push([
    true, 
    'Please add a foreground colour.', 
    'fgColour'
  ]);
  if (!validateColour(bgColour)) res.push([
    true, 
    'The background colour is invalid.', 
    'bgColour'
  ]);
  if (!validateColour(fgColour)) res.push([
    true, 
    'The foreground colour is invalid.', 
    'fgColour'
  ]);

  if (singers === '') {
    res.push([
      true, 
      'You haven\'t listed any singers.', 
      'singers'
    ]);
    recommendToAutoloadCategories = true;
  }
  if (singers.match(/\[\[[^\]]*\]\]/gm) === null && singers.match(/\{\{[Ss]inger\|[^\}]*\}\}/gm) === null) {
    res.push([
      true, 
      'You need to list at least one singer in markup, e.g. [[Kagamine Rin]].', 
      'singers'
    ]);
    recommendToAutoloadCategories = true;
  }
  if (producers === '') {
    res.push([
      true, 
      'You haven\'t listed any producers. For well-known producers, it is recommended that the producer\'s name is listed in markup, e.g. [[wowaka]], before you generate the song page.', 
      'producers'
    ]);
    recommendToAutoloadCategories = true;
  } else {
    if (producers.match(/\[\[[^\]]*\]\]/gm) === null) {
      res.push([
        false, 
        'If the producer already has a page on VOCALOID Lyrics wiki, then you should add the name of that producer in markup, e.g. "[[wowaka]] (music)" or "[[nagimiso]] (illustration)". Clicking the "Autoload Categories" button again in this case will automatically generate the category for that producer.', 
        'producers'
      ]);
      recommendToAutoloadCategories = true;
    }
  }
  if (categories.length === 0) {
    res.push([
      false, 
      'Did you forget to add categories?', 
      'categoriesRaw'
    ]);
    recommendToAutoloadCategories = true;
  }

  if (!isUnavailable && !isAlbumOnly && playLinks.length === 0) {
    res.push([
      true, 
      'No music videos or play links are detected. Please check the \"Song is publically unavailable\" if official releases are no longer available, or check the \"Song is an album-only release\" option if the song is released on albums only', 
      'playLinks'
    ]);
    recommendToAutoloadCategories = true;
  }

  const forgotViewCounts = playLinks.filter(link => (
    link.isOfficiallyAvailable && 
    PV_SERVICE_ABBREVIATIONS.has(link.site)
  )).some(link => link.viewCount === '');
  if (forgotViewCounts) res.push([
    false,
    'Did you forget to add the view counts?',
    'playLinks'
  ]);

  const hasAvid = playLinks.some(link => (
    link.url.match(/^https?:\/\/www\.bilibili\.com\/video\/(av\d+)/) !== null
  ));
  if (hasAvid) res.push([
    false,
    'The Vocaloid Lyrics Wiki recommends attaching Bilibili links in the new BVid format rather than the old avid format.',
    'playLinks'
  ]);

  const hasNoOriginalLyrics = lyrics.every(lyric => lyric.original === '');
  if (hasNoOriginalLyrics) res.push([
    true,
    'Original lyrics column is empty.',
    'lyrics'
  ]);

  const hasRomanization = lyrics.some(lyric => !!lyric.romanized && lyric.romanized !== '');
  if (!skipColumns?.includes(2) && !hasRomanization) res.push([
    true, 
    'Romanized/transliterated lyrics column is empty.', 
    'lyrics'
  ]);

  const hasEnglishTranslation = !skipColumns?.includes(3) && lyrics.some(lyric => !!lyric.english && lyric.english !== '');
  if (hasEnglishTranslation && translator === '' && !isOfficialTranslation) res.push([
    false, 
    'A translation exists, but the translator is uncredited. Is it made by an anonymous contributor?', 
    'translator'
  ]);

  return { errors: res, recommendToAutoloadCategories };
}

export function generateSongPage(input: ProcessedInput): string {
  
  let { 
    data: {
      aiCwState, aiWarningText1, aiWarningText2, cwState, cwText, hasEpilepsyWarning, 
      origTitle, altChTitle, altChIsTraditional, romTitle, engTitle, titleIsOfficiallyTranslated,
      bgColour, fgColour, uploadDate,
      singers, producers, description, languages, isoLangCode, isUnavailable, isAlbumOnly,
      translator, isOfficialTranslation, 
      categories
    }, 
    langOptions: { headersText, skipColumns }, 
    playLinks, extLinks, lyrics 
  } = input;
  
  let displayTitleTemplate: string = '';
  let sortTemplate: string = '';
  let unavailableTemplate: string = '';
  let cwTemplates: string = '';
  let titlesSegment: string = '';
  let dateSegment: string = '';
  let lyricsSegment: string = '';
  let songLinksSegment: string = '';
  let viewCountsSegment: string = '';
  let languageSegment: string = languages.join(';');
  let officialLinksWikitext: string = '';
  let unofficialLinksWikitext: string = '';
  let extLinksSegment: string = '';

  const needsRomanization = !skipColumns?.includes(2);
  const needsEnglishTranslation = !skipColumns?.includes(3);

  if (needsRomanization && romTitle !== '') {
    sortTemplate = '{{sort';
    let trySortkey = detonePinyin(romTitle);
    if (trySortkey.replace(/[ -~]/g, "") !== "") sortTemplate += `|${trySortkey}`;
    sortTemplate += '}}';
  }

  cwTemplates = hasEpilepsyWarning ? '{{Epilepsy}}' : ''; 
  cwTemplates += (
    cwState === ENUM_CW_STATES.questionable ? `{{Questionable${cwText === '' ? '' : `|${cwText}`}}}` : 
    cwState === ENUM_CW_STATES.explicit ? `{{Explicit${cwText === '' ? '' : `|${cwText}`}}}` : 
    ''
  );
  if (aiCwState !== ENUM_AI_WARNING_TYPE.none) {
    cwTemplates += `{{AIusage|${aiWarningText1}|${aiWarningText2}${aiCwState === ENUM_AI_WARNING_TYPE.suspected ? '|unverified=1' : ''}}}`;
  }

  // const hasOfficiallyAvailablePlayLinks = playLinks.some(link => link.isOfficiallyAvailable);
  if (isUnavailable) unavailableTemplate = '{{Unavailable}}';

  if (origTitle.match(/^[a-z]/) !== null) displayTitleTemplate = '{{Lowercase}}';
  if (origTitle.match(/[_#]/g) !== null) displayTitleTemplate = `{{DISPLAYTITLE:${origTitle}${
    romTitle === '' ? '' : ` (${romTitle})`
  }}}`;

  titlesSegment = `"'''${origTitle}'''"`;
  if (altChTitle !== '') titlesSegment += `<br />${altChIsTraditional ? 'Traditional' : 'Simplified'} Chinese: ${altChTitle}`;
  if (needsRomanization && romTitle !== '')
    titlesSegment += `<br />${headersText[1]}: ${romTitle}`;
  if (needsEnglishTranslation && engTitle !== '')
    titlesSegment += `<br />${titleIsOfficiallyTranslated ? 'Official ' : ''}English: ${engTitle}`;

  if (uploadDate !== null) {
    dateSegment = `{{Date|${
      uploadDate.getUTCFullYear()
    }|${
      MONTHS[uploadDate.getUTCMonth()]
    }|${
      uploadDate.getUTCDate()
    }}}`;
  }
  
  if (playLinks.length === 0) songLinksSegment = 'N/A'
  else songLinksSegment = playLinks.map((playLink) => playLink.getWikitext()).join(' ');
  const viewCounts = playLinks
    .filter((playLink) => (
      !playLink.isReprint &&
      PV_SERVICE_ABBREVIATIONS.has(playLink.site)
    ))
    .map((playLink) => ({ 
      vc: playLink.getFormattedViewCount(), 
      // @ts-ignore
      abbr: PV_SERVICE_ABBREVIATIONS.get(playLink.site) 
    }));
  if (viewCounts.length > 1) {
    viewCountsSegment = viewCounts.map(el => `${el.vc} (${el.abbr})`).join(', ');
  } else {
    viewCountsSegment = viewCounts.map(el => el.vc).join(', ');
  }
  if (viewCountsSegment === '') viewCountsSegment = 'N/A';

  lyricsSegment = generateLyricsTable(lyrics, { 
    langOptions: { headersText, skipColumns }, 
    isoLangCode,
    translator, isOfficialTranslation, bgColour, fgColour 
  });

  unofficialLinksWikitext = extLinks
    .filter(link => !link.isOfficial)
    .map(el => '* ' + el.getWikitext())
    .join('\n');
  officialLinksWikitext = extLinks
    .filter(link => link.isOfficial)
    .map(el => '* ' + el.getWikitext())
    .join('\n');
  if (unofficialLinksWikitext !== '' || officialLinksWikitext !== '') {
    extLinksSegment = '==External Links==\n';
    extLinksSegment += officialLinksWikitext;
    extLinksSegment += officialLinksWikitext === '' ? '' : '\n';
    extLinksSegment += unofficialLinksWikitext === '' ? '' : `===Unofficial===\n${unofficialLinksWikitext}\n\n`;
  }

  return (
`${displayTitleTemplate}${sortTemplate}${unavailableTemplate}${cwTemplates}
{{Infobox Song
|songtitle = ${titlesSegment}
|color = ${bgColour}; color:${fgColour}
|original upload date = ${dateSegment}
|singer = ${singers}
|producer = ${producers}
|#views = ${viewCountsSegment}
|link = ${songLinksSegment}${isAlbumOnly ? '\n|album-only = 1' : ''}${description ? `\n|description = ${description}` : ''}
|language = ${languageSegment}
}}

==Lyrics==
${lyricsSegment}

${
  extLinksSegment
}${
  categories.map(cat => `[[Category:${cat}]]`).join('\n')
}`.trim()
  )

}