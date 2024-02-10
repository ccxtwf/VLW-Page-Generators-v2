export const CONST_WIKI_DOMAIN = 'vocaloidlyrics';

export const CONST_PV_SERVICE_ABBREVIATIONS = {
  "Niconico":       "NN",
  "YouTube":        "YT",
  "bilibili":       "BB",
  "piapro":         "PP",
  "SoundCloud":     "SC",
  "Vimeo":          "VM",
};

interface pvService {
  site: string
  re: RegExp
  sanitize?: RegExp
  isMedia?: boolean
}

export const CONST_PV_SERVICES: pvService[] = [
  {
    site: "Niconico",
    re: /^https?:\/\/www\.nicovideo\.jp/,
    sanitize: /^(?<head>https?:\/\/www\.nicovideo\.jp\/watch\/)(?<id>[^\/\?]+)/,
    isMedia: true
  },
  {
    site: "YouTube",
    re: /^https?:\/\/(?:(?:|www\.)youtube\.com\/(?:watch\?v=|shorts)|youtu\.be)/,
    sanitize: /^(?<head>https?:\/\/(?:(?:|www\.)youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/))(?<id>[^\/\?]{11})/,
    isMedia: true
  },
  {
    site: "bilibili",
    re: /^https?:\/\/www\.bilibili\.com/,
    sanitize: /^(?<head>https?:\/\/www\.bilibili\.com\/video\/)(?<id>[^\/\?]+)/,
    isMedia: true
  },
  {
    site: "piapro",
    re: /^https?:\/\/piapro\.jp/,
    isMedia: true
  },
  {
    site: "SoundCloud",
    re: /^https?:\/\/soundcloud\.com/,
    isMedia: true
  },
  {
    site: "Bandcamp",
    re: /^https?:\/\/[^\.]*\.?bandcamp\.com/,
    isMedia: true
  },
  {
    site: "Vimeo",
    re: /^https?:\/\/vimeo\.com/,
    isMedia: true
  },
  {
    site: "Netease Music",
    re: /^https?:\/\/music\.163\.com/,
    isMedia: true
  },
  {
    site: "Spotify",
    re: /^https?:\/\/[^\.]+\.spotify\.com/,
    isMedia: true
  },
  {
    site: "5Sing",
    re: /^https?:\/\/5sing\.kugou\.com/,
    isMedia: true
  }
];

export const CONST_RECOGNIZED_LINKS: pvService[] = CONST_PV_SERVICES.concat([
  {
    site: "YouTube Channel",
    re: /^https?:\/\/www\.youtube\.com\/user\/.*/,
    isMedia: true
  },
  {
    site: "YouTube Channel",
    re: /^https?:\/\/www\.youtube\.com\/channel\/.*/,
    isMedia: true
  },
  {
    site: "bilibili Space",
    re: /^https?:\/\/space\.bilibili\.com\/.*/,
    isMedia: true
  },
  {
    site: "VocaDB",
    re: /^https?:\/\/vocadb\.net\/.*/,
    sanitize: /(?<head>https?:\/\/vocadb\.net\/(?:S|Ar|Al)\/)(?<id>\d+)/
  },
  {
    site: "TuneCore Japan",
    re: /^https?:\/\/www\.tunecore\.co\.jp\/.*/,
    isMedia: true
  },
  {
    site: "VOCALOID Lyrics Wiki",
    re: /^https?:\/\/vocaloidlyrics\.fandom\.com\/*/
  },
  {
    site: "VOCALOID Wiki",
    re: /^https?:\/\/vocaloid\.fandom\.com\/.*/
  },
  {
    site: "Hatsune Miku Wiki",
    re: /^https?:\/\/www5\.atwiki\.jp\/hmiku\/.*/
  },
  {
    site: "Hatsune Miku Wiki",
    re: /^https?:\/\/w\.atwiki\.jp\/hmiku\/.*/
  },
  {
    site: "Anime Lyrics",
    re: /^https?:\/\/www\.animelyrics\.com\/.*/
  },
  {
    site: "Niconico Pedia",
    re: /^https?:\/\/dic\.nicovideo\.jp\/.*/
  },
  {
    site: "Blomaga",
    re: /^https?:\/\/ch\.nicovideo\.jp\/.*/
  },
  {
    site: "Niconico Commons",
    re: /^https?:\/\/commons\.nicovideo\.jp\/.*/
  },
  {
    site: "pixiv",
    re: /^https?:\/\/www\.pixiv\.net\/.*/,
    isMedia: true
  },
  {
    site: "UtaiteDB",
    re: /^https?:\/\/utaitedb\.net\/.*/
  },
  {
    site: "Project DIVA Wiki",
    re: /^https?:\/\/project-diva\.fandom\.com\/.*/
  },
  {
    site: "Project DIVA Wiki",
    re: /^https?:\/\/projectdiva\.wiki\/.*/
  },
  {
    site: "The Evillious Chronicles Wiki",
    re: /^https?:\/\/theevilliouschronicles\.fandom\.com\/.*/
  },
  {
    site: "Vocaloid English & Romaji Lyrics @wiki",
    re: /^https?:\/\/w\.atwiki\.jp\/vocaloidenglishlyric\/.*/
  },
  {
    site: "ChordWiki",
    re: /^https?:\/\/ja\.chordwiki\.org\/.*/
  },
  {
    site: "Pixiv Encyclopedia",
    re: /^https?:\/\/dic\.pixiv\.net\/.*/
  },
  {
    site: "Pixiv Encyclopedia (English)",
    re: /^https?:\/\/en-dic\.pixiv\.net\/.*/
  },
  {
    site: "J-Lyrics.net",
    re: /^https?:\/\/j-lyric\.net\/.*/
  },
  {
    site: "KARENT",
    re: /^https?:\/\/karent\.jp\/.*/,
    isMedia: true
  },
  {
    site: "Wikipedia",
    re: /^https?:\/\/en\.wikipedia\.org\/.*/
  },
  {
    site: "Wikipedia (Japanese)",
    re: /^https?:\/\/ja\.wikipedia\.org\/.*/
  },
  {
    site: "X (Twitter)",
    re: /^https?:\/\/(twitter|x)\.com\/.*/
  },
  {
    site: "UtaTen",
    re: /^https?:\/\/utaten\.com\/.*/
  },
  {
    site: "KKBOX",
    re: /^https?:\/\/www\.kkbox\.com\/.*/
  },
  {
    site: "Lyrical Nonsense",
    re: /^https?:\/\/www\.lyrical-nonsense\.com\/.*/
  },
  {
    site: "KashiGET",
    re: /^https?:\/\/www\.kget\.jp\/.*/
  },
  {
    site: "Dropbox",
    re: /^https?:\/\/www\.dropbox\.com\/.*/
  },
  {
    site: "Google Drive",
    re: /^https?:\/\/drive\.google\.com\/.*/
  },
  {
    site: "Google Docs",
    re: /^https?:\/\/docs\.google\.com\/.*/
  },
  {
    site: "DeviantArt",
    re: /^https?:\/\/[^\.]+\.deviantart\.com\/.*/
  },
  {
    site: "DeviantArt",
    re: /^https?:\/\/fav\.me\/.*/
  },
  {
    site: "Len's Lyrics",
    re: /^https?:\/\/lenslyrics\.ml\/.*/
  },
  {
    site: "Baidu",
    re: /^https?:\/\/pan\.baidu\.com\/.*/
  },
  {
    site: "BOOTH",
    re: /^https?:\/\/[^\.]+\.booth\.pm\/.*/,
    isMedia: true
  },
  {
    site: "Pixiv Fanbox",
    re: /^https?:\/\/www\.pixiv\.net\/fanbox\/.*/,
    isMedia: true
  },
]);