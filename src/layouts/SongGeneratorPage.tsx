import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Grid, GridColumn, GridRow, Divider,
  Form, 
  Input, Dropdown, TextArea,
  Button, Checkbox, 
  Image,
  ImageGroup
} from 'semantic-ui-react';
import Tooltip from '../components/reusables/Tooltip';

import PlayLinksInputTable from '../components/handsontables/PlayLinksInputTable';
import LyricsInputTable from '../components/handsontables/LyricsInputTable';
import ExternalLinksInputTable from '../components/handsontables/ExternalLinksInputTable';

import CopyButton from '../components/reusables/CopyButton';
import DisplayError from '../components/reusables/DisplayErrors';
import PreloadFromVdb from '../components/reusables/PreloadFromVdb';

import useTwoWayBinding from '../hooks/useTwoWayBinding';
import useFetchListOfEngines from '../hooks/useFetchListOfEngines';
import { convertColourStringToHexCode, parseHeadersFromLanguages } from '../utils';

import { CONST_TOOLTIPS_SONG_PAGES } from '../constants/tooltips';
import { CONST_LANGUAGES } from '../constants/languages';

import { ENUM_CW_STATES, songPageFormInterface, displayErrorsInterface } from "../types";

import { parseInput, validate, autoloadCategories, generateSongPage } from "../generators/songPage";
import { fetchDataFromVocaDbForSongPage } from "../generators/fetch";

const defaultInputData: songPageFormInterface =  {
  cwState: ENUM_CW_STATES.noWarnings,
  cwText: '',
  hasEpilepsyWarning: false,
  origTitle: '',
  altChTitle: '',
  altChIsTraditional: true,
  romTitle: '',
  engTitle: '',
  titleIsOfficiallyTranslated: false,
  bgColour: 'black',
  fgColour: 'white',
  uploadDate: '',
  isAlbumOnly: false,
  isUnavailable: false,
  singers: '',
  producers: '',
  description: '',
  translator: '',
  isOfficialTranslation: false,
  categoriesRaw: ''
};

export default function SongGeneratorPage() {

  // STATES
  const [preload, setPreload] = useState<{url: string, loading: boolean}>({
    url: '',
    loading: false
  });

  // Form Data State
  const [formData, setFormData] = useState<songPageFormInterface>({
    ...defaultInputData
  });
  const [languageIds, setLanguageIds] = useState<number[]>([]);
  const [usedEngines, setUsedEngines] = useState<string[]>([]);
  
  const [imgProps, setImgProps] = useState<{
    src: string, alt: string, 
    href?: string, target?: "_blank", rel?:"noopener noreferrer"
    onLoad?: (e: Event) => void,
    onError?: (e: Event) => void
  }[]>([]);

  // const [showDarkMode, setShowDarkMode] = useState<boolean>(false);

  const [ignoreErrors, setIgnoreErrors] = useState<boolean>(false);
  const [results, setResults] = useState<string>('');
  const [elementsWithErrors, setElementsWithErrors] = useState<string[]>([]);
  const [notify, setNotify] = useState<displayErrorsInterface>({ 
    errors: [], 
    warnings: [],
    recommendToAutoloadCategories: false
  });
  
  // HANDSONTABLES
  const refLyrics = useRef(null);
  const refPlayLinks = useRef(null);
  const refExtLinks = useRef(null);

  const { bindInput, bindTextArea, bindCheckbox, bindDropdown } = useTwoWayBinding<songPageFormInterface>(formData, setFormData);

  const engines = useFetchListOfEngines();

  const languages = useMemo(() => (
    languageIds.map((el: number) => CONST_LANGUAGES[el])
  ), [languageIds]);
  const [ needsRomanization, needsEnglishTranslation, headersText, isChinese ] = useMemo(() => (
    parseHeadersFromLanguages(languages)
  ), [languages]);
  const bindElementWithErrorNotification = useMemo(() => (
    (key: string) => {
      if (elementsWithErrors.includes(key)) return 'error'
      else return '';
    }
  ), [elementsWithErrors]);

  // Load default data
  useEffect(() => {
    // @ts-ignore
    refLyrics.current?.hotInstance?.loadData(
      Array(20).fill(null).map(_ => (["", "", "", ""]))
    );
    // @ts-ignore
    refPlayLinks.current?.hotInstance?.loadData([
      ['YouTube', '', false, false, false, ''],
      ['Niconico', '', false, false, false, ''],
      ['bilibili', '', false, false, false, ''],
      ['piapro', '', false, false, false, ''],
      ['SoundCloud', '', false, false, false, '']
    ]);
    // @ts-ignore
    refExtLinks.current?.hotInstance?.loadData(
      Array(5).fill(null).map(_ => ['', '', false])
    );
  }, []);

  function handleFetchFromVocadb() {
    if (window.confirm('Are you sure you want to continue? This will reset all data in the page.')) {
      clearForm(true);
      setPreload({ ...preload, loading: true });
      fetchDataFromVocaDbForSongPage(preload.url)
        .then( data => {
          const { 
            formData: { 
              languageIds, origTitle, romTitle, engTitle, 
              uploadDate, singers, engines, producers, 
              imageProps
            }, 
            playLinksData, extLinksData 
          } = data;

          // SET INTERNAL STATES
          setFormData({
            ...defaultInputData,
            origTitle, romTitle, engTitle, 
            uploadDate, singers, producers
          })
          setLanguageIds(() => languageIds);
          setUsedEngines(() => engines);
          setImgProps(() => imageProps);

          // SET DOM
          // @ts-ignore
          document.getElementById("song-generator-input-origTitle").value = origTitle;
          // @ts-ignore
          document.getElementById("song-generator-input-romTitle").value = romTitle;
          // @ts-ignore
          document.getElementById("song-generator-input-engTitle").value = engTitle;
          // @ts-ignore
          document.getElementById("song-generator-input-uploadDate").value = uploadDate;
          // @ts-ignore
          document.getElementById("song-generator-input-singers").value = singers;
          // @ts-ignore
          document.getElementById("song-generator-input-producers").value = producers;
          
          // SET HANDSONTABLE DATA
          // @ts-ignore
          refLyrics.current?.hotInstance?.loadData(
            Array(20).fill(null).map(_ => (["", "", "", ""]))
          );
          // @ts-ignore
          refPlayLinks.current?.hotInstance?.loadData(playLinksData);
          // @ts-ignore
          refExtLinks.current?.hotInstance?.loadData(extLinksData);
          window.alert('Finished fetching from VocaDB');
        })
        .catch((err) => {
          window.alert(err?.message || err);
        })
        .finally(() => {
          setPreload({ ...preload, loading: false });
        });
    }
  }

  function handleAutoloadCategories() {
    const categories = autoloadCategories({
      languageIds, needsEnglishTranslation, 
      engines: usedEngines, 
      singers: formData.singers, 
      producers: formData.producers, 
      isAlbumOnly: formData.isAlbumOnly,
      // @ts-ignore
      lyricsData: refLyrics.current?.hotInstance?.getData()
    });
    setFormData({ ...formData, categoriesRaw: categories.join('\n') });
  }

  function clearForm(autoConfirm: boolean = false) {
    if (autoConfirm || window.confirm('Are you sure you want to reset?')) {
      
      // Set states
      setPreload({ url: '', loading: false });
      setFormData({...defaultInputData});
      setLanguageIds([]);
      setUsedEngines([]);
      setImgProps([]);
      setIgnoreErrors(false);

      // Clear form
      //@ts-ignore
      document.getElementById('song-generator-form')?.reset();

      // Set Handsontable data
      // @ts-ignore
      refLyrics.current?.hotInstance?.loadData(
        Array(20).fill(null).map(_ => (["", "", "", ""]))
      );
      // @ts-ignore
      refPlayLinks.current?.hotInstance?.loadData([
        ['YouTube', '', false, false, false, ''],
        ['Niconico', '', false, false, false, ''],
        ['bilibili', '', false, false, false, ''],
        ['piapro', '', false, false, false, ''],
        ['SoundCloud', '', false, false, false, '']
      ]);
      // @ts-ignore
      refExtLinks.current?.hotInstance?.loadData(
        Array(5).fill(null).map(_ => ['', '', false])
      );

      setNotify({
        errors: [], warnings: [],
        recommendToAutoloadCategories: false
      });
      setElementsWithErrors([]);
      setResults('');

    }
  }

  function generateOutput() {
    const parsedInput = parseInput({
      data: {
        ...formData,
        languageIds, usedEngines
      }, 
      langOptions: {
        needsRomanization, needsEnglishTranslation, 
        headersText: [...headersText.slice(1)]
      }, 
      // @ts-ignore
      playLinksData: refPlayLinks.current?.hotInstance?.getData() || [],
      // @ts-ignore
      lyricsData: refLyrics.current?.hotInstance?.getData() || [],
      // @ts-ignore
      extLinksData: refExtLinks.current?.hotInstance?.getData() || []
    });

    const { errors, recommendToAutoloadCategories } = validate(parsedInput);
    let hasFatalError: boolean = false;
    const errMessages: string[] = [];
    const warnMessages: string[] = [];
    let setErrElements: Set<string> = new Set();
    for (let error of errors) {
      const [isFatal, msg, el] = error;
      if (isFatal) {
        hasFatalError = true;
        errMessages.push(msg.toString());
      } else {
        warnMessages.push(msg.toString());
      }
      setErrElements.add(el.toString());
    }
    setElementsWithErrors([...setErrElements]);
    setNotify({
      errors: errMessages,
      warnings: warnMessages,
      recommendToAutoloadCategories
    });
    
    if (!hasFatalError || ignoreErrors) {
      const output = generateSongPage(parsedInput);
      setResults(output);
    }

  }

  return (
  <>
  <Form id="song-generator-form">
  <Grid stackable verticalAlign='middle'>

    {/* VocaDB Pre-loader */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Pre-load from VocaDB:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.vdb} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <PreloadFromVdb 
          handleFetchFromVocadb={handleFetchFromVocadb}
          loading={preload.loading}
          setStateOnBlur={(value: string) => {
            setPreload({...preload, url: value});
          }}
          mode='S'
        />
      </GridColumn>
    </GridRow>

    <Divider />

    <GridRow>
      <GridColumn width={16}>
        <ImageGroup size='large'>
        {
          imgProps.map((img) => (
            <Image {...img} key={img.src} title={img.alt} />
          ))
        }
        </ImageGroup>
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Content Warnings */}
    <GridRow style={{paddingBottom: "20px"}}>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Content Warnings:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.cw} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="song-generator-input-cwText"
          fluid 
          placeholder="violent/mature content" 
          label={
            <Dropdown
              id="song-generator-input-cwState"
              selection
              options={[
                { key: 0, text: 'No warnings', value: ENUM_CW_STATES.noWarnings },
                { key: 1, text: 'Questionable', value: ENUM_CW_STATES.questionable },
                { key: 2, text: 'Explicit', value: ENUM_CW_STATES.explicit }
              ]}
              {...bindDropdown('cwState')}
              className={
                'cw-dropdown ' +
                (formData.cwState === ENUM_CW_STATES.questionable ? 'questionable' : 
                formData.cwState === ENUM_CW_STATES.explicit ? 'explicit' : '')
              }
            />
          }
          labelPosition='left'
          {...bindInput('cwText')}
          className={bindElementWithErrorNotification('cwText')}
        />
        <br />
        <Checkbox 
          id="song-generator-input-hasEpilepsyWarning"
          label='Epileptic Warning' 
          {...bindCheckbox('hasEpilepsyWarning')}
        />
      </GridColumn>
    </GridRow>

    {/* Song Language and Titles */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Song Language:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.language} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Dropdown
          placeholder='Song Language'
          fluid multiple selection
          options={CONST_LANGUAGES.map((el, idx) => {
            return { key: idx, text: el.name, value: idx }
          })}
          className={bindElementWithErrorNotification('languageIds')}
          value={languageIds}
          // @ts-ignore
          onChange={(_, data) => setLanguageIds(data.value)}
        />
      </GridColumn>
    </GridRow>
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Original title:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.origTitle} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="song-generator-input-origTitle"
          fluid placeholder="Original title" 
          className={bindElementWithErrorNotification('origTitle')}
          {...bindInput('origTitle')}
        />
      </GridColumn>
    </GridRow>
    {
    isChinese &&
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Traditional/Simplified Chinese title:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.altChTitle} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="song-generator-input-altChTitle"
          fluid placeholder="Traditional/Simplified Chinese title" 
          {...bindInput('altChTitle')}
          className={bindElementWithErrorNotification('altChTitle')}
          label={
            <Checkbox 
              id="song-generator-input-altChIsTraditional"
              label={formData.altChIsTraditional ? 'Traditional' : 'Simplified'}
              toggle
              {...bindCheckbox('altChIsTraditional')}
            />
          }
          labelPosition='right'
        />
      </GridColumn>
    </GridRow>
    }
    {
    needsRomanization &&
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Transliterated title:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.romTitle} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="song-generator-input-romTitle"
          fluid placeholder="Romanized title" 
          {...bindInput('romTitle')}
          className={bindElementWithErrorNotification('romTitle')}
        />
      </GridColumn>
    </GridRow>
    }
    {
    needsEnglishTranslation &&
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Translated title:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.engTitle} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="song-generator-input-engTitle"
          fluid placeholder="English title" 
          {...bindInput('engTitle')}
          className={bindElementWithErrorNotification('engTitle')}
          label={
            <Checkbox 
              id="song-generator-input-isOfficiallyTranslated"
              label='Is an official title?'
              {...bindCheckbox('titleIsOfficiallyTranslated')}
            />
          }
          labelPosition='right'
        />
      </GridColumn>
    </GridRow>
    }

    <Divider />

    {/* Infobox Colours */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Infobox BG/FG colours:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.infobox} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <div 
          className='infobox-preview' 
          style={{ 
            backgroundColor: formData.bgColour,
            color: formData.fgColour
          }}>
          <span>Preview</span>
        </div>
        <Grid stackable>
          <GridColumn width={8}>
            <Input 
              size="small"
              className={bindElementWithErrorNotification('bgColour')}
              label={{ 
                basic: true, 
                style:{padding: "2px"}, 
                content: (
                  <Input 
                    type="color" 
                    value={convertColourStringToHexCode(formData.bgColour)} 
                    onChange={(_, data) => {
                      setFormData({...formData, bgColour: data.value });
                    }}
                  />
                )
              }}
              labelPosition='right'
              value={formData.bgColour}
              onChange={(_, data) => setFormData({ ...formData, bgColour: data.value })}
            />
          </GridColumn>
          <GridColumn width={8}>
            <Input 
              size="small"
              className={bindElementWithErrorNotification('fgColour')}
              label={{ 
                basic: true, 
                style:{padding: "2px"}, 
                content: (
                  <Input 
                    type="color" 
                    value={convertColourStringToHexCode(formData.fgColour)} 
                    onChange={(_, data) => {
                      setFormData({...formData, fgColour: data.value });
                    }}
                  />
                )
              }}
              labelPosition='right'
              value={formData.fgColour}
              onChange={(_, data) => setFormData({ ...formData, fgColour: data.value })}
            />
          </GridColumn>
        </Grid>
      </GridColumn>
    </GridRow>

    {/* Upload Date */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Upload Date:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.dateOfPublication} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="song-generator-input-uploadDate"
          type="date" 
          {...bindInput('uploadDate')}
          className={bindElementWithErrorNotification('uploadDate')} 
        />
      </GridColumn>
    </GridRow>

    {/* Singer */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Singer(s):</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.singers} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Dropdown
          placeholder='Featuring Synth Engines'
          fluid multiple selection
          options={engines.map((engine) => ({ key: engine.id, text: engine.name, value: engine.name }))}
          value={usedEngines}
          // @ts-ignore
          onChange={(_, data) => setUsedEngines(data.value)}
          className={bindElementWithErrorNotification('engines')}
        />
        <TextArea 
          id="song-generator-input-singers"
          {...bindTextArea('singers')}
          className={bindElementWithErrorNotification('singers')} 
        />
      </GridColumn>
    </GridRow>

    {/* Producers */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Producer(s):</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.producers} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <TextArea 
          id="song-generator-input-producers"
          {...bindTextArea('producers')}
          className={bindElementWithErrorNotification('producers')}
        />
      </GridColumn>
    </GridRow>

    {/* Description */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Description:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.description} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <TextArea 
          id="song-generator-input-description"
          {...bindTextArea('description')}
          className={bindElementWithErrorNotification('description')}
        />
      </GridColumn>
    </GridRow>

    <Divider />
    
    {/* Playlinks */}
    <GridRow className={bindElementWithErrorNotification('playLinks')}>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Broadcast Links</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.playLinks} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <PlayLinksInputTable 
          ref={refPlayLinks}
        />
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
          <div>
            <Checkbox 
              id="song-generator-input-isAlbumOnly"
              label='Song is an album-only release'
              {...bindCheckbox('isAlbumOnly')}
            />
          </div>
          <div style={{ paddingLeft: '30px' }}>
            <Checkbox 
              id="song-generator-input-isUnavailable"
              label='Song is publically unavailable'
              {...bindCheckbox('isUnavailable')}
            />
          </div>
        </div>
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Lyrics */}
    <GridRow className={bindElementWithErrorNotification('lyrics')}>
      <GridColumn width={16}>
        <div className='centered-header'>
          <span style={{ paddingRight: '5px' }}>Lyrics</span>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.lyrics} required />
        </div>
        {/* <div>
          <Checkbox toggle 
            checked={showDarkMode} 
            onChange={(_, data) => setShowDarkMode(data.checked || false)} 
          />
        </div> */}
        <LyricsInputTable 
          headersText={headersText}
          needsRomanization={needsRomanization}
          needsEnglishTranslation={needsEnglishTranslation}
          // mode={showDarkMode ? 'dark' : 'light'}
          mode='light'
          ref={refLyrics}
        />
      </GridColumn>
    </GridRow>
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Translator:</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.translator} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="song-generator-input-translator"
          type="text" 
          {...bindInput('translator')}
          className={bindElementWithErrorNotification('translator')}
          style={{ minWidth: '40%' }}
        />
        <Checkbox 
          id="song-generator-input-isOfficialTranslation"
          label='Is an official translation'
          {...bindCheckbox('isOfficialTranslation')}
          style={{ marginLeft: '20px' }}
        />
        <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.officialTranslation} />
      </GridColumn>
    </GridRow>

    <Divider />

    {/* External Links */}
    <GridRow className={bindElementWithErrorNotification('extLinks')}>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>External Links</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.extLinks} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <ExternalLinksInputTable 
          ref={refExtLinks}
        />
      </GridColumn>
    </GridRow>

    {/* Categories */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column' style={{ marginBottom: '10px' }}>
          <div>Categories</div>
          <Tooltip content={CONST_TOOLTIPS_SONG_PAGES.categories} required />
        </div>
        <Button basic color='violet'
          onClick={handleAutoloadCategories}
        >
          Autoload
        </Button>
      </GridColumn>
      <GridColumn width={13}>
        <TextArea 
          id="song-generator-input-categoriesRaw"
          value={formData.categoriesRaw}
          onChange={(_, data) => setFormData({
            ...formData, categoriesRaw: data.value?.toString() || ''
          })}
          className={bindElementWithErrorNotification('categoriesRaw')}
        />
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Buttons */}
    <GridRow>
      <GridColumn width={6}>
        <Button negative onClick={() => clearForm()}>
          Reset
        </Button>
      </GridColumn>
      <GridColumn width={10}>
        <Button 
          color='violet' 
          size='big'
          style={{ width: '200px' }}
          onClick={generateOutput}
        >
          Generate
        </Button>
        <Checkbox 
          label='Ignore Errors'
          checked={ignoreErrors}
          onChange={(_, data) => setIgnoreErrors(data?.checked || false)} 
        />
      </GridColumn>
    </GridRow>

    <Divider />

    <GridRow>
      <GridColumn width={16}>
        <DisplayError 
          errors={notify.errors}
          warnings={notify.warnings}
          recommendToAutoloadCategories={notify.recommendToAutoloadCategories}
        />
      </GridColumn>
    </GridRow>

    <br />

    <Divider />

    {/* Generated Results */}
    <GridRow>
      <GridColumn width={16}>
        <h3 className='centered-header'>
          <span className='before-button'>Results</span>
          <CopyButton copyState={results} />
        </h3>
        <h2 className='centered-header'>
          {
            needsRomanization ? 
            `${formData.origTitle}${formData.romTitle === '' ? '' : ` (${formData.romTitle})`}` :
            formData.origTitle
          }
        </h2>
        <TextArea 
          rows={40} 
          value={results} 
          onChange={(_, data) => setResults(`${data?.value}` || '')}
        />
      </GridColumn>
    </GridRow>
  </Grid>
  </Form>
  </>
  )
}