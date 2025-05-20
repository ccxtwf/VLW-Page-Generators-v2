import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Grid, GridColumn, GridRow, Divider,
  Form, 
  Input, Dropdown, TextArea, Icon, IconGroup,
  Popup, Button, Checkbox, ButtonGroup, Label
} from 'semantic-ui-react';

import LyricsInputTable from '../components/handsontables/LyricsInputTable';

import useTwoWayBinding from '../hooks/useTwoWayBinding';

import { CONST_TOOLTIPS_LYRICS_EDITOR } from '../constants/tooltips';

import CopyButton from '../components/reusables/CopyButton';

import { IDictionary, lyricsEditorFormInterface } from "../types";
import { generateLyricsTable, detonePinyin } from "../utils";
import { Lyric } from "../generators/classes";

function _parseLyricsTablesFromSourceCode(wikipageContents: string): RegExpExecArray[] {
  const rx = /(\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]toggle[^\}]+\}\}(?:.*?)|)(\{\|\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]table[ _]class\}\}\s*\n\|-\s*class\s*=\s*["'][^\n]*\blyrics-table-header\b[^\n]*["']\s*\n!\s*\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]header\}\})\s*\n(.*?\|\})\s*(\{\{(?:[Tt]emplate:|)[Tt]ranslator[^\}]*\}\}|)/gs;
  return Array.from(wikipageContents.matchAll(rx));
}

function _parseLyricsToggleParameters(lyricsToggleWikitext: string): { toggleElement: string, headers: string[], isoLangCode: string | null, miscParams: IDictionary<string> } {
  const headers: string[] = [];
  let isoLangCode = null;
  const miscParams: IDictionary<string> = {};
  const template = lyricsToggleWikitext.match(/\{\{(?:[Tt]emplate:|)[Ll]yrics[ _]toggle\|(.*)\}\}/);
  
  if (template === null || template[1] === '') {
    return { 
      toggleElement: template === null ? '' : template[0], 
      headers, isoLangCode, miscParams 
    };
  } 
  for (let param of template[1].split('|')) {
    if (param.includes('=')) {
      const [_, paramKey, paramValue] = param.match(/^\s*(.*?)\s*=\s*(.*)\s*$/) || ['', '', ''];
      switch (paramKey) {
        case 'iso-lang':
          isoLangCode = paramValue;
          break;
        default:
          miscParams[paramKey] = paramValue;
          break;
      }
    } else {
      headers.push(param.replace(/^.*?:\s*?(.*)\s*?$/, '$1'));
    }
  }
  return { toggleElement: template[0], headers, isoLangCode, miscParams };
}
  
function _parseLyricsFromTable(table: RegExpExecArray): { 
  lyrics: string[][], toggleElement: string, headers: string[], isoLangCode: string | null, numColumns: number 
} {
  const lyrics = [];
  let numColumns = 0;

  const [ _, tableDefinition, tableHead, tableBody ] = table;

  const { toggleElement, headers, isoLangCode } = _parseLyricsToggleParameters(tableDefinition);
  
  const tableRows = Array.from(tableBody.matchAll(/\|-(.*?)\n([^]*?)\n(?=\|-|\|\})/g))
    .map(function (tableRow) {
      const contents = tableRow[0];
      const m = tableRow[1].match(/style\s*=\s*["']\s*([^\n]*?)\s*;*\s*["']/);
      const customStyle = m === null ? '' : m[1]+';';
      const lines = tableRow[2];
      const rxResults = lines.matchAll(/(?<=\n\||^\|).*?(?=\n\||$)/g);
      const splitLyrics = Array.from(rxResults).map((res) => res[0]);
      numColumns = Math.max(numColumns, splitLyrics.length);
      return { contents, customStyle, splitLyrics };
    });
  numColumns = Math.min(+import.meta.env.VITE_LYRICS_TABLE_MAX_COLUMNS+1, numColumns);

  for (let tableRow of tableRows) {
    const { customStyle, splitLyrics } = tableRow;
    if (splitLyrics.length === 1) {
      const rxCheckSharedColumn = /^\s*(\{\{(?:[Tt]emplate:|)shared[^\}]*\}\}|colspan=\s*(?:["']|)\s*\d+\s*(?:["']|)\s*\|)/gi;
      let sharedRow = splitLyrics[0];
      if (sharedRow.match(/^\s*<br\s*\/?\s*>\s*$/)) {
        let lyricRow = [customStyle];
        for (let j = 0; j < numColumns; j++) {
          lyricRow.push('');
        }
        lyrics.push(lyricRow);
      } else if (sharedRow.match(rxCheckSharedColumn)) {
        sharedRow = sharedRow.replace(rxCheckSharedColumn, '');
        let lyricRow = [customStyle];
        for (let j = 0; j < numColumns; j++) {
          lyricRow.push(sharedRow);
        }
        lyrics.push(lyricRow);
      } else {
        let lyricRow = [customStyle, splitLyrics[0] || ''];
        for (let j = 1; j < numColumns; j++) {
          lyricRow.push('');
        }
        lyrics.push(lyricRow);
      }
    } else {
      let lyricRow = [customStyle];
      for (let j = 0; j < numColumns; j++) {
        lyricRow.push(splitLyrics[j] || '');
      }
      lyrics.push(lyricRow);
    }
  }
  
  return { lyrics, toggleElement, headers, isoLangCode, numColumns };
}

function _consolidateCellInlineColourFormatting(lyrics: string[][]): string[][] {
  const rxCellInlineColourFormatting = /^\s*<[Ss][Pp][Aa][Nn]\s+style\s*=\s*["']\s*color\s*:\s*([a-zA-Z0-9#]+);?["']\s*>(.*)<\/\s*[Ss][Pp][Aa][Nn]\s*>\s*$/;
  const rxSpanTagHead = /<span(?:\s+[^>]+|)\s*>/i;
  return lyrics.map((lyric) => {
    let m = [];
    for (let i = 1; i < lyric.length; i++) {
      const l = (lyric[i] || '').trim()
      const rxResults = l.match(rxCellInlineColourFormatting);
      m.push({ rxResults, isEmpty: l === '' });
    }
    if (m.every((el => el.isEmpty || !!el.rxResults))) {
      // Skip if the contents enclosed within the span tags in the original lyrics contain another span tag.
      if (!!m[0].rxResults && !m[0].rxResults[2].match(rxSpanTagHead)) {
        lyric[0] = m[0].rxResults[1];
        for (let i = 1; i < lyric.length; i++) {
          //@ts-ignore
          if (!!m[i-1].rxResults) lyric[i] = m[i-1].rxResults[2];
        }
      }
    }
    return lyric;
  })
}
function _decapitalizeRomanization(lyrics: string[][]): string[][] {
  return lyrics.map((lyric) => {
    lyric[2] = (lyric[2] || '').trim().replace(/^(?:["'`]*)\w/, (match: string) => {
      return match.toLowerCase();
    });
    lyric[2] = lyric[2].replace(/([\.\?!])\s*(["'`]*\s*)(\w)/g, (_, p: string, a: string, match: string) => {
      return `${p} ${a}${match.toLowerCase()}`;
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
      Array(20).fill(null).map(_ => (["", "", "", "", "", ""]))
    );
  }, []);

  const [lyricsTables, setLyricsTables] = useState<RegExpExecArray[]>([]);
  const [headersText, setHeadersText] = useState<string[]>([
    'Original', 'Romanized', 'English', 
    ...Array(import.meta.env.VITE_LYRICS_TABLE_MAX_COLUMNS-3).fill(0).map((_, i) => `Column ${i+4}`)
  ]);
  const [hideColumns, setHideColumns] = useState<number[]>(
    Array(import.meta.env.VITE_LYRICS_TABLE_MAX_COLUMNS-3).fill(0).map((_, i) => i+4)
  );
  // const [lyricsToggleWikitext, setLyricsToggleWikitext] = useState<string>('');
  const [isoLangCode, setIsoLangCode] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [formData, setFormData] = useState<lyricsEditorFormInterface>({
    translator: "",
    isOfficialTranslation: false,
  });
  const [results, setResults] = useState<string>('');
  const [controlOpenTools, setControlOpenTools] = useState<{ spC: boolean, wkF: boolean }>({
    spC: false, wkF: false
  });

  const { bindInput, bindCheckbox } = useTwoWayBinding<lyricsEditorFormInterface>(formData, setFormData);

  const [isMobileViewport, setIsMobileViewport] = useState(
    window.matchMedia("(max-width: 768px)").matches
  );
  useEffect(() => {
    window
      .matchMedia("(max-width: 768px)")
      .addEventListener('change', e => setIsMobileViewport( e.matches ));
  }, []);

  const handleOnClickedParseButton = useMemo(() => () => {
    if (selectedIndex === -1 || lyricsTables.length === 0) return;
    const selectedTable = lyricsTables[selectedIndex];
    const { lyrics, toggleElement, headers, isoLangCode, numColumns } = _parseLyricsFromTable(selectedTable);
    setIsoLangCode(isoLangCode || '');
    // @ts-ignore
    document.getElementById('lyrics-toggle').value = toggleElement;
    setHeadersText(headers);
    if (numColumns >= import.meta.env.VITE_LYRICS_TABLE_MAX_COLUMNS) {
      setHideColumns([]);
    } else {
      const h = [];
      for (let i = 1; i <= import.meta.env.VITE_LYRICS_TABLE_MAX_COLUMNS-numColumns; i++) {
        h.push(numColumns+i);
      }
      setHideColumns(h);
    }
    // @ts-ignore
    const lyricsTable = refLyrics.current?.hotInstance;
    lyricsTable?.loadData(lyrics);
    const mTranslator = selectedTable[0].match(/\{\{(?:[Tt]emplate:|)[Tt]ranslator\|\s*([^\}]+?)\s*\}\}/);
    //@ts-ignore
    document.getElementById('translator-input').value = mTranslator === null ? '' : mTranslator[1];
    //@ts-ignore
    document.getElementById('is-official-translator-input').checked = (selectedTable[0].match(/\{\{(?:[Tt]emplate:|)[Oo]fficialEnglishNotify\s*\}\}/) !== null);
    setFormData({
      //@ts-ignore
      translator: document.getElementById('translator-input').value,
      //@ts-ignore
      isOfficialTranslation: document.getElementById('is-official-translator-input').checked,
    });
  }, [selectedIndex, lyricsTables]);

  const handleOnClickedGenerateButton = useMemo(() => () => {
    // @ts-ignore
    const lyricsTable = refLyrics.current?.hotInstance;
    const skipColumns = lyricsTable?.getSettings()?.hiddenColumns?.columns;
    const lyrics = lyricsTable.getData()?.map((arr: string[]) => (
      new Lyric({ 
        hasAdditionalColumns: true,
        skipColumns,
      },
      ...arr)
    ));
    const output = generateLyricsTable(lyrics, {
      langOptions: {
        headersText: headersText,
        skipColumns,
      },
      isoLangCode,
      translator: formData.translator.trim(),
      isOfficialTranslation: formData.isOfficialTranslation,
      bgColour: 'black',
      fgColour: 'white',
    });
    setResults(output);
  }, [formData, headersText, isoLangCode]);

  return (
  <>
  <Form>

    {/* Source Code Input */}
    <h3>
      <Popup
        content={CONST_TOOLTIPS_LYRICS_EDITOR.sourceInput}
        mouseLeaveDelay={1500}
        on='hover'
        inverted
        position="bottom center"
        size='tiny'
        trigger={
          <div className='centered-header'>
            Input Wiki Page Source Code:&nbsp;
            <IconGroup>
              <Icon name='help circle' />
              <Icon corner='top right' name='asterisk' color='red' />
            </IconGroup>
          </div>
        }
        style={{ zIndex: '1000' }}
      />
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
        setSelectedIndex(parsedTables.length === 0 ? -1 : 0);
      }}
    />
    <Button 
      color='violet' size='large' fluid style={{ marginTop: '10px' }}
      onClick={handleOnClickedParseButton}
    >
      Extract Lyrics Table
    </Button>

    <Divider />
    
    <h3>Parsed Lyrics:</h3>
    <Grid stackable verticalAlign='middle'>
      <GridRow>
        <GridColumn width={3}>
          <h4>Lyrics Toggle Wikitext:</h4>
        </GridColumn>
        <GridColumn width={13}>
          <Input 
            id="lyrics-toggle"
            fluid 
            placeholder="{{lyrics toggle|jp:Japanese|rom:Romaji|eng:English}}"
            onBlur={(e: Event) => {
              //@ts-ignore
              const newValue: string = e?.target?.value || '';
              // setLyricsToggleWikitext(newValue);
              const res = _parseLyricsToggleParameters(newValue);
              setIsoLangCode(res.isoLangCode ?? '');
              if (res.headers !== null) setHeadersText(res.headers);
            }}
          />
        </GridColumn>
      </GridRow>
    </Grid>

    <br />

    {/* Lyrics Output */}
    <LyricsInputTable
      headersText={['Row styling' , ...headersText]}
      hideColumns={hideColumns}
      allowColumnAdditionRemoval={true}
      ref={refLyrics}
    />

    <br />

    <Grid stackable verticalAlign='middle'>
      <GridRow>
        <GridColumn width={3}>
          <h4>Translator:</h4>
        </GridColumn>
        <GridColumn width={10}>
          <Input fluid {...bindInput('translator')} id='translator-input' />
        </GridColumn>
        <GridColumn width={3}>
          <Checkbox 
            id='is-official-translator-input'
            label='Is official translation?' 
            {...bindCheckbox('isOfficialTranslation')} 
          />
        </GridColumn>
      </GridRow>
      {/* <GridRow>
        <GridColumn width={16}>
          <Checkbox 
            label='Must show English lyrics column' 
            {...bindCheckbox('outputThirdColumn')} 
          />
        </GridColumn>
      </GridRow> */}
    </Grid>

    <br />

    <Divider />

    {/* Glossary */}
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
            <b>Link to wikipedia</b>: [[wikipedia:Page_name|displayed text]]<br />
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

    <Divider />

    <Divider />

    {/* Additional Buttons */}
    <ButtonGroup 
      widths={isMobileViewport ? 2 : 4} 
      vertical={isMobileViewport} 
      compact={isMobileViewport}
      fluid
    >
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
          lyrics = _consolidateCellInlineColourFormatting(lyrics);
          lyricsTable?.loadData(lyrics);
        }}
      >
        Consolidate per-cell span colour formatting to per-row
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
    </ButtonGroup>

    <Divider />

    {/* Main Button */}
    <Button 
      color='violet' 
      size='large'
      fluid
      onClick={handleOnClickedGenerateButton}
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