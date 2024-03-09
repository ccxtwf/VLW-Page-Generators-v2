import { Message, MessageHeader } from 'semantic-ui-react';

export default function FirstTimeEditorNote({ addRedirectNote = false }: { addRedirectNote?: boolean }) {
  return (
    <div>
      <Message>
        <MessageHeader>First Time Editing?</MessageHeader>
        <p>If this is your first time adding a page in the VOCALOID Lyrics Wiki, you should note the following:</p>
        <ul>
          <li>
            The wikitext code should be added in <b><i>Source Editor</i></b>, not <i>Visual Editor</i>. <a href="https://community.fandom.com/wiki/Help:Source_editor" target="_blank" rel="noopener noreferrer">What is the difference between the two?</a>
          </li>
          {
            addRedirectNote &&
            <li>
              Remember to add redirects to pages to make them more easily searchable on the wiki. For example, when adding a page titled "ハロー・ワールド (Hello World)", you should add a redirect titled "Hello World" to make the song page searchable. Refer to <a href="https://vocaloidlyrics.fandom.com/wiki/Vocaloid_Lyrics_Wiki:Song_Article_Guideline#After_the_page_is_done" target="_blank" rel="noopener noreferrer">this guideline</a> for more information.
            </li>
          }
        </ul> 
      </Message>
    </div>
  )
}