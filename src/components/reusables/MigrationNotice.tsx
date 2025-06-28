import { Message, MessageHeader } from 'semantic-ui-react';

export default function MigrationNotice() {
  return (
    <div style={{marginBottom: '30px'}}>
      <Message style={{padding: '30px 25px'}}>
        <MessageHeader style={{fontSize: '1.5rem', marginBottom: '20px'}}>
          <strong>IMPORTANT NOTICE</strong>: VOCALOID Lyrics Wiki Migration
        </MessageHeader>
        <p style={{fontSize: '1.2rem'}}><strong>The VOCALOID Lyrics Wiki has migrated from <a href="https://vocaloidlyrics.fandom.com/Vocaloid_Lyrics_Wiki" title="VOCALOID Lyrics Wiki on FANDOM" target="_blank" rel="noopener noreferrer">https://vocaloidlyrics.fandom.com</a> to <a href={`${import.meta.env.VITE_VLW_WIKI_DOMAIN}`} title="VOCALOID Lyrics Wiki on Miraheze" target="_blank">{`${import.meta.env.VITE_VLW_WIKI_DOMAIN}`}</a></strong>.</p>
        <p>As of June 2025, the VOCALOID Lyrics Wiki on FANDOM has closed on request of the original wiki administration team.</p>
      </Message>
    </div>
  )
}