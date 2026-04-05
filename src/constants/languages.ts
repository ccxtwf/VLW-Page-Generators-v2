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
    name: "Ainu",
    code: null,
    iso: "ain",
  },
  {
    name: "Arabic",
    transliteration: "Romanization",
    code: null,
    iso: "ara",
  },
  {
    name: "Basque",
    code: null,
    iso: "eus",
  },
  {
    name: "Belarusian",
    transliteration: "Romanization",
    code: null,
    iso: "bel",
  },
  {
    name: "Bulgarian",
    transliteration: "Romanization",
    code: null,
    iso: "bul",
  },
  {
    name: "Cantonese",
    transliteration: "Jyutping",
    code: "yue",
    iso: "zh-Hant",
  },
  {
    name: "Catalan",
    code: null,
    iso: "ca",
  },
  {
    name: "Cherokee",
    transliteration: "Romanization",
    code: null,
    iso: "chr",
  },
  {
    name: "Croatian",
    code: null,
    iso: "hrv",
  },
  {
    name: "Czech",
    code: null,
    iso: "ces",
  },
  {
    name: "Danish",
    code: null,
    iso: "dan",
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
    name: "Estonian",
    code: null,
    iso: "est",
  },
  {
    name: "Evenki",
    transliteration: "Romanization",
    code: null,
    iso: "evn",
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
    name: "Gaelic",
    code: null,
    iso: "gle",
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
    name: "Hindi",
    transliteration: "Romanization",
    code: null,
    iso: "hin",
  },
  {
    name: "Hungarian",
    code: null,
    iso: "hun",
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
    name: "Mongolian",
    transliteration: "Romanization",
    code: null,
    iso: "mon",
  },
  {
    name: "Northern Wu",
    transliteration: "Romanization",
    code: null,
    iso: "taiu",
  },
  {
    name: "Norwegian",
    code: null,
    iso: "nor",
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
    name: "Serbian",
    code: null,
    iso: "srp",
  },
  {
    name: "Slovak",
    code: null,
    iso: "slk",
  },
  {
    name: "Somali",
    code: null,
    iso: "som",
  },
  {
    name: "Southern Quechua",
    code: null,
    iso: "qwc",
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
    name: "Taiwanese",
    transliteration: "Tâi-lô",
    code: null,
    iso: "zh-Hant",
  },
  {
    name: "Tajik",
    transliteration: "Romanization",
    code: null,
    iso: "tgk",
  },
  {
    name: "Teochew Min",
    transliteration: "Romanization",
    code: null,
    iso: "zh-Hant",
  },
  {
    name: "Thai",
    transliteration: "Romanization",
    code: "th"
  },
  {
    name: "Toki Pona",
    code: null,
    iso: "tok",
  },
  {
    name: "Turkish",
    code: null,
    iso: "tr",
  },
  {
    name: "Ukrainian",
    transliteration: "Romanization",
    code: null,
    iso: "uk",
  },
  {
    name: "Urdu",
    transliteration: "Romanization",
    code: null,
    iso: "ur",
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
    name: "Yakut",
    transliteration: "Romanization",
    code: null,
    iso: "sah",
  },
  {
    name: "Yiddish",
    transliteration: "Romanization",
    code: null,
    iso: "yid",
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