import { AppDataSource } from "../components/DatabaseProvider";

import { CONST_WIKI_DOMAIN, CONST_RECOGNIZED_LINKS } from "../constants/linkDomains";
import { CONST_LANGUAGES } from "../constants/languages";

import {
  ArtistCategory, ArtistRole, ArtistType, VocalSynthEngines,
  PvService, PvType, 
  WebLinkCategory, 
  AlbumType,
  VdbSystemLanguages,
  schemaFetchedSongPageJson, schemaFetchedAlbumPageJson, schemaFetchedArtistPageJson,
  schemaFetchedDiscography
} from "./fetch-schemas";

const origin = 'ccxtwf.github.io';

interface parsedSongPageInfo {
  formData: {
    languageIds: number[]
    origTitle: string
    romTitle: string
    engTitle: string
    uploadDate: string
    singers: string
    engines: string[]
    producers: string,
    imageProps: { 
      src: string
      alt: string
      href?: string
      target?: "_blank"
      rel?:"noopener noreferrer"
      onLoad?: (e: Event) => void
      onError?: (e: Event) => void 
    }[]
  }
  playLinksData: (string | boolean)[][]
  extLinksData: (string | boolean)[][]
}
interface parsedAlbumPageInfo {
  formData: {
    origTitle: string
    romTitle: string
    engTitle: string
    label: string
    description: string
    engines: string[]
    vdbAlbumId: string
    vocaWikiPage: string
    imageSrc: string | null
  }
  tracklistData: (string | number)[][]
  extLinksData: (string | boolean)[][]
}
interface parsedProducerPageInfo {
  formData: {
    prodCategory: string
    affiliations: string
    label: string
    description: string
    imageSrc: string | null
  }
  extLinksData: (string | boolean)[][]
}
interface discography {
  songs: string[][]
  albums: string[][]
}

function commaList(list: string[]): string {
  let res = '';
  if (list.length <= 1) {
    res += list.join('');
  } else {
    res += list.slice(0, -1).join(', ') + ' and ' + list.at(-1);
  }
  return res;
}

function getVdbPageId(url: string, mode: 'S' | 'Ar' | 'Al'): string | null {
  const rxVdb = new RegExp(`^https?:\\/\\/vocadb\\.net\\/${mode}\\/(\\d+)`);
  const tryMatch = rxVdb.exec(url);
  if (tryMatch === null) return null;
  return tryMatch[1];
}

function queryVocalist(vdbId: number, fallbackName: string): { 
  wikitext: string, base: string, engine: string, isSuccess: boolean
} {
  
  let wikitext: string = fallbackName;
  let base: string = fallbackName;
  let engine: string = '';
  let isSuccess: boolean = false;  

  const rawQueryResults = AppDataSource.exec(
    `SELECT "s"."basevb_name", "s"."wikicat_name", "e"."name"  
    FROM synths "s"
    LEFT JOIN engines "e" ON "s".engine_id = "e".id 
    WHERE "s".vdb_id = ${vdbId};`
  );
  
  if (rawQueryResults.length > 0) {
    // @ts-ignore
    const [baseName, wikiCat, qEngine] = rawQueryResults[0].values[0];
    if (baseName === wikiCat) {
      wikitext = `[[${wikiCat}]]`;
    } else {
      wikitext = `[[${wikiCat}|${baseName}]]`;
    }
    base = baseName?.toString() || '';
    engine = qEngine?.toString() || '';
    isSuccess = true;
  }
  return { wikitext, base, engine, isSuccess }
}

const dictConvertPvServiceName = {
  [PvService.yt]: 'YouTube',
  [PvService.nnd]: 'Niconico',
  [PvService.bb]: 'bilibili',
  [PvService.pp]: 'piapro',
  [PvService.sc]: 'SoundCloud',
  [PvService.bc]: 'Bandcamp',
  [PvService.vm]: 'Vimeo'
}

// async function _checkIfYtThumbnailIsValid(watchId: string): Promise<string> {
//   const tryYtImgs = [
//     'maxresdefault.jpg',
//     'hqdefault.jpg',
//     'default.jpg'
//   ];
//   if (watchId === '') return '';
//   for (let tryYtImg of tryYtImgs) {
//     // Use Vite proxy to make fetch API requests to YT Image host
//     let imgUrl: string = `/yt-image-host/vi/${watchId}/${tryYtImg}`;
//     try {
//       const res = await fetch(imgUrl, { method: 'HEAD', headers: { 'Accept': '*/*' } });
//       if (res.ok) {
//         return imgUrl;
//       }
//     } catch (err) {
//       return '';
//     }
//   }
//   return '';
// }

export async function fetchDataFromVocaDbForSongPage(url: string): Promise<parsedSongPageInfo> {
  try {
    const vdbPageId = getVdbPageId(url, 'S');
    if (vdbPageId === null) throw new Error('VocaDB page ID is empty or invalid!');
    let res = await fetch(
      `https://vocadb.net/api/songs/${vdbPageId}` + 
      `?fields=Artists,Names,PVs,WebLinks,CultureCodes&lang=English&origin=${origin}`
    );
    const json: schemaFetchedSongPageJson = await res.json();
    const languageIds = (json.cultureCodes || [])
      .map((code) => (
        CONST_LANGUAGES.findIndex(el => el.code === code)
      ))
      .filter(el => el > -1);
    const origTitle = json.defaultName || '';
    const romTitle = (json.names || []).find(el => {
      return el.language === VdbSystemLanguages.rom
    })?.value || '';
    const engTitle = (json.names || []).find(el => {
      return el.language === VdbSystemLanguages.eng
    })?.value || '';
    const uploadDate = (json.publishDate || '').replace(/^(\d{4}-\d{2}-\d{2}).*$/, '$1');

    const imageProps: {
      src: string
      alt: string
      href?: string
      target?: "_blank"
      rel?:"noopener noreferrer"
      onLoad?: (e: Event) => void
      onError?: (e: Event) => void
    }[] = [];
    const mainSingers: string[] = [];
    const minorSingers: string[] = [];
    const engines: Set<string> = new Set();
    const circles: string[] = [];
    const producers: { name: string, role: string }[] = [];
    const playLinks: (string | boolean)[][] = [];
    const extLinks: (string | boolean)[][] = [
      [`https://vocadb.net/S/${vdbPageId}`, 'VocaDB', false]
    ];

    const dictConvertArtistRole = {
      [ArtistRole.default]: 'music, lyrics',
      [ArtistRole.composer]: 'music',
      [ArtistRole.lyricist]: 'lyrics',
      [ArtistRole.arranger]: 'arrangement',
      [ArtistRole.mixer]: 'mix',
      [ArtistRole.mastering]: 'mastering',
      [ArtistRole.voicemanipulator]: 'tuning',
      [ArtistRole.instrumentalist]: 'instruments',
      [ArtistRole.illustrator]: 'illustration',
      [ArtistRole.animator]: 'PV',
      [ArtistRole.encoder]: 'encoding',
      [ArtistRole.vocalist]: 'vocalist',
      [ArtistRole.chorus]: 'chorus',
      [ArtistRole.other]: 'other',
      [ArtistRole.distributor]: 'publisher',
      [ArtistRole.publisher]: 'publisher'
    };
    const orderRolePriority = [
      'music', 'lyrics', 'arrangement', 'mix', 'mastering', 'tuning',
      'instruments', 'illustration', 'PV', 'encoding', 
      'vocalist', 'chorus', 'publisher', 'other' 
    ];
    
    for (let artist of (json.artists || [])) {
      let addName: string = artist.name || '';
      // Is singer
      if (artist.categories === ArtistCategory.vocalist) {
        if (artist.artist && (Object.values(VocalSynthEngines) as string[]).includes((artist.artist?.artistType as string))) {
          // Try searching for the vocalist in the SQLite db
          const { wikitext, engine, isSuccess } = queryVocalist(artist.artist.id, addName);
          if (isSuccess) {
            addName = wikitext;
            engines.add(engine);
          }
        }
        if (artist.isSupport) {
          minorSingers.push(addName);
        } else {
          mainSingers.push(addName);
        }
      // Is circle
      } else if (artist.categories === ArtistCategory.circle || artist.categories === ArtistCategory.label) {
        circles.push(addName);
      // Is producer
      } else {
        let roles = artist.roles.split(', ');
        // @ts-ignore
        roles = roles.map(el => dictConvertArtistRole[el] || 'other');
        roles = [...new Set<string>(roles)];
        roles.sort((a, b) => {
          let aIdx = orderRolePriority.findIndex(val => val === a);
          let bIdx = orderRolePriority.findIndex(val => val === b);
          return aIdx - bIdx;
        })
        producers.push({ name: addName, role: roles.join(', ') });
      }
    }

    let producersString: string = '';
    if (circles.length > 0) producersString += `'''${circles.join(', ')}''':\n`;
    producersString += producers.map(el => (
      `${el.name} (${el.role})`
    )).join('\n');
    let singersString: string = '';    
    
    singersString += commaList(mainSingers);
    if (minorSingers.length > 0) singersString += `\n<small>${commaList(minorSingers)}</small>`;
    
    for (let pv of (json.pvs || [])) {
      const pvService = dictConvertPvServiceName[pv.service] || null;
      let pvUrl = '';
      if (pv.service === PvService.yt) pvUrl = `https://www.youtube.com/watch?v=${pv.pvId || ''}`
      else pvUrl = pv.url || '';
      const isDeleted = pv.disabled;
      const isReprint = pv.pvType !== PvType.original;
      if (pvService === null) {
        extLinks.push([
          pvUrl, pv.service, !isReprint
        ]);
      } else {
        playLinks.push([
          pvService, pvUrl, isReprint, false, isDeleted, ''
        ]);
      }
      if (!isReprint) {
        switch (pv.service) {
          case PvService.yt:
            // const tryMatch = await _checkIfYtThumbnailIsValid(pv.pvId || '');
            // if (tryMatch !== '') {
            //   imageProps.push({ src: tryMatch, alt: 'YouTube thumbnail' });
            // }
            imageProps.push({
              src: `https://i.ytimg.com/vi/${pv.pvId}/maxresdefault.jpg`,
              alt: 'YouTube thumbnail',
              onLoad: (e: Event) => {
                // @ts-ignore
                if (e.target.naturalHeight >= 200) {
                  // @ts-ignore
                  e.onload = null;
                  return;
                }
                // @ts-ignore
                const curSrc = e.target.src || '';
                if (curSrc.endsWith('maxresdefault.jpg')) {
                  // @ts-ignore
                  e.target.src = `https://i.ytimg.com/vi/${pv.pvId}/hqdefault.jpg`;
                } else if (curSrc.endsWith('hqdefault.jpg')) {
                  // @ts-ignore
                  e.target.src = pv.thumbUrl || '';
                  // @ts-ignore
                  e.onload = null;
                }
              }
            })
            break;
          case PvService.bb:
            if (!pv.thumbUrl || pv.thumbUrl === '') break;
            // Use Vite proxy to make fetch API requests to bilibili Image host
            // STATUS: Proxy-ing does not work on a static site hoster
            // const res = await fetch(
            //   pv.thumbUrl.replace(/^https?:\/\/i[0-2]\.hdslb\.com/, '/bb-image-host'),
            //   { headers: { 'Accept': '*/*' } }
            // );
            // if (!res.ok) break;
            // // const contentType = res.headers.get('Content-Type') || '';
            // const imgBuff = await res.blob();
            // imageProps.push(
            //   { src: URL.createObjectURL(imgBuff), alt: 'bilibili thumbnail' }
            // );
            imageProps.push(
              { 
                src: `${import.meta.env.BASE_URL}bilibili_logo.jpeg`, 
                alt: 'Click to get bilibili thumbnail',
                href: pv.thumbUrl,
                target: "_blank", rel:"noopener noreferrer"
              }
            )
            break;
          case PvService.nnd:
            if (pv.thumbUrl && pv.thumbUrl !== '') imageProps.push({
              src: pv.thumbUrl + '.L',
              alt: 'Niconico thumbnail',
              onError: (e: Event) => {
                // @ts-ignore
                e.target.src = pv.thumbUrl;
                // @ts-ignore
                e.onerror = null;
              }
            });
            break;
          default:
            if (pv.thumbUrl && pv.thumbUrl !== '') imageProps.push({
              src: pv.thumbUrl, alt: `${pv.service} thumbnail`
            });
            break;
        }
      }
    }

    for (let link of (json.webLinks || [])) {
      const url = link.url || '';
      let description = link.description || '';
      if (description === 'MikuWiki') description = 'Hatsune Miku Wiki';
      const isOfficial = link.category === WebLinkCategory.official || link.category === WebLinkCategory.commercial;
      extLinks.push([ url, description, isOfficial ]);
    }

    const formData = {
      languageIds,
      origTitle, romTitle, engTitle,
      uploadDate,
      singers: singersString,
      engines: [...engines],
      producers: producersString,
      imageProps
    }
    return {
      formData, 
      playLinksData: playLinks,
      extLinksData: extLinks
    }

  } catch(err) {
    throw err;
  }
}

export async function fetchDataFromVocaDbForAlbumPage(url: string): Promise<parsedAlbumPageInfo> {
  try {
    const vdbPageId = getVdbPageId(url, 'Al');
    if (vdbPageId === null) throw new Error('VocaDB page ID is empty or invalid!');
    let res = await fetch(
      `https://vocadb.net/api/albums/${vdbPageId}` + 
      `?fields=MainPicture,Names,PVs,Artists,Tracks,WebLinks&` + 
      `songfields=Artists&lang=English&origin=${origin}`
    );
    let json: schemaFetchedAlbumPageJson = await res.json();

    const origTitle = json.defaultName || '';
    const romTitle = (json.names || []).find(el => {
      return el.language === 'Romaji'
    })?.value || '';
    const engTitle = (json.names || []).find(el => {
      return el.language === 'English'
    })?.value || '';

    let imageSrc: string | null = json.mainPicture.urlOriginal;

    const circles: string[] = [];
    const mainProducers: string[] = [];
    const labels: string[] = [];
    const engines: Set<string> = new Set();
    let strLabel: string = '';
    let strDescription: string = '';
    let vocaWikiPage: string = '';

    for (let artist of (json.artists || [])) {
      if (artist.categories === ArtistCategory.vocalist) continue;
      switch (artist.categories) {
        case ArtistCategory.label:
          labels.push(artist.name || '');
          break;
        case ArtistCategory.circle:
          circles.push(artist.name || '');
          break;
        case ArtistCategory.producer:
          if (!artist.isSupport) mainProducers.push(artist.name || '');
          break;
        default:
          break;
      }
    }
    strLabel = labels.length === 0 ? '' : commaList(labels);
    if (json.discType === AlbumType.compilation) {
      strDescription = `a compilation album${
        circles.length === 0 ? '' :
        ', by the circle ' + commaList(circles)
      }`;
    } else if (mainProducers.length > 3) {
      strDescription = `an album by ${
        circles.length === 0 ? 'several producers' :
        commaList(circles)
      }`;
    } else {
      strDescription = `an album by ${commaList(mainProducers)}`;
      if (circles.length > 0) {
        strDescription += `, under the circle ${commaList(circles)}`;
      }
    }

    const trackList: (string | number)[][] = [];
    const extLinks: (string | boolean)[][] = [];
    const addedMarkupSingers: Map<number, string> = new Map();

    for (let track of (json.tracks || [])) {
      const { discNumber, trackNumber, song: { artists, defaultName: songTitle } = {} } = track;
      const songProducers: string[] = [];
      const songSingers: string[] = [];
      for (let artist of (artists || [])) {
        if (artist.isSupport) continue;
        if (artist.categories === ArtistCategory.vocalist) {
          const id = artist.artist?.id || null;
          if (id === null) {
            songSingers.push(artist?.name || '');
          } else if (addedMarkupSingers.has(id)) {
            songSingers.push(addedMarkupSingers.get(id) || '');
          } else {
            // Try searching for the vocalist in the SQLite db
            const { wikitext, base, engine, isSuccess } = queryVocalist(id, artist.artist?.name || '');
            if (isSuccess) {
              songSingers.push(wikitext);
              engines.add(engine);
              addedMarkupSingers.set(id, base);
            } else {
              songSingers.push(wikitext);
            }
          }
        } else {
          const roles = artist.effectiveRoles.split(', ');
          const isMainProducer = roles.some((role) => (
            role === ArtistRole.default || role === ArtistRole.composer
          ));
          if (isMainProducer) songProducers.push(artist?.name || '');
        }
      }
      trackList.push([
        discNumber, trackNumber, 
        songTitle || '', 
        commaList(songProducers), 
        commaList(songSingers)
      ]);
    }

    for (let link of (json.pvs || [])) {
      let url = '';
      if (link.service === PvService.yt) url = `https://www.youtube.com/watch?v=${link.pvId || ''}`
      else url = link.url || '';
      let description = dictConvertPvServiceName[link.service] || null;
      description = 'Album crossfade' + (description === null ? '' : ` - ${description}`);
      extLinks.push([ url, description, true ]);
    }
    for (let link of (json.webLinks || [])) {
      const url = link.url || '';
      let description = link.description || '';
      const tryMatchVocawiki = /^https?:\/\/vocaloid\.fandom\.com\/wiki\/([^\?]+)/.exec(url);
      if (tryMatchVocawiki !== null) vocaWikiPage = tryMatchVocawiki[1];
      if (description === 'MikuWiki') description = 'Hatsune Miku Wiki';
      const isOfficial = link.category === WebLinkCategory.official || link.category === WebLinkCategory.commercial;
      extLinks.push([ url, description, isOfficial ]);
    }

    const formData = {
      origTitle, romTitle, engTitle,
      label: strLabel, 
      description: strDescription,
      engines: [...engines],
      vdbAlbumId: vdbPageId, 
      vocaWikiPage,
      imageSrc
    }
    return {
      formData,
      tracklistData: trackList,
      extLinksData: extLinks
    }
  } catch(err) {
    throw err;
  }
}

export async function fetchDataFromVocaDbForProducerPage(url: string): Promise<parsedProducerPageInfo> {
  try {
    const vdbPageId = getVdbPageId(url, 'Ar');
    if (vdbPageId === null) throw new Error('VocaDB page ID is empty or invalid!');
    let res = await fetch(
      `https://vocadb.net/api/artists/${vdbPageId}` + 
      `?fields=AdditionalNames,MainPicture,Description,ArtistLinks,WebLinks&lang=English&origin=${origin}`
    );
    let json: schemaFetchedArtistPageJson = await res.json();

    const prodCategory = json.name || '';
    const description = `'''${prodCategory}''' is a vocal synth producer.`;
    const labels: string[] = [];
    const affiliations: string[] = [];

    let imageSrc: string | null = json.mainPicture.urlOriginal;

    const extLinks: (string | boolean)[][] = [];

    for (let artistLink of (json.artistLinks || [])) {
      if (artistLink.artist.artistType === ArtistType.label) {
        labels.push(artistLink.artist.name || '');
      } else {
        affiliations.push(artistLink.artist.name || '');
      }
    }

    extLinks.push([
      `https://vocadb.net/Ar/${vdbPageId}`, 'VocaDB', false, false, false
    ])
    for (let link of (json.webLinks || [])) {
      const url = link.url || '';
      let description = link.description || '';
      if (description === 'MikuWiki') description = 'Hatsune Miku Wiki';
      const isOfficial = link.category === WebLinkCategory.official || link.category === WebLinkCategory.commercial;
      const isMedia = isOfficial && !!CONST_RECOGNIZED_LINKS.filter(el => el.isMedia).find(el => el.re.exec(url));
      const isInactive = link.disabled;
      extLinks.push([ url, description, isOfficial, isMedia, isInactive ]);
    }

    const formData = {
      prodCategory,
      affiliations: affiliations.join('\n'),
      label: labels.join('\n'),
      description,
      imageSrc
    }
    return {
      formData,
      extLinksData: extLinks
    }
  } catch(err) {
    throw err;
  }
}

export async function fetchDiscographyFromVlw(prodcat: string): Promise<discography> {
  try {
    if (prodcat.trim() === '') {
      throw new Error('Producer category cannot be empty');
    }
    let subcats: Set<string> = new Set();
    let songs: Map<string, string> = new Map();
    let albums: string[] = [];

    let cmcontinue: string = '';

    // Get pages in main category
    while (true) {
      
      let res = await fetch(
        `https://${CONST_WIKI_DOMAIN}.fandom.com/api.php?` + 
        `action=query&format=json&list=categorymembers` + 
        `&cmtitle=Category:${encodeURI(prodcat)}_songs_list` +
        `&cmprop=title|sortkeyprefix&cmlimit=500` + 
        `&cmtype=page|subcat` + 
        `&cmsort=sortkey` + 
        `&cmdir=ascending${cmcontinue}&origin=*`
      );
      let json: schemaFetchedDiscography = await res.json();
      
      if (json.error) {
        throw new Error(`Failed fetch: ${json.error.info}`);
      }

      for (let page of json.query.categorymembers) {
        const title: string = decodeURI(page.title);
        const sortkey: string = (page.sortkeyprefix || '') === '' ? title : page.sortkeyprefix || ''; 
        if (page.ns === 0) {
          songs.set(sortkey, title);
        } else {
          subcats.add(title);
        }
      }

      if (json.continue) {
        cmcontinue = json.continue.cmcontinue;
      } else {
        break;
      }
    }

    if (songs.size === 0 && subcats.size === 0) {
      throw new Error('No pages found - please recheck the category name');
    }

    const getPagesInSubcategory = async (subcat: string): Promise<{ title: string, sortkey: string }[]> => {
      const arr: { title: string, sortkey: string }[] = [];
      while (true) {
        let res = await fetch(
          `https://${CONST_WIKI_DOMAIN}.fandom.com/api.php?` + 
          `action=query&format=json&list=categorymembers` + 
          `&cmtitle=${encodeURI(subcat)}` +
          `&cmprop=title|sortkeyprefix&cmlimit=500` + 
          `&cmtype=page|subcat` + 
          `&cmsort=sortkey` + 
          `&cmdir=ascending${cmcontinue}&origin=*`
        );
        let json: schemaFetchedDiscography = await res.json();

        if (json.error) {
          throw new Error(`Failed fetch: ${json.error.info}`);
        }

        arr.push(...json.query.categorymembers.map(el => {
          const title = decodeURI(el.title);
          const sortkey = (el.sortkeyprefix || '') === '' ? title : el.sortkeyprefix || ''; 
          return { title, sortkey };
        }));

        if (json.continue) {
          cmcontinue = '&cmcontinue=' + json.continue.cmcontinue;
        } else {
          break;
        }
      }
      return arr;
    }

    let albumSubcat: string | null = [...subcats].find(el => el.endsWith('/Albums')) || null;
    if (albumSubcat !== null) {
      subcats.delete(albumSubcat);
      const arrAlbums = await getPagesInSubcategory(albumSubcat);
      albums.push(...arrAlbums.map(el => el.title));
    }

    const arrFetched = await Promise.all([...subcats].map(subcat => getPagesInSubcategory(subcat))); 
    for (let arr of arrFetched) {
      for (let { sortkey, title } of arr) {
        songs.set(sortkey, title);
      }
    }

    let sortedSongs: string[][] = Array.from(songs);
    sortedSongs.sort((a, b) => {
      const v = a[0].toLowerCase();
      const w = b[0].toLowerCase();
      return (v > w) ? 1 : (v < w) ? -1 : 0;
    });
    
    return {
      songs: sortedSongs.map(el => [el[1], '']),
      albums: albums.map(el => [el, ''])
    }

  } catch(err) {
    throw err;
  }
}