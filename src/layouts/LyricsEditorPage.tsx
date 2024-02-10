import { useState, useRef, useEffect } from 'react';
import { 
  Grid, GridColumn, GridRow, Divider,
  Form, 
  Input, Dropdown, TextArea,
  Popup, Button, Checkbox, ButtonGroup, Label
} from 'semantic-ui-react';

import LyricsInputTable from '../components/handsontables/LyricsInputTable';

import useTwoWayBinding from '../hooks/useTwoWayBinding';

import { CONST_TOOLTIPS_LYRICS_EDITOR } from '../constants/tooltips';
import Tooltip from '../components/reusables/Tooltip';

import CopyButton from '../components/reusables/CopyButton';

import { lyricsEditorFormInterface } from "../types";
import { generateLyricsTable, detonePinyin } from "../utils";
import { Lyric } from "../generators/classes";

function _parseLyricsTablesFromSourceCode(sourceCode: string): string[] {
  const lyricsTables = sourceCode.match(/\{\|\s*style\s*=.*?\|\}/gs);
  if (lyricsTables === null) {
    return [];
  }
  return lyricsTables.map(el => el.toString());
}
function _parseLyricsFromTable(sourceCode: string): {
  headers: string[], lyrics: string[][]
} {  
  let headerMatchResults = /(?<=\{\|.*\n)(?:\|'{2,}(\w+)'{2,}\s*\n)(?:\|'{2,}(\w+)'{2,}\s*\n)?(?:\|'{2,}(\w+)'{2,}\s*\n)?/gm
    .exec(sourceCode);
  let headers: string[] = [];
  if (headerMatchResults === null) {
    headers = ['Original', 'Romanized', 'English'];
  } else {
    headers = [
      headerMatchResults[1] || 'Original', 
      headerMatchResults[2] || 'Romanized', 
      headerMatchResults[3] || 'English'
    ]
  }

  let lyrics: string[][] = [];
  let lineMatchResults = sourceCode.matchAll(/\|-(.*?)\n(.*?)\n(?=\|-|\|\})/gs);
  for (let line of lineMatchResults) {

    const [_, customStyle, lines] = line;
    
    let customColourMatch = /style\s*=\s*["']\s*color\s*:\s*([#a-zA-Z0-9]+)\s*;?\s*["']/g.exec(customStyle);
    let customColour = customColourMatch === null ? '' : customColourMatch[1] || '';

    let rxResults = lines.matchAll(/(?<=\n\||^\|).*?(?=\n\||$)/gs);
    let splitLyrics = Array.from(rxResults).map(res => res[0]);

    if (splitLyrics.length === 1) {
      const rxCheckSharedColumn = /^\s*(\{\{shared[^\}]*\}\}|colspan=["']\d+["']\s*\|)/gi
      let sharedRow = splitLyrics[0];
      if (sharedRow.match(/^\s*<br\s*\/?\s*>\s*$/)) {
        lyrics.push([customColour, '', '', '']);
      } else if (sharedRow.match(rxCheckSharedColumn)) {
        sharedRow = sharedRow.replace(rxCheckSharedColumn, '');
        lyrics.push([customColour, sharedRow, sharedRow, sharedRow]);
      } else {
        lyrics.push([customColour, splitLyrics[0] || '', '', '']);
      }
    } else {
      lyrics.push([
        customColour, 
        splitLyrics[0] || '',
        splitLyrics[1] || '',
        splitLyrics[2] || ''
      ]);
    }
  }

  return { headers, lyrics };
}
function _decapitalizeRomanization(lyrics: string[][]): string[][] {
  return lyrics.map((lyric) => {
    lyric[2] = (lyric[2] || '').trim().replace(/^\w/, (match: string) => {
      return match.toLowerCase();
    });
    lyric[2] = lyric[2].replace(/\.\s*(\w)/g, (_, match: string) => {
      return `. ${match.toLowerCase()}`;
    });
    return lyric;
  });
}
function _detonePinyinLyrics(lyrics: string[][]): string[][] {
  return lyrics.map((lyric) => {
    lyric[2] = detonePinyin((lyric[2] || '').trim(), true);
    return lyric;
  });
}
function _standardizeHepburnRomanization(lyrics: string[][]): string[][] {
  return lyrics.map((lyric) => {
    lyric[2] = (lyric[2] || '').trim().replace(/(?=\b)(wo|he)(?<=\b)/gi, (match: string) => {
      switch (match) {
        case 'wo':
          return 'o';
        case 'he':
          return 'e';
        default:
          return ''
      }
    });
    lyric[2] = (lyric[2] || '').trim().replace(/dzu/gi, 'zu');
    return lyric;
  });
}

export default function LyricsEditorPage() {

  const refLyrics = useRef(null);

  useEffect(() => {
    // @ts-ignore
    const lyricsTable = refLyrics.current?.hotInstance;
    lyricsTable?.loadData(
      Array(20).fill(null).map(_ => (["", "", "", ""]))
    );
  }, []);

  const [headersText, setHeadersText] = useState<string[]>(
    ['Colour', 'Original', 'Romanized', 'English']
  );
  const [lyricsTables, setLyricsTables] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [formData, setFormData] = useState<lyricsEditorFormInterface>({
    translator: "",
    isOfficialTranslation: false,
    outputThirdColumn: false
  });
  const [results, setResults] = useState<string>('');
  const [controlOpenTools, setControlOpenTools] = useState<{ spC: boolean, wkF: boolean }>({
    spC: false, wkF: false
  });

  const { bindInput, bindCheckbox } = useTwoWayBinding<lyricsEditorFormInterface>(formData, setFormData);

  return (
  <>
  <Form>

    {/* Source Code Input */}
    <h3>
      <span>
        Input Wiki Page Source Code:
      </span>
      <Tooltip content={CONST_TOOLTIPS_LYRICS_EDITOR.sourceInput} />
    </h3>
    
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
    <Label basic color='violet' size='large'>
      {
        lyricsTables.length === 0 ?
        'No lyrics tables found'
        :
        (
          <>
          Extract table 
          <Dropdown 
            className='select-table'
            compact selection
            text={`${selectedIndex+1}`}
            options={
              Array(lyricsTables.length).fill(null).map((_, idx) => ({
                key: idx, text: idx+1, value: idx
              }))
            }
            value={selectedIndex}
            onChange={(_, data) => {
              setSelectedIndex(+(data?.value || 0))
            }}
          />
          of {lyricsTables.length}
          </>
        )
      }
    </Label>
    </div>
    <TextArea 
      rows={20}
      onInput={(_, data) => {
        const parsedTables = _parseLyricsTablesFromSourceCode(`${data?.value || ''}`);        
        setLyricsTables(parsedTables);
      }}
    />
    <Button 
      color='violet' size='large' fluid style={{ marginTop: '10px' }}
      onClick={() => {
        const selectedTable = lyricsTables[selectedIndex];
        const { headers, lyrics } = _parseLyricsFromTable(selectedTable);
        setHeadersText(['Colour', ...headers]);
        // @ts-ignore
        const lyricsTable = refLyrics.current?.hotInstance;
        lyricsTable?.loadData(lyrics);
      }}
    >
      Extract Lyrics Table
    </Button>

    <Divider />

    {/* Lyrics Output */}
    <h3>Parsed Lyrics:</h3>
    <LyricsInputTable
      headersText={headersText}
      needsRomanization={true}
      needsEnglishTranslation={true} 
      ref={refLyrics}
    />

    <br />

    <Grid stackable verticalAlign='middle'>
      <GridRow>
        <GridColumn width={3}>
          <h4>Translator:</h4>
        </GridColumn>
        <GridColumn width={10}>
          <Input fluid {...bindInput('translator')} />
        </GridColumn>
        <GridColumn width={3}>
          <Checkbox 
            label='Is official translation?' 
            {...bindCheckbox('isOfficialTranslation')} 
          />
        </GridColumn>
      </GridRow>
      <GridRow>
        <GridColumn width={16}>
          <Checkbox 
            label='Must show English lyrics column' 
            {...bindCheckbox('outputThirdColumn')} 
          />
        </GridColumn>
      </GridRow>
    </Grid>

    <br />

    <Divider />

    {/* Glossary */}
    <ButtonGroup widths='3'>
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
            <b>Link to wikipedia</b>: [[wikipedia:Page_name|displayed text]]<br />
            <b>Link to other FANDOM wiki</b>: [[w:c:Wiki_name:Page_name|displayed text]]
          </div>
        }
        on='click'
        open={controlOpenTools.wkF}
        onOpen={() => setControlOpenTools({ ...controlOpenTools, wkF: true })}
        onClose={() => setControlOpenTools({ ...controlOpenTools, wkF: false })}
      />
    </ButtonGroup>

    <Divider />

    <Divider />

    {/* Additional Buttons */}
    <ButtonGroup widths='3'>
      <Button 
        color='teal'
        onClick={() => {
          // @ts-ignore
          const lyricsTable = refLyrics.current?.hotInstance;
          let lyrics = lyricsTable.getData();
          lyrics = _decapitalizeRomanization(lyrics);
          lyricsTable?.loadData(lyrics);
        }}
      >
        Decapitalize romanized lyrics
      </Button>
      <Button 
        color='teal'
        onClick={() => {
          // @ts-ignore
          const lyricsTable = refLyrics.current?.hotInstance;
          let lyrics = lyricsTable.getData();
          lyrics = _detonePinyinLyrics(lyrics);
          lyricsTable?.loadData(lyrics);
        }}
      >
        Pinyin: Remove tones
      </Button>
      <Button 
        color='teal'
        onClick={() => {
          // @ts-ignore
          const lyricsTable = refLyrics.current?.hotInstance;
          let lyrics = lyricsTable.getData();
          lyrics = _standardizeHepburnRomanization(lyrics);
          lyricsTable?.loadData(lyrics);
        }}
      >
        Romaji: Change 'wo'→'o', 'he'→'e', 'dzu'→'zu'
      </Button>
    </ButtonGroup>

    <Divider />

    {/* Main Button */}
    <Button 
      color='violet' 
      size='large'
      fluid
      onClick={() => {
        // @ts-ignore
        const lyricsTable = refLyrics.current?.hotInstance;
        const lyrics = lyricsTable.getData()?.map((arr: string[]) => (
          new Lyric(true, true, ...arr)
        ));
        const output = generateLyricsTable(lyrics, {
          langOptions: {
            headersText: [headersText[1], headersText[2], headersText[3]],
            needsRomanization: true,
            needsEnglishTranslation: true
          },
          translator: formData.translator.trim(),
          isOfficialTranslation: formData.isOfficialTranslation,
          bgColour: 'black',
          fgColour: 'white',
          overrideShowEnglishColumn: formData.outputThirdColumn
        });
        setResults(output);
      }}
    >
      Generate
    </Button>

    <Divider />

    <br />

    <Divider />

    {/* Generated Results */}
    <h3 className='centered-header'>
      <span className='before-button'>Results</span>
      <CopyButton copyState={results} />
    </h3>
    <TextArea 
      rows={40} 
      value={results} 
      onChange={(_, data) => setResults(`${data?.value}` || '')}
    />

  </Form>
  </>
  )
}