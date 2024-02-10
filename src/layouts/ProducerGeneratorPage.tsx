import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Grid, GridColumn, GridRow, Divider,
  Form, 
  Input, Dropdown, TextArea,
  Button, Checkbox, 
  Image
} from 'semantic-ui-react';
import Tooltip from '../components/reusables/Tooltip';

import ExternalLinksInputTable from '../components/handsontables/ExternalLinksInputTable';
import DiscographyInputTable from '../components/handsontables/DiscographyInputTable';

import CopyButton from '../components/reusables/CopyButton';
import DisplayError from '../components/reusables/DisplayErrors';
import PreloadFromVdb from '../components/reusables/PreloadFromVdb';

import useTwoWayBinding from '../hooks/useTwoWayBinding';
import useFetchListOfEngines from '../hooks/useFetchListOfEngines';

import { CONST_LANGUAGES } from '../constants/languages';
import { CONST_TOOLTIPS_PRODUCER_PAGES } from '../constants/tooltips';
import { CONST_WIKI_DOMAIN } from '../constants/linkDomains';

import { producerPageFormInterface, producerRoles, displayErrorsInterface } from "../types";

import { parseInput, validate, generateProducerPage } from "../generators/producerPage";
import { fetchDataFromVocaDbForProducerPage, fetchDiscographyFromVlw } from "../generators/fetch";

const defaultInputData: producerPageFormInterface = {
  prodCategory: "",
  prodAliases: "",
  affiliations: "",
  label: "",
  languageIds: [],
  engines: [],
  description: "",
};
const defaultProducerRoles = {
  composer: false,
  lyricist: false,
  tuner: false,
  illustrator: false,
  animator: false,
  arranger: false,
  instrumentalist: false,
  mixer: false,
  masterer: false,
};

export default function AlbumGeneratorPage() {
  
  // STATES
  const [preload, setPreload] = useState<{url: string, loading: boolean, loadingDiscog: boolean}>({
    url: '',
    loading: false,
    loadingDiscog: false
  });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [formData, setFormData] = useState<producerPageFormInterface>({
    ...defaultInputData,
    languageIds: [...defaultInputData.languageIds],
    engines: [...defaultInputData.engines]
  });
  const [producerRoles, setProducerRoles] = useState<producerRoles>({
    ...defaultProducerRoles
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
  const refDiscogSongs = useRef(null);
  const refDiscogAlbums = useRef(null);
  const refExtLinks = useRef(null);

  const { bindInput, bindTextArea, bindDropdown } = useTwoWayBinding<producerPageFormInterface>(formData, setFormData);
  const { bindCheckbox } = useTwoWayBinding<producerRoles>(producerRoles, setProducerRoles);

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
      Array(5).fill(null).map(_ => ['', '', false, false, false])
    );
    // @ts-ignore
    refDiscogSongs.current?.hotInstance?.loadData(
      Array(8).fill(null).map(_ => ['', ''])
    );
    // @ts-ignore
    refDiscogAlbums.current?.hotInstance?.loadData(
      Array(8).fill(null).map(_ => ['', ''])
    );
  }, []);

  function handleFetchFromVocadb() {
    if (window.confirm('Are you sure you want to continue? This will reset all data in the page.')) {
      clearForm(true);
      setImageSrc(null);
      setPreload({ ...preload, loading: true });
      fetchDataFromVocaDbForProducerPage(preload.url)
        .then( data => {
          const { formData: { prodCategory, affiliations, label, description, imageSrc }, extLinksData } = data;
          
          // SET INTERNAL STATES
          setFormData(()=> ({ 
            ...defaultInputData, 
            prodCategory, affiliations, label, description 
          }));
          setImageSrc(() => imageSrc);

          // SET DOM
          // @ts-ignore
          document.getElementById("producer-generator-input-prodCategory").value = prodCategory;
          // @ts-ignore
          document.getElementById("producer-generator-input-affiliations").value = affiliations;
          // @ts-ignore
          document.getElementById("producer-generator-input-label").value = label;
          // @ts-ignore
          document.getElementById("producer-generator-input-description").value = description;

          // SET HANDSONTABLE DATA
          // @ts-ignore
          refDiscogSongs.current?.hotInstance?.loadData(
            Array(8).fill(null).map(_ => ['', ''])
          );
          // @ts-ignore
          refDiscogAlbums.current?.hotInstance?.loadData(
            Array(8).fill(null).map(_ => ['', ''])
          );
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

  function handleFetchFromVlw() {
    setPreload({ ...preload, loadingDiscog: true });
    fetchDiscographyFromVlw(formData.prodCategory)
      .then(data => {
        const { songs, albums } = data;
        // @ts-ignore
        refDiscogSongs.current?.hotInstance?.loadData(songs);
        // @ts-ignore
        refDiscogAlbums.current?.hotInstance?.loadData(albums);
        window.alert('Finished fetching from the VOCALOID Lyrics Wiki');
      })
      .catch((err) => {
        window.alert(err?.message || err);
      })
      .finally(() => {
        setPreload({ ...preload, loadingDiscog: false });
      });
  }

  function clearForm(autoConfirm: boolean = false) {
    if (autoConfirm || window.confirm('Are you sure you want to reset?')) {
      
      // Set States
      setPreload({ url: '', loading: false, loadingDiscog: false });
      setFormData({
        ...defaultInputData,
        languageIds: [...defaultInputData.languageIds],
        engines: [...defaultInputData.engines]
      });
      setImageSrc(null);
      setIgnoreErrors(false);

      // Clear form
      //@ts-ignore
      document.getElementById('producer-generator-form')?.reset();
      
      // Set Handsontable data
      // @ts-ignore
      refExtLinks.current?.hotInstance?.loadData(
        Array(5).fill(null).map(_ => ['', '', false, false, false])
      );
      // @ts-ignore
      refDiscogSongs.current?.hotInstance?.loadData(
        Array(8).fill(null).map(_ => ['', ''])
      );
      // @ts-ignore
      refDiscogAlbums.current?.hotInstance?.loadData(
        Array(8).fill(null).map(_ => ['', ''])
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
      producerRoles,
      // @ts-ignore
      songListData: refDiscogSongs.current?.hotInstance?.getData() || [],
      // @ts-ignore
      albumListData: refDiscogAlbums.current?.hotInstance?.getData() || [],
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
      const output = generateProducerPage(parsedInput);
      setResults(output);
    }
  }

  return (
  <>
  <Form id='producer-generator-form'>
  <Grid stackable verticalAlign='middle'>

    {/* VocaDB Pre-loader */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Pre-load from VocaDB:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.vdb} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <PreloadFromVdb 
          handleFetchFromVocadb={handleFetchFromVocadb}
          loading={preload.loading}
          setStateOnBlur={(value: string) => {
            setPreload({...preload, url: value});
          }}
          mode='Ar'
        />
      </GridColumn>
    </GridRow>

    <Divider />

    <GridRow>
      <GridColumn width={3}>
        {
          imageSrc &&
          <Image src={imageSrc} size='large' wrapped centered />
        }
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Producer Category */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Main producer category:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.prodcat} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="producer-generator-input-prodCategory"
          fluid placeholder="..." 
          label={
            <Button onClick={handleFetchFromVlw} loading={preload.loadingDiscog}>
              Fetch discography from wiki
            </Button>
          }
          labelPosition='right'
          {...bindInput("prodCategory")}
          className={bindElementWithErrorNotification('prodCategory')}
        />
      </GridColumn>
    </GridRow>

    {/* Producer Aliases */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Producer's other aliases:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.prodaliases} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Input 
          id="producer-generator-input-prodAliases"
          fluid placeholder="..." 
          {...bindInput("prodAliases")}
          className={bindElementWithErrorNotification('prodAliases')}
        />
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Affiliations */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Affiliations:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.affiliations} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <TextArea 
          id="producer-generator-input-affiliations"
          {...bindTextArea("affiliations")} 
          className={bindElementWithErrorNotification('affiliations')}
        />
      </GridColumn>
    </GridRow>

    {/* Labels */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Labels:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.labels} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <TextArea 
          id="producer-generator-input-label"
          {...bindTextArea("labels")} 
          className={bindElementWithErrorNotification('labels')}
        />
      </GridColumn>
    </GridRow>

    {/* Song Language and Titles */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Languages:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.languages} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Dropdown
          placeholder='Choose a language'
          fluid multiple selection
          options={CONST_LANGUAGES.map((el, idx) => {
            return { key: idx, text: el.name, value: idx }
          })}
          {...bindDropdown("languageIds")}
          className={bindElementWithErrorNotification('languageIds')}
        />
      </GridColumn>
    </GridRow>

    {/* Synth Engines */}
    <GridRow>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Uses the synthesizers:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.synthesizers} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Dropdown
          placeholder='Featuring Synth Engines'
          fluid multiple selection
          options={engines.map((engine) => ({ key: engine.id, text: engine.name, value: engine.name }))}
          {...bindDropdown("engines")}
          className={bindElementWithErrorNotification('engines')}
        />
      </GridColumn>
    </GridRow>

    {/* Roles */}
    <GridRow className={bindElementWithErrorNotification('producerRoles')}>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Typical roles:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.prodroles} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <Grid stackable className='producer-checkboxes'>
          <GridRow>
            <GridColumn width={5}>
              <Checkbox label='Composer' {...bindCheckbox('composer')} />
            </GridColumn>
            <GridColumn width={5}>
              <Checkbox label='Lyricist' {...bindCheckbox('lyricist')} />
            </GridColumn>
            <GridColumn width={5}>
              <Checkbox label='Tuner' {...bindCheckbox('tuner')} />
            </GridColumn>
          </GridRow>
          <GridRow>
            <GridColumn width={5}>
              <Checkbox label='Illustrator' {...bindCheckbox('illustrator')} />
            </GridColumn>
            <GridColumn width={5}>
              <Checkbox label='Animator' {...bindCheckbox('animator')} />
            </GridColumn>
          </GridRow>
          <GridRow>
            <GridColumn width={5}>
              <Checkbox label='Arranger' {...bindCheckbox('arranger')} />
            </GridColumn>
            <GridColumn width={5}>
              <Checkbox label='Instrumentalist' {...bindCheckbox('instrumentalist')} />
            </GridColumn>
          </GridRow>
          <GridRow>
            <GridColumn width={5}>
              <Checkbox label='Mixer' {...bindCheckbox('mixer')} />
            </GridColumn>
            <GridColumn width={5}>
              <Checkbox label='Masterer' {...bindCheckbox('masterer')} />
            </GridColumn>
          </GridRow>
        </Grid>
      </GridColumn>
    </GridRow>

    {/* Description */}
    <GridRow className={bindElementWithErrorNotification('description')}>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>Description:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.description} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <TextArea 
          id="producer-generator-input-description"
          {...bindTextArea("description")} 
        />
      </GridColumn>
    </GridRow>

    <Divider />

    {/* External Links */}
    <GridRow className={bindElementWithErrorNotification('extLinks')}>
      <GridColumn width={16}>
        <div className='centered-header'>
          <span style={{ paddingRight: '5px' }}>External Links</span>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.extLinks} required wide />
        </div>
        <ExternalLinksInputTable 
          forProducerPages
          ref={refExtLinks}
        />
      </GridColumn>
    </GridRow>

    <Divider />

    {/* Discography - Songs */}
    <GridRow className={bindElementWithErrorNotification('pwtDiscog')}>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>List of songs:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.songList} required />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <DiscographyInputTable 
          ref={refDiscogSongs}
        />
      </GridColumn>
    </GridRow>

    {/* Discography - Albums */}
    <GridRow className={bindElementWithErrorNotification('awtDiscog')}>
      <GridColumn width={3}>
        <div className='label-column'>
          <div>List of albums:</div>
          <Tooltip content={CONST_TOOLTIPS_PRODUCER_PAGES.albumList} />
        </div>
      </GridColumn>
      <GridColumn width={13}>
        <DiscographyInputTable 
          forAlbums
          ref={refDiscogAlbums}
        />
      </GridColumn>
    </GridRow>

    {/* Category Tree Note */}
    <GridRow>
      <GridColumn width={3}>
      </GridColumn>
      <GridColumn width={13}>
        <div>
        Use the "Fetch discography from wiki" button to get the song & album pages that have been tagged in Vocaloid Lyrics wiki.<br />Alternatively, you can use <a href={
          `https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/Special:CategoryTree`
        } target='_blank' rel="noopener noreferrer">the Category Tree tool in Vocaloid Lyrics wiki</a> to manually get the list of song & album pages. See this example for <a href={
          `https://${CONST_WIKI_DOMAIN}.fandom.com/wiki/Special:CategoryTree?target=Category%3APinocchioP+songs+list&mode=all&namespaces=`
        } target='_blank' rel="noopener noreferrer">PinocchioP</a>.<br /><br />Do note that the Category Tree tool can only query a maximum of 200 pages per category.
        </div>
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