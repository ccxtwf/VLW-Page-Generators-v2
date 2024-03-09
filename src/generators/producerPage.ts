import { producerPageFormInterface, producerRoles } from "../types";
import { DiscogItem, ExternalLink } from "./classes";
import { CONST_LANGUAGES } from "../constants/languages";

interface RawInput {
  formData: producerPageFormInterface
  producerRoles: producerRoles
  songListData: any[][]
  albumListData: any[][]
  extLinksData: any[][]
}
interface ProcessedInput {
  formData: {
    prodCategory: string
    prodAliases: string
    prodRoles: producerRoles
    affiliations: string
    label: string
    languageIds: number[]
    engines: string[]
    description: string
  }
  songList: DiscogItem[]
  albumList: DiscogItem[]
  extLinks: ExternalLink[]
}

export function parseInput(
  { formData, producerRoles, songListData, albumListData, extLinksData }: RawInput
): ProcessedInput {
  let {
    prodCategory, prodAliases, 
    affiliations, label, 
    description
  } = formData;
  prodCategory = prodCategory.trim();
  prodAliases = prodAliases.trim();
  affiliations = affiliations.trim();
  affiliations = affiliations === '' ? '' : 
    affiliations.split(/\s*\n\s*/g).map(el => `* ${el}`).join('\n');
  label = label.trim();
  label = label === '' ? '' : 
    label.split(/\s*\n\s*/g).map(el => `* ${el}`).join('\n');
  description = description.trim();

  const songList: DiscogItem[] = songListData
    .map(arr => new DiscogItem(arr[0], arr[1]))
    .filter(el => el.page !== '');
  const albumList: DiscogItem[] = albumListData
    .map(arr => new DiscogItem(arr[0], arr[1], true))
    .filter(el => el.page !== '');
  const extLinks: ExternalLink[] = extLinksData
    .map(arr => new ExternalLink(arr[0], arr[1], arr[2], arr[3], arr[4]))
    .filter(el => el.url !== '');

  return {
    formData: {
      ...formData,
      prodCategory, prodAliases, 
      prodRoles: producerRoles,
      affiliations, label, 
      description
    },
    songList, albumList, extLinks
  }
}

export function validate(input: ProcessedInput): {
  errors: ( boolean | string )[][],
  recommendToAutoloadCategories: boolean
} {
  let {
    formData: {
      prodCategory, prodRoles,
      languageIds, engines,
      description
    },
    songList, extLinks
  } = input;

  const res = [];

  if (prodCategory === '') {
    res.push([
      true,
      'You must add the producer category page name for the producer. (This will be used as the parameter of {{ProdLinks}})',
      'prodCategory'
    ]);
  }

  if (languageIds.length === 0) {
    res.push([
      true,
      'You haven\'t chosen a language.',
      'languageIds'
    ]);
  }

  if (engines.length === 0) {
    res.push([
      true,
      'Please list at least one vocal synth engine, e.g. VOCALOID. Choose \"Other/Unlisted\" if not on the list.',
      'engines'
    ]);
  }
  
  if (Object.values(prodRoles).every(el => !el)) {
    res.push([
      true,
      'You must specify at least one role for the producer, e.g. Do they compose their own songs? Are they an illustrator/PV maker for other producers?',
      'producerRoles'
    ]);
  }

  if (description === '') {
    res.push([
      true,
      'You must add a description for the producer. Even a short description, e.g. \"[PRODUCER] is a VOCALOID producer.\", will do.',
      'description'
    ]);
  }

  if (extLinks.length === 0) {
    res.push([
      true,
      'You must add at least one external link.',
      'extLinks'
    ]);
  } else {
    if (extLinks.every(link => !link.isOfficial)) {
      res.push([
        true,
        'You must add at least one official external link, e.g. the producer\'s social media.',
        'extLinks'
      ]);
    }
  }

  if (songList.length === 0) {
    res.push([
      true,
      'No song page has been added.',
      'pwtDiscog'
    ]);
  }

  return { errors: res, recommendToAutoloadCategories: false }
}

function generateUnofficialProdLinks(links: ExternalLink[]): string {
  const rxCommonLinks = {
    MIKUWIKI: /^https?:\/\/(?:w|www5)\.atwiki\.jp\/hmiku\/pages\/(\d*)\.html/,
    UTAUDB: /^https?:\/\/w\.atwiki\.jp\/utauuuta\/pages\/(\d*)\.html/,
    NICOPEDIA: /^https?:\/\/dic\.nicovideo\.jp\/id\/(.*)$/,
    VOCADB: /^https?:\/\/vocadb\.net\/Ar\/(\d*)/,
    NICOTAG: /^https?:\/\/www\.nicovideo\.jp\/tag\/(.*)$/,
    MGP: /^https?:\/\/zh\.moegirl\.org\.cn\/(.*)$/
  };
  const detectedDomains: any = {};
  let wikitextForUndetectedDomains: string = '';
  for (let link of links) {
    let domainIsDetected: boolean = false;
    for (let [key, rx] of Object.entries(rxCommonLinks)) {
      const tryMatch = rx.exec(link.url);
      if (tryMatch === null) {
        continue;
      } else {
        detectedDomains[key] = tryMatch[1];
        domainIsDetected = true;
        break;
      }
    }
    if (!domainIsDetected) {
      wikitextForUndetectedDomains += `* ${link.getWikitext()}\n`;
    }
  }
  let wikitextForDetectedDomains = `
{{links |p=yes
  |atmiku = ${detectedDomains.MIKUWIKI || ''}
  |atutau = ${detectedDomains.UTAUDB || ''}
  |nico   = ${detectedDomains.NICOPEDIA || ''}
  |vocadb = ${detectedDomains.VOCADB || ''}
  |tag    = ${detectedDomains.NICOTAG || ''}
  |mgp    = ${detectedDomains.MGP || ''}
}}`.trim();

  return `${wikitextForDetectedDomains}\n${wikitextForUndetectedDomains}`;
}

export function generateProducerPage(input: ProcessedInput): string {
  const {
    formData: {
      prodCategory, prodAliases, prodRoles,
      affiliations, label, 
      languageIds, engines,
      description
    },
    songList, albumList, extLinks
  } = input;

  let extLinksSegment: string = '';
  let categories: string[] = ['Producers'];

  let officialLinks: string = extLinks
    .filter(link => link.isOfficial && !link.isMedia)
    .map(link => (
      `* ${link.description}: [${link.url} ]\n`
    ))
    .join('');
  let mediaLinks: string = extLinks
    .filter(link => link.isOfficial && link.isMedia)
    .map(link => `* ${link.getWikitext()}\n`)
    .join('');
  let unofficialLinks: string = generateUnofficialProdLinks(
    extLinks.filter(link => !link.isOfficial)
  );
  
  extLinksSegment += `==External links==\n`;
  extLinksSegment += officialLinks === '' ? '' : officialLinks + '\n';
  extLinksSegment += mediaLinks === '' ? '' : `===Media===\n${mediaLinks}\n`;
  extLinksSegment += unofficialLinks === '' ? '' : `===Unofficial===\n${unofficialLinks}`;

  for (const [role, isChecked] of Object.entries(prodRoles)) {
    if (isChecked) {
      categories.push(
        `${role.replace(/^\w/, (firstLetter) => firstLetter.toUpperCase())}s`
      );
    }
  }
  for (let id of languageIds) {
    let lang: string = CONST_LANGUAGES[id]?.name || '';
    if (lang === 'Mandarin') lang = 'Chinese';
    categories.push(`${lang} original producers`);
  }
  for (let engine of engines) {
    categories.push(`Producers using ${engine}`);
  }

  return (`
<div class="producer-links">
[[File:<PRODUCER PROFILE PICTURE IMAGE FILE>|250px|center]]
==Producer categories==
{{ProdLinks|${prodCategory}}}
${
  label === '' ? '' :
  `==Labels==\n${label}\n`
}${
  affiliations === '' ? '' :
  `==Affiliations==\n${affiliations}\n`
}
${extLinksSegment}</div>

${description}

==Works==${
  prodAliases === '' ? '' : `\n{{pwt alias|${prodAliases}}}`
}
{| class="sortable producer-table"
|- class="vcolor-default"
! {{pwt head}}
${
  songList.map(song => `|-\n| ${song.toTemplate()}\n`).join('')
}|}

${
  albumList.length === 0 ? '' : 
  (`==Discography==\n{| class=\"sortable producer-table\"\n|- class=\"vcolor-default\"\n! {{awt head}}\n` +
  albumList.map(album => `|-\n| ${album.toTemplate()}\n`).join('') + '|}\n')
}
__NOTOC__
${ 
  categories.map(cat => `[[Category:${cat}]]`).join('\n')
}`.trim())
}