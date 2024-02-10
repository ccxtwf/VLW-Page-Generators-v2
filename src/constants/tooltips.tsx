import { CONST_WIKI_DOMAIN } from "../constants/linkDomains";

export const CONST_TOOLTIPS_SONG_PAGES = {
  vdb: (
    <>
    Input the URL to the VocaDB song page here.
    <br/><br/>
    e.g. <a href="https://vocadb.net/S/1501" target="_blank" rel="noopener noreferrer">https://vocadb.net/S/1501</a> Rolling Girl
    </>
  ),
  pvStills: (
    <>
    Save PV stills as local file
    <br/><br/>
    May fail to get working HQ images for older songs.
    <br/>
    Finicky when trying to get images from Bilibili.
    </>
  ),
  cw: (
    <>
    Add content warnings to the top of page.
    <br/><br/>
    You are required to add the justification for adding a content warning, e.g. if it contains violent/sexual content, or if it deals with mature themes.
    </>
  ),
  language: (
    <>
    The language the song lyrics are written in.
    </>
  ),
  origTitle: (
    <>
    Song title in original language.
    </>
  ),
  altChTitle: (
    <>
    Song title in alternate Chinese script (e.g. Traditional/Simplified Chinese script).
    </>
  ),
  romTitle: (
    <>
    Transliterated song title (if non-English original)
    </>
  ),
  engTitle: (
    <>
    Song title translated to English (if non-English original)
    </>
  ),
  infobox: (
    <>
    Infobox background (left) and foreground (right) colour
    <br/>
    hexadecimal colour, e.g., #ff0000
    <br/><em>or</em><br/>
    colour name, e.g., red
    </>
  ),
  dateOfPublication: (
    <>
    Original date of publication
    </>
  ),
  singers: (
    <>
    Markup for singer(s), e.g.:<br/>[[Kagamine Rin]] and [[Kagamine Len]]
    <br/><br/>
    Be sure to check whether the correct singer category has been put in.
    </>
  ),
  producers: (
    <>
    Markup for producer(s), one per line, e.g.:<br/>
    [[Tanaka Kazuto]] (music, lyrics)<br/>Pikucha (illustration)
    <br/><br/>
    Categories will be loaded automatically based on the markup.
    </>
  ),
  description: (
    <>
    Background information about the song.
    </>
  ),
  playLinks: (
    <>
    Links to play song, one per line.
    <br/>
    Recognized links: youtu.be, youtube.com, nicovideo.jp, piapro.jp, soundcloud.com, bandcamp.com, vimeo.com, bilibili.com
    <br/><br/>
    Leave URL empty if there's no play link available (e.g. the song is not publicly available or the song is an album-only release).
    </>
  ),
  lyrics: (
    <>
    Copy & paste original, transliterated and translated lyrics here.
    <br/>
    Add text colour styling to the entire row by specifying the hexadecimal colour, e.g., #ff0000
    <br/><em>or</em><br/>
    colour name, e.g., red
    </>
  ),
  translator: (
    <>
    Translator's name
    </>
  ),
  officialTranslation: (
    <>
    Is the translation approved by the producer?
    </>
  ),
  extLinks: (
    <>
    Links to related web pages, one per line, with description, e.g.:
    <br/>
    https://piapro.jp/t/uvwx Off-vocal
    <br/><br/>
    Recognizes many commonly used sites such as Hatsune Miku Wiki and VocaDB.
    </>
  ),
  categories: (
    <>
    Category names, one per line, e.g.:
    <br/>
    Songs<br/>VOCALOID original songs
    <br/><br/>
    Click the Autoload button to have the site generate commonly used tags.
    </>
  )
}

export const CONST_TOOLTIPS_ALBUM_PAGES = {
  vdb: (
    <>
    Input URL to VocaDB album page here.
    <br/><br/>
    e.g. <a href="https://vocadb.net/Al/21149" target="_blank" rel="noopener noreferrer">https://vocadb.net/Al/21149</a> Comic and Cosmic
    </>
  ),
  cover: (
    <>
    This tool will attempt to load the album cover picture from VocaDB.
    </>
  ),
  origTitle: (
    <>
    Album name in original language
    </>
  ),
  romTitle: (
    <>
    Transliterated song title (if non-English original)
    </>
  ),
  infobox: (
    <>
    Infobox background (left) and foreground (right) colour
    <br/>
    hexadecimal colour, e.g., #ff0000
    <br/><em>or</em><br/>
    colour name, e.g., red
    </>
  ),
  label: (
    <>
    Name of the label that published the album, e.g. EXIT TUNES, KarenT
    </>
  ),
  description: (
    <>
    Add a short description about the album, e.g. "a compilation album by PRODUCERS featuring SYNTHS" or "an album by PRODUCER".
    </>
  ),
  engines: (
    <>
    Needed to generate synth category tags.
    </>
  ),
  tracklist: (
    <>
    Add tracklist information here.
    <br/>
    Track names should follow the naming convention of song articles (e.g. "すろぉもぉしょん (Slow Motion)").
    <br/><br/>
    If a song page exists on Vocaloid Lyrics wiki then you can copy and paste the URL to that song page to the cell in the third column ("Track name/VLW Page Title"). The site will automatically detect the page title in this scenario.
    <br/><br/>
    Markup to featured producers and singers should only be added for the first mention of that artist/synth.
    </>
  ),
  vdbAlbumId: (
    <>
    The numerical ID of the album page entry on VocaDB. For example, the Page ID for the album "Comic and Cosmic" (<a href="https://vocadb.net/Al/21149" target="_blank" rel="noopener noreferrer">https://vocadb.net/Al/21149</a>) is 21149.
    </>
  ),
  vocaWikiPage: (
    <>
    The Vocaloid Wiki page for the album, if it exists. Only the page name should be given.
    </>
  ),
  extLinks: (
    <>
    Links to related web pages, one per line, with description, e.g.:
    <br/>
    https://piapro.jp/t/uvwx Off-vocal
    <br/><br/>
    Recognizes many commonly used sites such as Hatsune Miku Wiki and VocaDB
    </>
  ),
  categories: (
    <>
    Category names, one per line, e.g.:
    <br/>
    Albums featuring Hatsune Miku
    <br/><br/>
    Click the Autoload button to have the site generate commonly used tags.
    </>
  )
}

export const CONST_TOOLTIPS_PRODUCER_PAGES = {
  vdb: (
    <>
    Input URL to VocaDB producer/artist page here.
    <br/><br/>
    e.g. <a href="https://vocadb.net/Ar/28" target="_blank" rel="noopener noreferrer">https://vocadb.net/Ar/28</a> Pinocchio-P
    </>
  ),
  pfp: (
    <>
    This tool will attempt to load the producer's profile picture from VocaDB.
    </>
  ),
  prodcat: (
    <>
    This will be used as the parameter of the &#123;&#123;ProdLinks&#125;&#125; template on the producer page, which will link to the producer's songs list category on the wiki
    <br/><br/>
    Click on the "Fetch discography from wiki" button to get this site to query the list of song & album pages from the producer category on Vocaloid Lyrics Wiki.
    </>
  ),
  prodaliases: (
    <>
    The producer's other aliases, if exists. List each item using a semi-colon (;)
    <br/><br/>
    This will be used for the &#123;&#123;pwt alias&#125;&#125; template.
    </>
  ),
  affiliations: (
    <>
    Is the producer affiliated with any circle/group/project?
    <br/><br/>
    Add one affiliation per line.
    </>
  ),
  labels: (
    <>
    What labels (e.g. KarenT, Exit Tunes) is the producer usually affliated with?
    <br/><br/>
    Add one label/affiliation per line.
    </>
  ),
  languages: (
    <>
    What language does the producer like to write their songs in? e.g. Japanese, English
    </>
  ),
  synthesizers: (
    <>
    What voice synthesizer group/software family/engine does the producer like to write their songs with? e.g. VOCALOID, UTAU
    </>
  ),
  prodroles: (
    <>
    Describe the producer's typical roles, e.g. composer, lyricist, illustrator.
    </>
  ),
  description: (
    <>
    Describe the producer.
    </>
  ),
  extLinks: (
    <>
    Examples of media links:<br />
    <ul>
        <li>The producer's official Niconico/YouTube/bilibili accounts.</li>
        <li>The producer's NND MyList.</li>
        <li>The producer's piapro.</li>
        <li>The producer's account on SoundCloud/Netease Music.</li>
        <li>The producer's Bandcamp/Spotify/TuneCore/other music streaming.</li>
    </ul>
    Examples of official links:<br />
    <ul>
        <li>The producer's official website.</li>
        <li>The producer's social media/SNS accounts, e.g. Twitter, Instagram, Weibo.</li>
    </ul>
    Examples of unofficial links:<br />
    <ul>
        <li>The producer's page on VocaDB.</li>
        <li>A page on the producer from any unofficial wiki, e.g. the <a href="https://vocaloid.fandom.com/" target="_blank" rel="noopener noreferrer">VOCALOID wiki</a>, the <a href="https://w.atwiki.jp/hmiku/" target="_blank" rel="noopener noreferrer">Hatsune Miku wiki</a>, <a href="https://dic.nicovideo.jp/" target="_blank" rel="noopener noreferrer">Nicopedia</a>, etc.</li>
    </ul>
    </>
  ),
  songList: (
    <>
    Add the list of song pages <b>(that exist on the VOCALOID Lyrics wiki)</b> here.<br /><br />
    You can copy and paste the page URL to add the pages automatically.
    </>
  ),
  albumList: (
    <>
    Add the list of album pages <b>(that exist on the VOCALOID Lyrics wiki)</b> here.<br /><br />
    You can copy and paste the page URL to add the pages automatically.
    </>
  )
}

export const CONST_TOOLTIPS_LYRICS_EDITOR = {
  sourceInput: (
    <>
    To get the source code of the wiki page, you can either:
    <br/>
    <ol>
      <li>
        Open the wiki page in <a href="https://community.fandom.com/wiki/Help:Source_editor" target="_blank" rel="noopener noreferrer">Source Editor</a>
      </li>
      <li>
        Append "?action=raw" to the URL of the wiki page, e.g. <a href={
          `https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/ECHO/Crusher-P?action=raw`
        } target="_blank" rel="noopener noreferrer">https://{CONST_WIKI_DOMAIN}.fandom.com/wiki/ECHO/Crusher-P?action=raw</a>
      </li>
    </ol>
    Copy and paste the contents of the source code into the box below.
    <br/><br />
    Click the 'Extract Lyrics Table' button to extract the table into the columns below, and the 'Generate' button to generate the page source code/wikitext. 
    </>
  )
}