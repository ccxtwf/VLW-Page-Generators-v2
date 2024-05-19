export enum ArtistCategory {
  producer = 'Producer',
  vocalist = 'Vocalist',
  animator = 'Animator',
  illustrator = 'Illustrator',
  label = 'Label',
  circle = 'Circle',
  band = 'Band',
  other = 'Other',
  nothing = 'Nothing',
  subject = 'Subject'
}

export enum ArtistRole {
  default = 'Default',
  animator = 'Animator',
  arranger = 'Arranger',
  composer = 'Composer',
  distributor = 'Distributor',
  illustrator = 'Illustrator',
  instrumentalist = 'Instrumentalist',
  lyricist = 'Lyricist',
  mastering = 'Mastering',
  publisher = 'Publisher',
  vocalist = 'Vocalist',
  voicemanipulator = 'VoiceManipulator',
  other = 'Other',
  mixer = 'Mixer',
  chorus = 'Chorus',
  encoder = 'Encoder',
  vocalprovider = 'VocalDataProvider'
}

export enum ArtistType {
  unknown = 'Unknown',
  circle = 'Circle',
  label = 'Label',
  producer = 'Producer',
  animator = 'Animator',
  illustrator = 'Illustrator',
  lyricist = 'Lyricist',
  vocalist = 'Vocalist',
  instrumentalist = 'Instrumentalist',
  othervocalist = 'OtherVocalist',
  othergroup = 'OtherGroup',
  otherIndividual = 'OtherIndividual',
  utaite = 'Utaite',
  band = 'Band',
  designer = 'Designer',
  coverartist = 'CoverArtist',

  character = 'Character',

  vocaloid = 'Vocaloid',
  utau = 'UTAU',
  cevio = 'CeVIO',
  synthv = 'SynthesizerV',
  ace = 'ACEVirtualSinger',
  neutrino = 'NEUTRINO',
  voisona = 'VoiSona',
  newtype = 'NewType',
  voiceroid = 'Voiceroid',
  othervoicesynth = 'OtherVoiceSynthesizer'
}

export enum PvService {
  nnd = 'NicoNicoDouga',
  yt = 'Youtube',
  sc = 'SoundCloud',
  vm = 'Vimeo',
  pp = 'Piapro',
  bb = 'Bilibili',
  bc = 'Bandcamp'
}

export enum PvType {
  original = 'Original',
  reprint = 'Reprint',
  other = 'Other'
}

export enum EntryStatus {
  draft = 'Draft',
  finished = 'Finished',
  approved = 'Approved',
  locked = 'Locked'
}

export enum WebLinkCategory {
  official = 'Official',
  commercial = 'Commercial',
  reference = 'Reference',
  other = 'Other'
}

export enum VdbSystemLanguages {
  orig='Japanese',
  rom='Romaji',
  eng='English',
  oth='Unspecified'
}

export enum AlbumType {
  unknown='Unknown',
  album='Album',
  single='Single',
  ep='EP',
  splitalbum='SplitAlbum',
  compilation='Compilation',
  video='Video',
  artbook='Artbook',
  game='Game',
  fanmade='Fanmade',
  instrumental='Instrumental',
  other='Other'
}

interface VdbArtistEntity {
  artist?: {
    additionalNames: string | null
    artistType: ArtistType
    deleted: boolean
    id: number
    name: string | null
    pictureMime: string | null
    status: EntryStatus
    version: number
  }
  categories: string  //ArtistCategory
  effectiveRoles: string  //ArtistRole
  id?: number
  isCustomName?: boolean
  isSupport: boolean
  name: string | null
  roles: string  //ArtistRole
}
interface VdbPvEntity {
  author: string | null
  disabled: boolean
  id: number
  length: number
  name: string | null
  publishDate?: string | null
  pvId: string | null
  service: PvService
  pvType: PvType
  thumbUrl?: string | null
  url: string | null
}
interface VdbWebLinkEntity {
  category: WebLinkCategory
  description: string | null
  disabled: boolean
  id: number
  url: string | null
}
export interface schemaFetchedSongPageJson {
  artists: VdbArtistEntity[] | null
  artistString: string | null
  createDate: string
  defaultName: string | null
  defaultNameLanguage: VdbSystemLanguages
  favoritedTimes: number
  id: number
  lengthSeconds: number
  name: string | null
  names: {
    language: VdbSystemLanguages
    value: string | null
  }[] | null
  publishDate: string | null
  pvs: VdbPvEntity[] | null
  pvServices: string
  ratingScore: number
  songType: string
  status: EntryStatus
  version: number
  webLinks: VdbWebLinkEntity[] | null
  cultureCodes: string[] | null
}
export interface schemaFetchedAlbumPageJson {
  artists: VdbArtistEntity[] | null
  artistString: string | null
  catalogNumber: string | null
  createDate: string
  defaultName: string | null
  defaultNameLanguage: VdbSystemLanguages
  discType: AlbumType
  id: number
  mainPicture: {
    mime: string | null
    urlOriginal: string | null
    urlSmallThumb: string | null
    urlThumb: string | null
    urlTinyThumb: string | null
  }
  name: string | null
  names: {
    language: VdbSystemLanguages
    value: string
  }[] | null
  pvs: VdbPvEntity[] | null
  ratingAverage: number
  ratingCount: number
  releaseDate: {
    day: number | null
    isEmpty: boolean
    month: number | null
    year: number | null
  }
  status: EntryStatus
  tracks: {
    discNumber: number
    id: number
    name: string | null
    song: {
      artists: VdbArtistEntity[] | null
      artistString: string | null
      createDate: string
      defaultName: string | null
      defaultNameLanguage: VdbSystemLanguages
      favoritedTimes: number
      id: number
      lengthSeconds: number
      name: string | null
      originalVersionId: number
      publishDate: string | null
      pvServices: string
      ratingScore: number
      songType: string
      status: EntryStatus
      version: number
      cultureCodes: string[] | null
    }
    trackNumber: number
    computedCultureCodes: string[] | null
  }[] | null
  version: number
  webLinks: VdbWebLinkEntity[] | null
}

export interface schemaFetchedArtistPageJson {
  additionalNames: string | null
  artistLinks: {
    artist: {
      additionalNames: string | null
      artistType: ArtistType
      deleted: boolean
      id: number
      name: string | null
      pictureMime: string | null
      status: EntryStatus
      version: number
    }
    linkType: string
  }[] | null
  artistType: string
  createDate: string
  defaultName: string | null
  defaultNameLanguage: VdbSystemLanguages
  description: string | null
  id: number
  mainPicture: {
    mime: string | null
    urlOriginal: string | null
    urlSmallThumb: string | null
    urlThumb: string | null
    urlTinyThumb: string | null
  }
  name: string | null
  pictureMime: string | null
  status: EntryStatus
  version: number
  webLinks: VdbWebLinkEntity[] | null
}

export interface schemaFetchedDiscography {
  error?: {
    code: string
    info: string
  }
  batchComplete: string
  continue?: {
    cmcontinue: string
    continue: string
  }
  query: {
    categorymembers: {
      ns: number
      title: string
      sortkeyprefix?: string
    }[]
  }
}