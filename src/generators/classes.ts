export class Lyric {
  colour: string;
  original: string;
  romanized?: string;
  english?: string;

  constructor(needsRomanization: boolean, needsEnglishTranslation: boolean, ...args: string[]) {
    this.colour = (args[0] || '').trim();
    this.original = (args[1] || '').trim();
    if (needsRomanization) this.romanized = (args[2] || '').trim();
    if (needsEnglishTranslation) this.english = (args[3] || '').trim();
  }

  getWikitext(printEmptyEnglishColumn: boolean = false): string {
    let wikitext: string = `|-${this.colour === '' ? ' ' : ` style='color:${this.colour}'`}\n`;
    let sharesColumns = (this.original === (this.romanized || this.original)) && (
      !printEmptyEnglishColumn ||
      (printEmptyEnglishColumn && (this.original === (this.english || this.original)))
    );
    if (sharesColumns) {
      if (this.original === '') {
        wikitext += '|<br />\n'
      } else {
        let numColumns = [!!this.original, !!this.romanized, !!this.english].reduce(
          (num, curBool) => { 
            num += curBool ? 1 : 0; 
            return num; 
          }, 0
        );
        if (printEmptyEnglishColumn && (!this.english || this.english === '')) numColumns += 1;
        wikitext += `| {{shared|${numColumns}}} ${this.original}\n`;
      }
    } else {
      wikitext += `|${this.original}\n`;
      if (this.romanized) wikitext += `|${this.romanized}\n`;
      if (printEmptyEnglishColumn) wikitext += `|${this.english || ''}\n`;
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
  forAlbum: boolean;
  
  constructor(page: string, additionalParameters: string, forAlbum: boolean = false) {
    this.page = (page || '').trim();
    this.additionalParameters = (additionalParameters || '').trim();
    this.forAlbum = forAlbum;
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
    let annotation: string = '';
    if (this.isReprint) annotation = 'reprint'
    else if (this.isAutogen) annotation = 'auto-generated by YouTube';
    if (this.isDeleted) {
      if (annotation === '') annotation = 'deleted'
      else annotation += ', deleted';
    }
    if (annotation !== '') annotation = ` <small>(${annotation})</small>`;
    return `[${this.url} ${this.site} Broadcast]${annotation}`;
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
      }
      else {
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

  constructor(
    url: string, description: string, 
    isOfficial: boolean | string, 
    isMedia?: boolean | string, 
    isInactive?: boolean | string
  ) {
    this.url = (url || '').trim();
    this.description = (description || '').trim();
    this.isOfficial = (isOfficial === 'false' || isOfficial === '' ? false : !!isOfficial);
    this.isMedia = (isMedia === 'false' || isMedia === '' ? false : !!isMedia);
    this.isInactive = (isInactive === 'false' || isInactive === '' ? false : !!isInactive);
  }

  getWikitext(): string {
    let wikitext: string;
    const matchVdb = /^https?:\/\/vocadb.net\/([^\?]*)/.exec(this.url);
    const matchFandomWiki = /^https?:\/\/([^\.]*).fandom\.com\/wiki\/(.*)/.exec(this.url);
    if (matchVdb !== null) {
      wikitext = `{{VDB|${matchVdb[1]}}}${this.description === 'VocaDB' ? '' : ' - ' + this.description}`;
    } else if (matchFandomWiki !== null) {
      const wikiName = matchFandomWiki[1];
      if (wikiName.match(/^vocaloidlyrics$/i) === null) {
        wikitext = `[[w:c:${wikiName}:${matchFandomWiki[2]}|${this.description}]]`;
      } else {
        wikitext = `[[${matchFandomWiki[2]}|${this.description}]]`;
      }
    } else {
      wikitext = `[${this.url} ${this.description}]`;
    }
  if (this.isInactive) wikitext = `<s>${wikitext}</s>`;
    return wikitext;
  }
}