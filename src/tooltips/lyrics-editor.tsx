export const LYRICS_EDITOR_TOOLTIPS = {
  SourceInput: (
    <>
    Use this tool to edit the lyrics table on a wikipage. It is primarily aimed for Japanese/Chinese/Korean song pages.
    <hr/>
    To get the source code of the wiki page, you can either:
    <br/>
    <ol>
      <li>
        Open the wiki page on Wiki Editor.
      </li>
      <li>
        Append "?action=raw" to the URL of the wiki page, e.g. <a href={
          `${import.meta.env.VITE_VLW_WIKI_DOMAIN}${import.meta.env.VITE_WIKI_ENTRYPOINT}/ECHO/Crusher-P?action=raw`
        } target="_blank" rel="noopener noreferrer">{import.meta.env.VITE_VLW_WIKI_DOMAIN}{import.meta.env.VITE_WIKI_ENTRYPOINT}/ECHO/Crusher-P?action=raw</a>
      </li>
    </ol>
    Copy and paste the contents of the source code into the box below.
    <br/><br />
    Click the 'Extract Lyrics Table' button to extract the table into the columns below, and the 'Generate' button to generate the page source code/wikitext. 
    </>
  )
}