import { AppDataSource } from "../components/DatabaseProvider";

import { SchemaFetchedVocaDBArtistsListJson, VocalSynthEngine } from "../generators/fetch-schemas";

import { 
  Grid, GridColumn, GridRow,
  Input, Dropdown, Button,
  TableRow, TableHeaderCell, TableHeader,
  TableCell, TableBody, Table, 
  Icon, Dimmer, Loader, Popup,
} from 'semantic-ui-react';
import { useState, useEffect } from "react";

const CONST__VDB_QUERY_PAGE_SIZE = 100;
interface ComparedSynth {
  vdbId: number
  originalName: string
  additionalNames: string
  internalWikiName: string
  categoryHasBeenAddedOnWiki: boolean
  type: VocalSynthEngine
  baseVoicebank: {
    vdbId: number
    vdbName: string
    vdbType: VocalSynthEngine
    internalName: string | null
  } | null
  addedOnVocaDbDate: Date | null
  publishedDate: Date | null
  isListedOnInternalDb: boolean
}
async function fetchListOfSynthsFromVocaDb(artistTypes: VocalSynthEngine[], offset: number = 0): Promise<ComparedSynth[]> {
  try {
    let res = await fetch(
      `https://vocadb.net/api/artists?artistTypes=${artistTypes.join(",")}` + 
      `&allowBaseVoicebanks=true&childTags=false` + 
      `&start=${offset * CONST__VDB_QUERY_PAGE_SIZE}&maxResults=${CONST__VDB_QUERY_PAGE_SIZE}&sort=AdditionDate` + 
      `&fields=Names,AdditionalNames,BaseVoicebank&lang=Japanese` +
      `&getTotalCount=false&preferAccurateMatches=false`
    );
    const json: SchemaFetchedVocaDBArtistsListJson = await res.json();

    const arr: ComparedSynth[] = [];
    const crossCheckBaseVbIds: Map<number, number[]> = new Map();
    for (let i = 0; i < json.items.length; i++) {
      const item = json.items[i];
      const synth: ComparedSynth = {
        vdbId: item.id,
        originalName: item.defaultName,
        additionalNames: item.additionalNames,
        internalWikiName: '',
        categoryHasBeenAddedOnWiki: false,
        baseVoicebank: null,
        type: item.artistType,
        addedOnVocaDbDate: (item.createDate ? new Date(Date.parse(item.createDate)) : null),
        publishedDate: (item.releaseDate ? new Date(Date.parse(item.releaseDate)) : null),
        isListedOnInternalDb: false
      }
      if (item.baseVoicebank) {
        synth.baseVoicebank = {
          vdbId: item.baseVoicebank.id,
          vdbName: `${item.baseVoicebank.name}${item.baseVoicebank.additionalNames !== '' ? ` (${item.baseVoicebank.additionalNames})` : ''}`,
          vdbType: item.baseVoicebank.artistType,
          internalName: null,
        }
        if (!crossCheckBaseVbIds.has(item.baseVoicebank.id)) {
          crossCheckBaseVbIds.set(item.baseVoicebank.id, []);
        }
        crossCheckBaseVbIds.get(item.baseVoicebank.id)!.push(i);
      }
      arr.push(synth);
    }

    let rawQueryResults = AppDataSource.exec(
      `SELECT s.vdb_id, s.wikicat_name, s.category_is_not_on_vlw FROM synths s WHERE s.vdb_id IN (${arr.map(synth => synth.vdbId).join(',')});`
    );
    if (rawQueryResults.length > 0) {
      const synthsListedInDatabase = new Map<number, { catname: string, hasBeenAdded: boolean }>();
      for (let [vdbId, wikicatName, categoryHasBeenAddedOnVLW] of rawQueryResults[0].values) {
        synthsListedInDatabase.set(vdbId as number, { catname: wikicatName as string, hasBeenAdded: !!categoryHasBeenAddedOnVLW });
      }
      for (let synth of arr) {
        if (synthsListedInDatabase.has(synth.vdbId)) {
          synth.isListedOnInternalDb = true;
          const { catname, hasBeenAdded } = synthsListedInDatabase.get(synth.vdbId) || { catname: '', hasBeenAdded: false};
          synth.internalWikiName = catname;
          synth.categoryHasBeenAddedOnWiki = hasBeenAdded;
        }
      }
    }

    rawQueryResults = AppDataSource.exec(
      `SELECT s.vdb_id, s.wikicat_name FROM synths s WHERE s.vdb_id IN (${[...crossCheckBaseVbIds.keys()].join(',')});`
    );
    if (rawQueryResults.length > 0) {
      for (let [vdbId, wikicatName] of rawQueryResults[0].values) {
        const indices = crossCheckBaseVbIds.get(vdbId as number)!;
        for (let i of indices) {
          arr[i].baseVoicebank!.internalName = wikicatName as string;
        }
      }
    }

    return arr;
  } catch(err) {
    throw err;
  }
}

export default function VocaDbSynthsComparerPage() {
  const [artistTypes, setArtistTypes] = useState<VocalSynthEngine[]>([
    VocalSynthEngine.vocaloid,
    VocalSynthEngine.synthv,
    VocalSynthEngine.cevio,
    VocalSynthEngine.newtype,
    VocalSynthEngine.voisona,
  ]);
  const [queryOffset, setQueryOffset] = useState<number>(0);
  const [synths, setSynths] = useState<ComparedSynth[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const dateLocale: {
    year: "numeric"
    month: "short"
    day: "numeric"
  } = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const handleMoveToNextPage = () => {
    if (!isNaN(+queryOffset)) {
      setQueryOffset(queryOffset + 1)
    } else {
      setQueryOffset(1);
    };
  }
  const handleFetchFromVocaDb = () => {
    setIsLoading(true);
    setSynths([]);
    fetchListOfSynthsFromVocaDb(artistTypes, queryOffset)
      .then((data) => {
        setSynths(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }

  useEffect(handleFetchFromVocaDb, [queryOffset]);

  return (
    <Grid stackable verticalAlign='middle'>
      <GridRow>
        <GridColumn width={3}>
          VocaDB Artist Types:
        </GridColumn>
        <GridColumn width={13}>
          <Dropdown
            fluid multiple selection
            options={Object.values(VocalSynthEngine).map((artistType, idx) => (
              { key: idx, text: artistType, value: artistType }
            ))}
            value={artistTypes}
            onChange={(_, data) => {
              setArtistTypes((data.value as VocalSynthEngine[]));
            }}
          />
        </GridColumn>
      </GridRow>
      <GridRow>
        <GridColumn width={3}>
          Page Offset:
        </GridColumn>
        <GridColumn width={13}>
          <Input 
            type="numeric"
            fluid
            placeholder="0"
            label={
              <Button onClick={handleMoveToNextPage}>
                <Icon name="plus" />
                Next Page
              </Button>
            }
            labelPosition='right'
            value={queryOffset}
            onChange={(_, data) => {
              if (!isNaN(+data.value)) setQueryOffset(+data.value);
            }}
          />
        </GridColumn>
      </GridRow>
      <GridRow>
        <GridColumn width={3}></GridColumn>
        <GridColumn width={13}>
          <Button fluid onClick={handleFetchFromVocaDb}>Query from VocaDB</Button>
        </GridColumn>
      </GridRow>
      <GridRow>
        <Table>
          <TableHeader>
            <TableHeaderCell>
              No
            </TableHeaderCell>
            <TableHeaderCell>
              Original Name
            </TableHeaderCell>
            <TableHeaderCell>
              Other names
            </TableHeaderCell>
            <TableHeaderCell>
              Artist Type
            </TableHeaderCell>
            <TableHeaderCell>
              Base Voicebank:
            </TableHeaderCell>
            <TableHeaderCell>
              Added on VocaDB on:
            </TableHeaderCell>
            <TableHeaderCell>
              Vocal Synth Released on:
            </TableHeaderCell>
            <TableHeaderCell>
              VocaDB ID
            </TableHeaderCell>
            <TableHeaderCell>
              Is Listed?
            </TableHeaderCell>
          </TableHeader>
          <TableBody>
            {
              synths.map((synth, idx) => (
                <TableRow key={synth.vdbId} negative={!synth.isListedOnInternalDb}>
                  <TableCell>
                    { idx+1 + CONST__VDB_QUERY_PAGE_SIZE*queryOffset }
                  </TableCell>
                  <TableCell>{synth.originalName}</TableCell>
                  <TableCell>{synth.additionalNames}</TableCell>
                  <TableCell>{synth.type}</TableCell>
                  <TableCell>
                    {
                      synth.baseVoicebank &&
                      <Popup
                        content={
                          <div>
                            <div>
                              VDB: {`${synth.baseVoicebank.vdbName} [${synth.baseVoicebank.vdbType}]`}
                            </div>
                            <div>
                              VLW: { synth.baseVoicebank.internalName ?? "Not Found" }
                            </div>
                          </div>
                        }
                        mouseLeaveDelay={1500}
                        on='hover'
                        inverted
                        position='bottom center'
                        wide={true}
                        trigger={
                          <a 
                            href={`https://vocadb.net/Ar/${synth.baseVoicebank.vdbId}`} 
                            target="_blank"
                          >
                            {synth.baseVoicebank.vdbId}
                          </a>
                        }
                        style={{ zIndex: '1000' }}
                      />
                    }
                  </TableCell>
                  <TableCell>
                    {synth.addedOnVocaDbDate?.toLocaleString('en-US', dateLocale) || ''}
                  </TableCell>
                  <TableCell>
                    {synth.publishedDate?.toLocaleString('en-US', dateLocale) || ''}
                  </TableCell>
                  <TableCell>
                    <a href={`https://vocadb.net/Ar/${synth.vdbId}`} target="_blank">{synth.vdbId}</a>
                  </TableCell>
                  <TableCell>
                    {
                      synth.isListedOnInternalDb ? 
                      <Popup
                        content={
                          <>
                            {synth.internalWikiName}
                            {
                              synth.categoryHasBeenAddedOnWiki ? 
                              <><br />(Category page is not yet added on VLW)</> :
                              null
                            }
                          </>
                        }
                        mouseLeaveDelay={1500}
                        on='hover'
                        inverted
                        position='bottom center'
                        wide={true}
                        trigger={
                          <Icon name="check circle" color="green" />
                        }
                        style={{ zIndex: '1000' }}
                      />
                      :
                      <Icon name="times circle" color="red" />
                    }
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </GridRow>
      <GridRow>
        <Button fluid onClick={handleMoveToNextPage}>
          <Icon name="plus" />
          Next Page
        </Button>
      </GridRow>
      <Dimmer active={isLoading}>
        <Loader>Loading</Loader>
      </Dimmer>
    </Grid>
  )
}