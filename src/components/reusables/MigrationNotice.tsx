import { Message, MessageHeader } from 'semantic-ui-react';

export default function MigrationNotice() {
  return (
    <div style={{marginBottom: '30px'}}>
      <Message style={{padding: '30px 25px'}}>
        <MessageHeader style={{fontSize: '1.5rem', marginBottom: '20px'}}>
          <strong>IMPORTANT NOTICE</strong>: VOCALOID Lyrics Wiki Migration
        </MessageHeader>
        <p style={{fontSize: '1.2rem'}}><strong>The VOCALOID Lyrics Wiki is migrating from <a href="https://vocaloidlyrics.fandom.com/Vocaloid_Lyrics_Wiki" title="VOCALOID Lyrics Wiki on FANDOM" target="_blank" rel="noopener noreferrer">https://vocaloidlyrics.fandom.com</a> to <a href={`${import.meta.env.VITE_VLW_WIKI_DOMAIN}`} title="VOCALOID Lyrics Wiki on Miraheze" target="_blank">{`${import.meta.env.VITE_VLW_WIKI_DOMAIN}`}</a></strong>.</p>
        <p>Many template changes and new features have been introduced to accommodate this move, and it is not guaranteed that these template changes will work on the old site. As such, <span style={{color:'red'}}><strong>you should not use the output generated on this site to create/edit pages on https://vocaloidlyrics.fandom.com.</strong></span></p>
      </Message>
    </div>
  )
}