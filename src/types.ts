export enum ENUM_CW_STATES {
  noWarnings,
  questionable,
  explicit
}

export interface songPageFormInterface {
  cwState: ENUM_CW_STATES
  cwText: string
  hasEpilepsyWarning: boolean
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
  bgColour: string
  fgColour: string
  label: string
  description: string
  engines: string[]
  vdbAlbumId: string
  vocaWikiPage: string
  categoriesRaw: string
}

export interface producerPageFormInterface {
  prodCategory: string
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
  outputThirdColumn: boolean
}

export interface displayErrorsInterface {
  errors: string[]
  warnings: string[]
  recommendToAutoloadCategories: boolean
}