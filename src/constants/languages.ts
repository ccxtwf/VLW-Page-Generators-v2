interface Language {
  name: string
  transliteration?: string
  code: string | null
  iso?: string
}

export const LANGUAGES: Language[] = [
  {
    name: "English",
    code: "en",
    iso: "en",
  },  
  {
    name: "Japanese",
    transliteration: "Romaji",
    code: "ja",
    iso: "ja",
  },
  {
    name: "Mandarin",
    transliteration: "Pinyin",
    code: "zh",
    iso: "zh-Hans",
  },
  {
    name: "Korean",
    transliteration: "Romaja",
    code: "ko",
    iso: "ko",
  },
  {
    name: "Spanish",
    code: "es",
    iso: "es",
  },
  {
    name: "Acehnese",
    code: null,
    iso: "id",
  },
  {
    name: "Catalan",
    code: null,
    iso: "ca",
  },
  {
    name: "Cantonese",
    transliteration: "Jyutping",
    code: "yue",
    iso: "zh-Hant",
  },
  {
    name: "Dutch",
    code: null,
    iso: "nl",
  },
  {
    name: "Esperanto",
    code: null,
    iso: "eo",
  },
  {
    name: "Filipino",
    code: "tg",
    iso: "tl",
  },
  {
    name: "Finnish",
    code: null,
    iso: "fi",
  },
  {
    name: "French",
    code: "fr",
    iso: "fr",
  },
  {
    name: "German",
    code: "de",
    iso: "de",
  },
  {
    name: "Greek",
    transliteration: "Romanization",
    code: null,
    iso: "el",
  },
  {
    name: "Indonesian",
    code: "id",
    iso: "id",
  },
  {
    name: "Irish",
    code: null,
    iso: "ga",
  },
  {
    name: "Italian",
    code: null,
    iso: "it",
  },
  {
    name: "Latin",
    code: null,
    iso: "la",
  },
  {
    name: "Malay",
    code: null,
    iso: "ms",
  },
  {
    name: "Polish",
    code: null,
    iso: "pl",
  },
  {
    name: "Portuguese",
    code: "pt",
    iso: "pt",
  },
  {
    name: "Romanian",
    code: null,
    iso: "ro",
  },
  {
    name: "Russian",
    transliteration: "Romanization",
    code: "ru",
    iso: "ru",
  },
  {
    name: "Sundanese",
    code: null,
    iso: "su",
  },
  {
    name: "Swedish",
    code: null,
    iso: "sv",
  },
  {
    name: "Thai",
    transliteration: "Romanization",
    code: "th"
  },
  {
    name: "Turkish",
    code: null,
    iso: "tr",
  },
  {
    name: "Vietnamese",
    code: null,
    iso: "vi",
  },
  {
    name: "Welsh",
    code: null,
    iso: "cy",
  },
  {
    name: "Conlang",
    code: null,
  },
  {
    name: "Non-lexical lyrics",
    code: null,
  }
];