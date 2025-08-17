import { Message, MessageHeader } from 'semantic-ui-react';

export default function FirstTimeEditorNote({ addRedirectNote = false }: { addRedirectNote?: boolean }) {
  return (
    <div>
      <Message>
        <MessageHeader>First Time Editing?</MessageHeader>
        <p>If this is your first time adding a page in the VOCALOID Lyrics Wiki, you should note the following:</p>
        <ul>
          <li>
            The wikitext code should be added on <b><i>Source Editor</i></b> (also known as Wiki Editor), not <i>Visual Editor</i>. <a href="https://en.wikipedia.org/wiki/Help:Editing" target="_blank" rel="noopener noreferrer">Click this link for a more detailed guide on editing.</a>
          </li>
          {
            addRedirectNote &&
            <li>
              Remember to add redirects to pages to make them more easily searchable on the wiki. For example, when adding a page titled "ハロー・ワールド (Hello World)", you should add a redirect titled "Hello World" to make the song page searchable. Refer to <a href={`${import.meta.env.VITE_VLW_WIKI_DOMAIN}${import.meta.env.VITE_WIKI_ENTRYPOINT}/Help:Song_Article_Guideline#After_the_page_is_done`} target="_blank" rel="noopener noreferrer">this guideline on VOCALOID Lyrics Wiki</a> for more information.
            </li>
          }
        </ul> 
      </Message>
    </div>
  )
}