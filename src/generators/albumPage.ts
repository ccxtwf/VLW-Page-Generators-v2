import { albumPageFormInterface } from "../types";
import { TrackItem, ExternalLink } from "./classes";
import { validateColour, detonePinyin } from "../utils";

interface RawInput {
  formData: albumPageFormInterface
  tracklistData: any[][]
  extLinksData: any[][]
}
interface ProcessedInput {
  formData: {
    origTitle: string
    romTitle: string
    bgColour: string
    fgColour: string
    label: string
    description: string
    engines: string[]
    vdbAlbumId: string
    vocaWikiPage: string
    categories: string[]
  }
  tracklist: TrackItem[]
  extLinks: ExternalLink[]
}

export function parseInput({ formData, tracklistData, extLinksData }: RawInput): ProcessedInput {
  let {
    origTitle, romTitle,
    bgColour, fgColour,
    label, description,
    vdbAlbumId, vocaWikiPage,
    categoriesRaw
  } = formData;
  origTitle = origTitle.trim();
  romTitle = romTitle.trim();
  bgColour = bgColour.trim();
  fgColour = fgColour.trim();
  label = label.trim();
  description = description.trim();
  vdbAlbumId = vdbAlbumId.trim().replace(/^(\d+)\D*$/, "$1");
  vocaWikiPage = vocaWikiPage.trim();
  let categories: string[] = [];
  categoriesRaw = categoriesRaw.trim();
  if (categoriesRaw !== '') categories = categoriesRaw.split(/[\r\s]*\n+[\r\s]*/);

  const tracklist: TrackItem[] = tracklistData
    .map(arr => new TrackItem(arr[0], arr[1], arr[2], arr[3], arr[4]))
    .filter(el => el.pageTitle !== '');
  const extLinks: ExternalLink[] = extLinksData
    .map(arr => new ExternalLink(arr[0], arr[1], arr[2]))
    .filter(el => el.url !== '');
    
  return {
    formData: {
      ...formData,
      origTitle, romTitle,
      bgColour, fgColour,
      label, description,
      vdbAlbumId, vocaWikiPage, categories
    },
    tracklist, extLinks
  }
}

function detectProducerOrSingerInMarkup(wikitext: string): string[] {
  const res: string[] = [];
  const arrMarkup = wikitext.matchAll(
    /\[\[(?<base>[^\|\n\]]*)\|?(?<cap>(?<=\|)[^\]]*)?\]\]/g
  );
  for (let markup of arrMarkup) {
    let { base = '' } = markup.groups || {};
    if (base === '') continue;
    base = base.trim();
    if (base.match(/^w:c:/i) !== null) {
      continue;
    } else if (base.match(/^:[Cc]ategory:(.*) songs list$/) !== null) {
      base = base.replace(/^:[Cc]ategory:(.*) songs list$/, '$1');
    }
    res.push(base);
  }
  return res;
}

export function autoloadCategories(input: albumPageFormInterface, tracklistData: string[][]): string[] {
  let { description, engines } = input;
  const res: string[] = [];

  const producers: string[] = [];
  const singers: string[] = [];

  let markedUpProducersInDesc: Set<string> = new Set(detectProducerOrSingerInMarkup(description));
  let markedUpProducersInTracklist: Set<string> = new Set();
  let markedUpSingersInTracklist: Set<string> = new Set();
  for (let track of tracklistData) {
    const detectedProducers = detectProducerOrSingerInMarkup(track[3]?.trim() || '');
    const detectedSingers = detectProducerOrSingerInMarkup(track[4]?.trim() || '');
    for (let prod of detectedProducers) {
      markedUpProducersInTracklist.add(prod);
    }
    for (let singer of detectedSingers) {
      markedUpSingersInTracklist.add(singer);
    }
  }
  for (let prod of markedUpProducersInDesc) {
    if (markedUpProducersInTracklist.has(prod)) {
      markedUpProducersInTracklist.delete(prod);
    }
  }
  producers.push(...markedUpProducersInDesc);
  producers.push(...markedUpProducersInTracklist);
  singers.push(...markedUpSingersInTracklist);

  res.push(...engines.map(engine => `Albums featuring ${engine}`));
  res.push(...singers.map(singer => `Albums featuring ${singer}`));
  res.push(...producers.map(producer => `${producer} songs list/Albums`));

  return res;
}

export function validate(input: ProcessedInput): {
  errors: ( boolean | string )[][],
  recommendToAutoloadCategories: boolean
} {
  let {
    formData: {
      origTitle, 
      bgColour, fgColour,
      description, engines,
      vdbAlbumId, 
      categories
    },
    tracklist
  } = input;

  let recommendToAutoloadCategories = false;
  const res = [];

  if (origTitle === '') {
    res.push([
      true, 
      'You haven\'t entered an album name.', 
      'origTitle'
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

  if (description === '') res.push([
    true, 
    'You must add a short description about the album.', 
    'description'
  ]);

  if (vdbAlbumId === '') res.push([
    true, 
    'You must add a numeric page ID for the VocaDB link.', 
    'vdbAlbumId'
  ]);

  if (tracklist.every(track => track.pageTitle === '')) {
    res.push([
      true, 
      'You must add at least one song to the tracklist.', 
      'tracklist'
    ])
  } else {
    if (tracklist.some(track => track.trackNo === '')) {
      res.push([
        true,
        'You must add the track listing number to all tracks.',
        'tracklist'
      ]);
    }
    if (tracklist.some(track => track.discNo !== '' && isNaN(+track.discNo))) {
      res.push([
        true,
        'The disc number must be numeric.',
        'tracklist'
      ]);
    }
    if (tracklist.some(track => track.trackNo !== '' && isNaN(+track.trackNo))) {
      res.push([
        true,
        'The track number must be numeric.',
        'tracklist'
      ]);
    }
    if (tracklist.some(track => track.pageTitle === '')) {
      res.push([
        true,
        'You must add a track name to all tracks.',
        'tracklist'
      ]);
    }
    if (tracklist.some(track => track.singerCredit === '' && track.producerCredit === '')) {
      res.push([
        true,
        'You must add featured producers/singers to all tracks, or specify that the song is an instrumental if there are no singers.',
        'tracklist'
      ]);
    }
  }

  if (engines.length === 0) {
    res.push([
      true, 
      'Please list at least one vocal synth engine, e.g. VOCALOID. Choose "Other/Unlisted" if not on the list.', 
      'engines'
    ]);
    recommendToAutoloadCategories = true;
  }

  if (categories.length === 0) {
    res.push([
      true, 
      'Did you forget to add categories?', 
      'categoriesRaw'
    ]);
    recommendToAutoloadCategories = true;
  }

  return { errors: res, recommendToAutoloadCategories }
}

export function generateAlbumPage(input: ProcessedInput): string {
  let {
    formData: {
      origTitle, romTitle,
      bgColour, fgColour,
      label, description, 
      vdbAlbumId, vocaWikiPage,
      categories
    },
    tracklist, extLinks
  } = input;

  let displayTitleTemplate: string = '';
  let trackListSegment: string = '';
  let officialLinksWikitext: string = '';
  let unofficialLinksWikitext: string = '';
  let extLinksSegment: string = '';
  let sortTemplateSegment: string = '';

  if (origTitle.match(/^[a-z]/) !== null) displayTitleTemplate = '{{Lowercase}}';
  if (origTitle.match(/_/g) !== null) displayTitleTemplate = `{{DISPLAYTITLE:${origTitle}}}`;

  trackListSegment = tracklist.map(track => (
    `|${
      track.discNo == '1' ? '' : track.discNo
    }tr${track.trackNo} = ${track.pageTitle}\n|${
      track.discNo == '1' ? '' : track.discNo
    }tr${track.trackNo}s = ${track.credits}`
  )).join('\n');

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

  if (romTitle !== origTitle && origTitle !== "") {
    sortTemplateSegment = "{{sort-album"
    const plcRom = detonePinyin(romTitle, false);
    if (plcRom.replace(/[ -~]/g, "") !== "") {
      sortTemplateSegment += `|${plcRom}}}`
    }
    else {sortTemplateSegment += "}}"}
  };

  return (
    `
${displayTitleTemplate}{{Album Infobox
|title = ${romTitle === '' ? origTitle : romTitle}
|orgtitle = ${romTitle === '' ? '' : origTitle}
|label = ${label}
|desc = ${description}
|vdb = ${vdbAlbumId}
|vw = ${vocaWikiPage}

|image = 
|color = ${bgColour}; color:${fgColour}
${trackListSegment}
}}

${extLinksSegment}
${sortTemplateSegment}
${
  categories.map(cat => `[[Category:${cat}]]`).join('\n')
}`.trim()
  )
}