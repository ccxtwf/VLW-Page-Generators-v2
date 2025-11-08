import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Grid, GridColumn, GridRow, Divider,
  Form, 
  Input, Dropdown, TextArea, Icon, IconGroup,
  Popup, Button, Checkbox, ButtonGroup, Label
} from 'semantic-ui-react';

import LyricsInputTable from '../components/handsontables/LyricsInputTable';

import useTwoWayBinding from '../hooks/useTwoWayBinding';

import { LYRICS_EDITOR_TOOLTIPS } from "../tooltips/lyrics-editor";

import CopyButton from '../components/reusables/CopyButton';
import WikiFormatGlossary from '../components/reusables/WikiFormatGlossary';

import { LyricsEditorForm } from "../types";
import { generateLyricsTable } from "../utils";
import { Lyric } from "../generators/classes";

import { 
  parseLyricsTablesFromSourceCode, 
  parseLyricsToggleParameters,
  parseLyricsFromTable,
  consolidateCellInlineColourFormatting,
  decapitalizeRomanization,
  detonePinyinLyrics,
  standardizeHepburnRomanization,
} from "../utils/lyrics-editor";


export default function LyricsEditorPage() {

  const refLyrics = useRef(null);

  useEffect(() => {
    // @ts-ignore
    const lyricsTable = refLyrics.current?.hotInstance;
    lyricsTable?.loadData(
      Array(20).fill(null).map(_ => (["", "", "", "", "", ""]))
    );
  }, []);

  const [lyricsTables, setLyricsTables] = useState<RegExpMatchArray[]>([]);
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
  const [formData, setFormData] = useState<LyricsEditorForm>({
    translator: "",
    isOfficialTranslation: false,
  });
  const [results, setResults] = useState<string>('');
  

  const { bindInput, bindCheckbox } = useTwoWayBinding<LyricsEditorForm>(formData, setFormData);

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
    const { lyrics, toggleElement, headers, isoLangCode, numColumns } = parseLyricsFromTable(selectedTable);
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
    let output = '';
    //@ts-ignore
    output += document.getElementById('lyrics-toggle')?.value || '';
    output += '\n';
    output += generateLyricsTable(lyrics, {
      langOptions: {
        headersText: headersText,
        skipColumns,
      },
      isoLangCode,
      translator: formData.translator.trim(),
      isOfficialTranslation: formData.isOfficialTranslation,
      bgColour: 'black',
      fgColour: 'white',
      createToggleElement: false,
    });
    setResults(output);
  }, [formData, headersText, isoLangCode]);

  return (
  <>
  <Form>

    {/* Source Code Input */}
    <h3>
      <Popup
        content={LYRICS_EDITOR_TOOLTIPS.SourceInput}
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
        const parsedTables = parseLyricsTablesFromSourceCode(`${data?.value || ''}`);        
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
              const res = parseLyricsToggleParameters(newValue);
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

    <WikiFormatGlossary isMobileViewport={isMobileViewport} />

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
          lyrics = decapitalizeRomanization(lyrics);
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
          lyrics = consolidateCellInlineColourFormatting(lyrics);
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
          lyrics = standardizeHepburnRomanization(lyrics);
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
          lyrics = detonePinyinLyrics(lyrics);
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