export const SONG_PAGE_TOOLTIPS = {
  Vdb: (
    <>
    Input the URL to the VocaDB song page here.
    <br/><br/>
    e.g. <a href="https://vocadb.net/S/1501" target="_blank" rel="noopener noreferrer">https://vocadb.net/S/1501</a> Rolling Girl
    </>
  ),
  PvStills: (
    <>
    Save PV stills as local file
    <br/><br/>
    May fail to get working HQ images for older songs.
    <br/>
    Finicky when trying to get images from Bilibili.
    </>
  ),
  Cw: (
    <>
    Add content warnings to the top of page.
    <br/><br/>
    You are required to add the justification for adding a content warning, e.g. if it contains violent/sexual content, or if it deals with mature themes.
    </>
  ),
  Ai: (
    <>
    Add a notice warning for usage of generative AI to the top of page.
    <br/><br/>
    Be sure to include the source attributing the usage of generative AI for verified cases (e.g. video description, producer comment, etc.), or an explanation detailing inconsistencies that raise credible suspicion of generative AI usage for non-verified cases. 
    </>
  ),
  Language: (
    <>
    The language the song lyrics are written in.
    </>
  ),
  IsoLangCode: (
    <>
    The ISO Language of the original lyrics, used to ensure proper rendering of the lyrics column (refer to this <a href="https://meta.miraheze.org/wiki/User:PetraMagna/Why_you_should_use_language_attributes" target="_blank" rel="noopener noreferrer">blogpost</a> for more details on how this works).<br /><br />
    List of ISO Language Codes: <a href="https://www.w3schools.com/tags/ref_language_codes.asp" target="_blank" rel="noopener noreferrer">[W3Schools]</a> <a href="https://www.loc.gov/standards/iso639-2/php/code_list.php" target="_blank" rel="noopener noreferrer">[Library of Congress]</a>
    </>
  ),
  OriginalTitle: (
    <>
    Song title in original language.
    </>
  ),
  AltCnTitle: (
    <>
    Song title in alternate Chinese script (e.g. Traditional/Simplified Chinese script).
    </>
  ),
  RomTitle: (
    <>
    Transliterated song title (if non-English original)
    </>
  ),
  EngTitle: (
    <>
    Song title translated to English (if non-English original)
    </>
  ),
  Infobox: (
    <>
    Infobox background (left) and foreground (right) colour
    <br/>
    hexadecimal colour, e.g., #ff0000
    <br/><em>or</em><br/>
    colour name, e.g., red
    </>
  ),
  DateOfPublication: (
    <>
    Original date of publication
    </>
  ),
  Singers: (
    <>
    Markup for singer(s), e.g.:<br/>[[Kagamine Rin]] and [[Kagamine Len]]
    <br/><br/>
    Be sure to check whether the correct singer category has been put in.
    </>
  ),
  Producers: (
    <>
    Markup for producer(s), one per line, e.g.:<br/>
    [[Tanaka Kazuto]] (music, lyrics)<br/>Pikucha (illustration)
    <br/><br/>
    Categories will be loaded automatically based on the markup.
    </>
  ),
  Description: (
    <>
    Background information about the song.
    </>
  ),
  PlayLinks: (
    <>
    Links to play song, one per line.
    <br/>
    Recognized links: youtu.be, youtube.com, nicovideo.jp, piapro.jp, soundcloud.com, bandcamp.com, vimeo.com, bilibili.com
    <br/><br/>
    Leave URL empty if there's no play link available (e.g. the song is not publicly available or the song is an album-only release).
    </>
  ),
  Lyrics: (
    <>
    Copy & paste original, transliterated and translated lyrics here.
    <br/>
    Add text colour styling to the entire row by specifying the hexadecimal colour, e.g., #ff0000
    <br/><em>or</em><br/>
    colour name, e.g., red
    </>
  ),
  Translator: (
    <>
    Translator's name
    </>
  ),
  IsOfficialTranslation: (
    <>
    Is the translation approved by the producer?
    </>
  ),
  ExternalLinks: (
    <>
    Links to related web pages, one per line, with description, e.g.:
    <br/>
    https://piapro.jp/t/uvwx Off-vocal
    <br/><br/>
    Recognizes many commonly used sites such as Hatsune Miku Wiki and VocaDB.
    </>
  ),
  Categories: (
    <>
    Category names, one per line, e.g.:
    <br/>
    Songs<br/>VOCALOID original songs
    <br/><br/>
    Click the Autoload button to have the site generate commonly used tags.
    </>
  )
};