import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Grid, GridColumn, GridRow, Divider,
  Form, 
  Input, Dropdown, TextArea,
  Button, Checkbox, 
  Image
} from 'semantic-ui-react';
import Tooltip from '../components/reusables/Tooltip';

import TracklistInputTable from '../components/handsontables/TracklistInputTable';
import ExternalLinksInputTable from '../components/handsontables/ExternalLinksInputTable';

import CopyButton from '../components/reusables/CopyButton';
import DisplayError from '../components/reusables/DisplayErrors';
import PreloadFromVdb from '../components/reusables/PreloadFromVdb';
import FirstTimeEditorNote from '../components/reusables/FirstTimeEditorNote';

import useTwoWayBinding from '../hooks/useTwoWayBinding';
import useFetchListOfEngines from '../hooks/useFetchListOfEngines';
import { convertColourStringToHexCode } from '../utils';

import { CONST_TOOLTIPS_ALBUM_PAGES } from '../constants/tooltips';

import { albumPageFormInterface, displayErrorsInterface } from "../types";

import { parseInput, validate, autoloadCategories, generateAlbumPage } from "../generators/albumPage";
import { fetchDataFromVocaDbForAlbumPage } from "../generators/fetch";

const defaultInputData: albumPageFormInterface = {
  origTitle: "",
  romTitle: "",
  bgColour: "black",
  fgColour: "white",
  label: "",
  description: "",
  engines: [],
  vdbAlbumId: "",
  vocaWikiPage: "",
  categoriesRaw: ""
};

export default function AlbumGeneratorPage() {

  // STATES
  const [preload, setPreload] = useState<{url: string, loading: boolean}>({
    url: '',
    loading: false
  });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [formData, setFormData] = useState<albumPageFormInterface>({
    ...defaultInputData,
    engines: [...defaultInputData.engines]
  });
  const [ignoreErrors, setIgnoreErrors] = useState<boolean>(false);
  const [results, setResults] = useState<string>('');
  const [elementsWithErrors, setElementsWithErrors] = useState<string[]>([]);
  const [notify, setNotify] = useState<displayErrorsInterface>({ 
    errors: [], 
    warnings: [],
    recommendToAutoloadCategories: false
  });

  // HANDSONTABLES
  const refTracklist = useRef(null);
  const refExtLinks = useRef(null);

  const { bindInput, bindDropdown } = useTwoWayBinding<albumPageFormInterface>(formData, setFormData);

  const engines = useFetchListOfEngines();

  const bindElementWithErrorNotification = useMemo(() => (
    (key: string) => {
      if (elementsWithErrors.includes(key)) return 'error'
      else return '';
    }
  ), [elementsWithErrors]);

  // Load default data
  useEffect(() => {
    // @ts-ignore
    refExtLinks.current?.hotInstance?.loadData(
      Array(5).fill(null).map(_ => ['', '', false])
    );
    // @ts-ignore
    refTracklist.current?.hotInstance?.loadData(
      Array(12).fill(null).map(_ => ['', '', '', '', ''])
    );
  }, []);

  function handleFetchFromVocadb() {
    if (window.confirm('Are you sure you want to continue? This will reset all data in the page.')) {
      clearForm(true);
      setImageSrc(null);
      setPreload({ ...preload, loading: true });
      fetchDataFromVocaDbForAlbumPage(preload.url)
        .then( data => {
          const { formData: { 
            origTitle, romTitle, label, description, engines, vdbAlbumId, vocaWikiPage, imageSrc 
          }, tracklistData, extLinksData
          } = data;

          // SET INTERNAL STATES
          setFormData(() => ({
            ...defaultInputData,
            origTitle, romTitle, label, description, engines, vdbAlbumId, vocaWikiPage 
          }));
          setImageSrc(() => imageSrc);
          
          // SET DOM
          // @ts-ignore
          document.getElementById("album-generator-input-origTitle").value = origTitle;
          // @ts-ignore
          document.getElementById("album-generator-input-romTitle").value = romTitle;
          // @ts-ignore
          document.getElementById("album-generator-input-label").value = label;
          // @ts-ignore
          document.getElementById("album-generator-input-description").value = description;
          // @ts-ignore
          document.getElementById("album-generator-input-vdbAlbumId").value = vdbAlbumId;
          // @ts-ignore
          document.getElementById("album-generator-input-vocaWikiPage").value = vocaWikiPage;

          // SET HANDSONTABLE DATA
          // @ts-ignore
          refExtLinks.current?.hotInstance?.loadData(extLinksData);
          // @ts-ignore
          refTracklist.current?.hotInstance?.loadData(tracklistData);
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
    const categories = autoloadCategories(
      formData,
      // @ts-ignore
      refTracklist.current?.hotInstance?.getData()
    );
    setFormData({ 
      ...formData, 
      categoriesRaw: categories.join('\n') 
    });
  }

  function clearForm(autoConfirm: boolean = false) {
    if (autoConfirm || window.confirm('Are you sure you want to reset?')) {

      // Set states
      setPreload({ url: '', loading: false });
      setFormData({
        ...defaultInputData,
        engines: [...defaultInputData.engines]
      });
      setImageSrc(null);
      setIgnoreErrors(false);

      // Clear form
      //@ts-ignore
      document.getElementById('album-generator-form')?.reset();

      // Set Handsontable data
      // @ts-ignore
      refExtLinks.current?.hotInstance?.loadData(
        Array(5).fill(null).map(_ => ['', '', false])
      );
      // @ts-ignore
      refTracklist.current?.hotInstance?.loadData(
        Array(12).fill(null).map(_ => ['', '', '', '', ''])
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
      formData, 
      // @ts-ignore
      tracklistData: refTracklist.current?.hotInstance?.getData() || [],
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
      const output = generateAlbumPage(parsedInput);
      setResults(output);
    }
  }

  return (
  <>
  <Form id='album-generator-form'>
  <Grid stackable verticalAlign='middle'>

    {/* VocaDB Pre-loader */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Pre-load from VocaDB:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.vdb} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <PreloadFromVdb 
          handleFetchFromVocadb={handleFetchFromVocadb}
          loading={preload.loading}
          setStateOnBlur={(value: string) => {
            setPreload({...preload, url: value});
          }}
          mode='Al'
        />
      </GridColumn>
    </GridRow>

    <Divider />

    <GridRow>
      <GridColumn width={16}>
        {
          imageSrc &&
          <Image src={imageSrc} size='large' wrapped centered />
        }
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Song Titles */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Original title:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.origTitle} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="album-generator-input-origTitle"
          fluid placeholder="Original title" 
          {...bindInput("origTitle")} 
          className={bindElementWithErrorNotification('origTitle')}
        />
      </GridColumn>
    </GridRow>
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Transliterated title:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.romTitle} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="album-generator-input-romTitle"
          fluid placeholder="Romanized title" 
          {...bindInput("romTitle")} 
          className={bindElementWithErrorNotification('romTitle')}
        />
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Infobox Colours */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Infobox BG/FG colours:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.infobox} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <div 
          className='infobox-preview' 
          style={{ 
            backgroundColor: formData["bgColour"],
            color: formData["fgColour"]
          }}>
          <span>Preview</span>
        </div>
        <Grid stackable>
          <GridColumn width={8}>
            <Input 
              size="small"
              value={formData["bgColour"]} 
              onChange={(_, data) => {
                setFormData({
                  ...formData,
                  bgColour: data.value
                })
              }}
              className={bindElementWithErrorNotification('bgColour')}
              label={{ 
                basic: true, 
                style:{padding: "2px"}, 
                content: (
                  <Input 
                    type="color" 
                    value={convertColourStringToHexCode(formData["bgColour"])} 
                    onChange={(_, data) => {
                      setFormData({
                        ...formData,
                        bgColour: data.value
                      })
                    }}
                  />
                )
              }}
              labelPosition='right'
            />
          </GridColumn>
          <GridColumn width={8}>
            <Input 
              size="small"
              value={formData["fgColour"]} 
              onChange={(_, data) => {
                setFormData({
                  ...formData,
                  fgColour: data.value
                })
              }}
              className={bindElementWithErrorNotification('fgColour')}
              label={{ 
                basic: true, 
                style:{padding: "2px"}, 
                content: (
                  <Input 
                    type="color" 
                    value={convertColourStringToHexCode(formData["fgColour"])} 
                    onChange={(_, data) => {
                      setFormData({
                        ...formData,
                        fgColour: data.value
                      })
                    }}
                  />
                )
              }}
              labelPosition='right'
            />
          </GridColumn>
        </Grid>
      </GridColumn>
    </GridRow>

    {/* Label */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Label:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.label} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="album-generator-input-label"
          fluid placeholder="KarenT, EXIT Tunes, etc." 
          {...bindInput("label")} 
          className={bindElementWithErrorNotification('label')}
        />
      </GridColumn>
    </GridRow>

    {/* Description */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Description:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.description} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="album-generator-input-description"
          fluid placeholder="an album by PRODUCER" 
          {...bindInput("description")} 
          className={bindElementWithErrorNotification('description')}
        />
      </GridColumn>
    </GridRow>

    {/* Synth Engines */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Singer(s):</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.engines} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Dropdown
          placeholder='Featuring Synth Engines'
          fluid multiple selection
          options={engines.map((engine) => ({ key: engine.id, text: engine.name, value: engine.name }))}
          {...bindDropdown("engines")}
          className={bindElementWithErrorNotification('engines')}
          {...{style: {zIndex: '999'}}}
        />
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Tracklist */}
    <GridRow className={bindElementWithErrorNotification('tracklist')}>
      <GridColumn width={16}>
        <div className='centered-header'>
          <span style={{ paddingRight: '5px' }}>Tracklist</span>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.tracklist} required wide />
        </div>
        <TracklistInputTable 
          ref={refTracklist}
        />
      </GridColumn>
    </GridRow>

    <Divider />

    {/* VocaDB Album Page ID */}
    <GridRow className={bindElementWithErrorNotification('vdbAlbumId')}>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>VocaDB Album Page ID:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.vdbAlbumId} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="album-generator-input-vdbAlbumId"
          fluid placeholder="VocaDB Album Page ID" 
          {...bindInput("vdbAlbumId")} 
        />
      </GridColumn>
    </GridRow>

    {/* Vocaloid Wiki Page */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>VOCALOID Wiki Page:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.vocaWikiPage} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="album-generator-input-vocaWikiPage"
          fluid placeholder="Vocaloid Wiki Page Name" 
          {...bindInput("vocaWikiPage")} 
        />
      </GridColumn>
    </GridRow>

    {/* External Links */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>External Links:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.extLinks} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <ExternalLinksInputTable 
          ref={refExtLinks}
        />
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Categories */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column' style={{ marginBottom: '10px' }}>
          <div>Categories:</div>
          <Tooltip content={CONST_TOOLTIPS_ALBUM_PAGES.categories} required />
        </div>
        <Button basic color='violet'
          onClick={handleAutoloadCategories}
        >
          Autoload
        </Button>
      </GridColumn>
      <GridColumn width={13}>
        <TextArea 
          value={formData["categoriesRaw"]}
          onChange={(_, data) => {
            setFormData({ ...formData, categoriesRaw: (data.value || '').toString() })
          }}
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

    <GridRow>
      <GridColumn width={16}>
        <FirstTimeEditorNote addRedirectNote={true} />
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
            formData.origTitle !== '' &&
            `${formData.origTitle}${formData.romTitle === '' ? '' : ` (${formData.romTitle})`} (album)`
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