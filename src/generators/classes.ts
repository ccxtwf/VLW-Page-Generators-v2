import { IDictionary } from "../types";

export class Lyric {
  customStyle: string;
  original: string;
  romanized?: string;
  english?: string;
  additionalColumns?: string[];

  constructor({hasAdditionalColumns, skipColumns = []}: {hasAdditionalColumns: boolean, skipColumns?: number[] }, ...args: string[]) {
    // const m = (args[0] || '').trim().match(/style\s*=\s*["']\s*([^\n]*?)\s*;*\s*["']/);
    // this.customStyle = m === null ? '' : `${m[1]};`;
    this.customStyle = (args[0] || '').trim();
    this.original = (args[1] || '').trim();
    if (!skipColumns.includes(2)) this.romanized = (args[2] || '').trim();
    if (!skipColumns.includes(3)) this.english = (args[3] || '').trim();
    if (hasAdditionalColumns) {
      this.additionalColumns = [];
      for (let i = 4; i < args.length; i++) {
        if (skipColumns.includes(i)) break;
        this.additionalColumns.push((args[i] || '').trim());
      }
    }
  }

  getTableCellWikitext(contents?: string): string {
    return `|${
      (contents || '')
        .replace(/^-/, "<nowiki>-</nowiki>")
        .replace(/(~{4,})/g, "<nowiki>$1</nowiki>")
    }\n`
  }

  getWikitext(printEmptyEnglishColumn: boolean = false): string {
    let wikitext: string = `|-${this.customStyle === '' ? ' ' : ` style="${this.customStyle}"`}\n`;
    let isLineBreak = (this.original === '' && (this.romanized || '') === '' && (this.english || '') === '');    
    let sharesColumns = (
      (this.romanized === undefined || this.original === this.romanized) &&
      (this.english === undefined || !printEmptyEnglishColumn || this.original === this.english)
    );
    if (this.romanized === undefined && this.english === '') sharesColumns = false;
    if (this.additionalColumns !== undefined) {
      for (let additionalColumn of this.additionalColumns) {
        if (this.original !== additionalColumn) {
          sharesColumns = false;
          break;
        }
      }
    }
    if (isLineBreak) {
      wikitext += '|<br />\n';
    } else if (sharesColumns) {
      wikitext += `| {{shared}} ${this.original}\n`;
    } else {
      wikitext += this.getTableCellWikitext(this.original);
      if (this.romanized !== undefined) wikitext += this.getTableCellWikitext(this.romanized);
      if (printEmptyEnglishColumn) wikitext += this.getTableCellWikitext(this.english);
      if (this.additionalColumns) {
        for (let additionalColumn of this.additionalColumns) {
          wikitext += wikitext += this.getTableCellWikitext(additionalColumn);
        }
      }
    }
    return wikitext;
  }
}

export class TrackItem {
  discNo: number | string;
  trackNo: number | string;
  pageTitle: string;
  producerCredit: string;
  singerCredit: string;

  constructor(
    discNo: number | string,
    trackNo: number | string,
    pageTitle: string,
    producerCredit: string,
    singerCredit: string
  ) {
    this.discNo = (discNo || '');
    this.trackNo = (trackNo || '');
    this.pageTitle = (pageTitle || '').trim();
    this.producerCredit = (producerCredit || '').trim();
    this.singerCredit = (singerCredit || '').trim();
  }

  get credits(): string {
    let credits: string = this.singerCredit;
    if (this.producerCredit !== '') credits = `${this.producerCredit} ft. ${credits}`;
    return credits;
  }
}

export class DiscogItem {
  page: string;
  additionalParameters: string;
  isCompilation?: boolean;
  forAlbum: boolean;
  
  constructor(page: string, additionalParameters: string, forAlbum: boolean = false, isCompilation: boolean | null = null) {
    this.page = (page || '').trim();
    this.additionalParameters = (additionalParameters || '').trim();
    this.forAlbum = forAlbum;
    if (forAlbum) {
      this.isCompilation = isCompilation ?? false;
    }
  }

  toTemplate(): string {
    let params = this.additionalParameters;
    if (params !== '' && !params.startsWith('|')) params = `|${params}`;
    return `{{${this.forAlbum ? 'awt' : 'pwt'} row|${this.page}${params}}}`
  }
}

export class PlayLink {
  site: string;
  url: string;
  isReprint: boolean;
  isAutogen: boolean;
  isDeleted: boolean;
  viewCount: string;

  constructor(
    site: string, url: string,
    isReprint: boolean | string, 
    isAutogen: boolean | string, 
    isDeleted: boolean | string, 
    viewCount: string 
  ) {

    this.site = (site || '').trim();
    this.url = (url || '').trim();
    this.isReprint = (isReprint === 'false' || isReprint === '' ? false : !!isReprint);
    this.isAutogen = (isAutogen === 'false' || isAutogen === '' ? false : !!isAutogen);
    this.isDeleted = (isDeleted === 'false' || isDeleted === '' ? false : !!isDeleted);
    this.viewCount = (viewCount || '').trim();
  }

  get isOfficiallyAvailable() {
    return (!this.isReprint && !this.isDeleted);
  }
  // get shouldShowViewCount() {
  //   // @ts-ignore
  //   return (CONST_PV_SERVICE_ABBREVIATIONS[this.site] !== undefined);
  // }
  getWikitext(): string {
    let res = `{{#|${this.url}`;
    if (this.isAutogen) res += `|auto=y`;
    let annotation: string = '';
    if (this.isReprint) annotation = 'reprint';
    if (this.isDeleted) {
      if (annotation === '') annotation = 'deleted';
      else annotation += ', deleted';
    }
    if (annotation !== '') res += `|label=${annotation}`;
    res += "}}";
    return res;
  }
  getFormattedViewCount(): string {
    let viewCountStr = this.viewCount.trim();
    viewCountStr = viewCountStr.replace(/[,\.]\s?(?=\d{3})/g, "");
    viewCountStr = viewCountStr.replace(/\+/g, "");
    //Round down view count number if numeric
    if (viewCountStr !== "" && !isNaN(+viewCountStr)) {
      let viewCount = parseInt(viewCountStr);
      let div = 1;
      if (viewCount < 1000) {
        div = 10 ** Math.trunc(Math.log10(viewCount));
      } else {
        div = 10 ** (Math.trunc(Math.log10(viewCount)) - 1);
      }
      viewCount = Math.floor(viewCount / div) * div;
      return viewCount.toLocaleString('en-US') + "+";
    }
    //Show view count number as text if non-numeric
    else {
      return this.viewCount;
    }
  }
}

export class ExternalLink {
  url: string;
  description: string;
  isOfficial: boolean;
  isMedia?: boolean;
  isInactive?: boolean;
  isAlbumReadMoreLink?: boolean;

  constructor(
    url: string, description: string, 
    isOfficial: boolean | string, 
    isMedia?: boolean | string, 
    isInactive?: boolean | string, 
    isAlbumReadMoreLink?: boolean | string,
  ) {
    this.url = (url || '').trim();
    this.description = (description || '').trim();
    this.isOfficial = (isOfficial === 'false' || isOfficial === '' ? false : !!isOfficial);
    this.isMedia = (isMedia === 'false' || isMedia === '' ? false : !!isMedia);
    this.isInactive = (isInactive === 'false' || isInactive === '' ? false : !!isInactive);
    this.isAlbumReadMoreLink = (isAlbumReadMoreLink === 'false' || isAlbumReadMoreLink === '' ? false : !!isAlbumReadMoreLink);
  }

  recognizedFandomInterwiki: IDictionary<string> = {
    'vocaloid': 'vocaloid',
    'synthv': 'synthv',
    'cevio': 'cevio',
    'deepvocal': 'deepvocal',
    'utau': 'utau',
    'utaite': 'utaite',
    'virtualyoutuber': 'vtuber',
    'odorite': 'odorite',
    'projectsekai': 'proseka'
  }

  getWikitext(): string {
    let wikitext: string;

    const matchVdb = /^https?:\/\/vocadb.net\/([^\?]*)/.exec(this.url);
    const matchMirahezeWiki = /^https?:\/\/([^\.]*).miraheze\.org\/wiki\/(.*)/.exec(this.url);
    const matchFandomWiki = /^https?:\/\/([^\.]*).fandom\.com\/wiki\/(.*)/.exec(this.url);
    const matchHMWiki = /^https?:\/\/w\.atwiki\.jp\/hmiku\/pages\/(\d+)\.html$/.exec(this.url);
    const matchMgp = /^https?:\/\/zh\.moegirl\.org\.cn\/(.+)$/.exec(this.url);

    switch (true) {
      case (matchVdb !== null):
        wikitext = `{{VDB|${matchVdb[1]}}}${this.description === 'VocaDB' ? '' : ' - ' + this.description}`;
        break;
      case (matchMirahezeWiki !== null):
        if (matchMirahezeWiki[1] === import.meta.env.VITE_VLW_WIKI_NAME) {
          wikitext = `[[${matchMirahezeWiki[2]}|${this.description}]]`;
        } else {
          wikitext = `[[mh:${matchMirahezeWiki[1]}|${matchMirahezeWiki[2]}|${this.description}]]`;
        }
        break;
      case (matchFandomWiki !== null):
        if (matchFandomWiki[1] in this.recognizedFandomInterwiki) {
          wikitext = `{{${this.recognizedFandomInterwiki[matchFandomWiki[1]]}|${matchFandomWiki[2]}|${this.description}}}`;
        } else {
          wikitext = `{{FandomWiki|${matchFandomWiki[1]}|${matchFandomWiki[2]}|${this.description}}}`;
        }
        break;
      case (matchHMWiki !== null):
        wikitext = `{{HMWiki|${matchHMWiki[1]}}}`
        break;
      case (matchMgp !== null):
        wikitext = `{{MGP|${matchMgp[1]}}}`;
        break;
      default:
        wikitext = `[${this.url} ${this.description}]`;
    }
    if (this.isInactive) wikitext = `<s>${wikitext}</s>`;
    return wikitext;
  }
}