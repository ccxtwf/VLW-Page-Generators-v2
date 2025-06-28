export interface IDictionary<T> {
  [key: string]: T;
}

export enum ENUM_CW_STATES {
  noWarnings,
  questionable,
  explicit
}

export enum ENUM_AI_WARNING_TYPE {
  none,
  verified,
  suspected,
}

export interface songPageFormInterface {
  aiCwState: ENUM_AI_WARNING_TYPE
  aiWarningText1: string
  aiWarningText2: string
  cwState: ENUM_CW_STATES
  cwText: string
  hasEpilepsyWarning: boolean
  isoLangCode: string
  origTitle: string
  altChTitle: string
  altChIsTraditional: boolean
  romTitle: string
  engTitle: string
  titleIsOfficiallyTranslated: boolean
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

export interface albumPageFormInterface {
  origTitle: string
  romTitle: string
  engTitle: string
  bgColour: string
  fgColour: string
  label: string
  description: string
  isCompilationAlbum: boolean
  publishedYear: string
  publishedMonth: string
  publishedDay: string
  engines: string[]
  vdbAlbumId: string
  vocaWikiPage: string
  categoriesRaw: string
}

export interface producerPageFormInterface {
  prodCategory: string
  splitAlbum: boolean
  prodAliases: string
  affiliations: string
  label: string
  languageIds: number[]
  engines: string[]
  description: string
}

export interface producerRoles {
  composer: boolean
  lyricist: boolean
  tuner: boolean
  illustrator: boolean
  animator: boolean
  arranger: boolean
  instrumentalist: boolean
  mixer: boolean
  masterer: boolean
}

export interface lyricsEditorFormInterface {
  translator: string
  isOfficialTranslation: boolean
}

export interface displayErrorsInterface {
  errors: string[]
  warnings: string[]
  recommendToAutoloadCategories: boolean
}