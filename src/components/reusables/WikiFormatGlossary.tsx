import { useState } from 'react';
import { 
  Grid, GridColumn, GridRow, 
  ButtonGroup, Button, 
  Popup,
} from 'semantic-ui-react';

export default function WikiFormatGlossary({ isMobileViewport }: { isMobileViewport: boolean }) {
  const [controlOpenTools, setControlOpenTools] = useState<{ spC: boolean, wkF: boolean }>({
    spC: false, wkF: false
  });

  return (
    <ButtonGroup 
      widths={isMobileViewport ? 1 : 2} 
      vertical={isMobileViewport} 
      compact={isMobileViewport}
      fluid
    >
      <Popup
        trigger={
          <Button basic color='green'>
            Open mini-library of special characters
          </Button>
        }
        wide
        position='top center'
        content={
          <Grid columns={2}>
            <GridRow>
              <GridColumn column={8}>
              A: ā á ǎ à Ā Á Ǎ À
              </GridColumn>
              <GridColumn column={8}>
              I: ī í ǐ ì Ī Í Ǐ Ì
              </GridColumn>
            </GridRow>
            <GridRow>
              <GridColumn column={8}>
              U: ū ú ǔ ù Ū Ú Ǔ Ù
              </GridColumn>
              <GridColumn column={8}>
              Ü: ǖ ǘ ǚ ǜ Ǖ Ǘ Ǚ Ǜ
              </GridColumn>
            </GridRow>
            <GridRow>
              <GridColumn column={8}>
              E: ē é ě è Ē É Ě È
              </GridColumn>
              <GridColumn column={8}>
              O: ō ó ǒ ò Ō Ó Ǒ Ò
              </GridColumn>
            </GridRow>
          </Grid>
        }
        on='click'
        open={controlOpenTools.spC}
        onOpen={() => setControlOpenTools({ ...controlOpenTools, spC: true })}
        onClose={() => setControlOpenTools({ ...controlOpenTools, spC: false })}
      />
      <Popup
        trigger={
          <Button basic color='green'>
            Show glossary of wikitext formatting
          </Button>
        }
        wide
        position='top center'
        content={
          <div>
            Bold: '''<b>bold</b>'''<br />
            Italics: ''<i>italic</i>''<br />
            Bold & Italic: '''''<b><i>bold & italic</i></b>'''''<br /><br />

            Strikethrough: &lt;s&gt;<s>strikethrough</s>&lt;/s&gt;<br />
            Superscript: 1&lt;sup&gt;st&lt;/sup&gt; (1<sup>st</sup>)<br />
            Small Text: &lt;small&gt;text&lt;/small&gt; (<small>text</small>)<br />
            Underlined: &lt;u&gt;<u>underline</u>&lt;/u&gt;<br />
            
            <hr />

            <b>Subscript</b>: O&lt;sub&gt;2&lt;/sub&gt; (O<sub>2</sub>)<br />
            <b>Big Text</b>: &lt;big&gt;text&lt;/big&gt; (<big>text</big>)<br />
            <b>In-line style</b>: &lt;span style="color:#000000"&gt;text&lt;span&gt;<br />
            <b>Internal link</b>: [[Page name]]<br />
            <b>Hyperlink (external website)</b>: [https://www.example.org displayed text]<br />
            <b>Link to wikipedia</b>: {`{{Wp|Page_name|displayed text}}`}<br />
            <b>Link to FANDOM wiki</b>: {`{{FandomWiki|Wiki_name|Page_name|displayed text}}`}<br />
            <b>Link to other Miraheze wiki</b>: [[mh:Wiki_name:Page_name|displayed text]]
          </div>
        }
        on='click'
        open={controlOpenTools.wkF}
        onOpen={() => setControlOpenTools({ ...controlOpenTools, wkF: true })}
        onClose={() => setControlOpenTools({ ...controlOpenTools, wkF: false })}
      />
    </ButtonGroup>
  );
}