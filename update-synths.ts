import { resolve } from "path";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import sqlite3 from "sqlite3";
import { VocalSynthEngine } from "./src/generators/fetch-schemas.ts";
import type { SchemaFetchedVocaDBArtistsListJson } from "./src/generators/fetch-schemas.ts";

const OFFSET = 0;
const FOR_ARTISTS = [
  VocalSynthEngine.vocaloid, 
  VocalSynthEngine.synthv, 
  VocalSynthEngine.cevio, 
  VocalSynthEngine.newtype, 
  VocalSynthEngine.voisona
];
const VDB_QUERY_PAGE_SIZE = 100;

interface SynthToAddFromVdb {
  vdbId: number
  originalName: string
  vdbType: VocalSynthEngine
  engineId: number
}

const __dirname = process.cwd();

function initDbConnection(): sqlite3.Database {
  const dbFilePath = resolve(__dirname, "./src/assets/synths.db");
  if (!existsSync(dbFilePath)) {
    throw new Error("Database file not found");
  }
  console.log('Connected to database');
  const db = new sqlite3.Database(dbFilePath);
  return db;
}

function fetchListOfSynthsFromVocaDb(db: sqlite3.Database, artistTypes: VocalSynthEngine[], offset: number = 0): Promise<SynthToAddFromVdb[]> {
  return new Promise<SynthToAddFromVdb[]>((resolve, reject) => {
    fetch(
      `https://vocadb.net/api/artists?artistTypes=${artistTypes.join(",")}` + 
      `&allowBaseVoicebanks=true&childTags=false` + 
      `&start=${offset * VDB_QUERY_PAGE_SIZE}&maxResults=${VDB_QUERY_PAGE_SIZE}&sort=AdditionDate` + 
      `&fields=Names,AdditionalNames,BaseVoicebank&lang=Japanese` +
      `&getTotalCount=false&preferAccurateMatches=false`
    )
      .then((res) => res.json())
      .then((json: SchemaFetchedVocaDBArtistsListJson) => {
        let arr: SynthToAddFromVdb[] = json.items.map(({ id, defaultName, artistType }) => ({
          vdbId: id,
          originalName: defaultName,
          vdbType: artistType,
          engineId: mapVdbArtistTypeToInternalEngineId(artistType)
        }));
        db.all(
          `SELECT s.vdb_id AS id FROM synths s WHERE s.vdb_id IN (${arr.map(synth => synth.vdbId).join(',')});`, 
          (err: Error | null, ids: { id: number }[]) => {
            if (err !== null) {
              console.error('fetchListOfSynthsFromVocaDb');
              reject(err);
              return;
            }
            if (ids.length === 0) {
              console.log('synths.db is up-to-date');
              resolve([]);
              return;
            }
            const foundIds = new Set(ids.map(({ id }) => id));
            arr = arr.filter(({ vdbId }) => ( !foundIds.has(vdbId) ));
            resolve(arr);
          }
        );
      })
      .catch(reject);
  });
}

function mapVdbArtistTypeToInternalEngineId(vdbArtistType: VocalSynthEngine): number {
  const dict = {
    [VocalSynthEngine.vocaloid]: 1,
    [VocalSynthEngine.utau]: 2,
    [VocalSynthEngine.cevio]: 3,
    [VocalSynthEngine.synthv]: 4,
    [VocalSynthEngine.ace]: 6,
    [VocalSynthEngine.aivoice]: 5,
    [VocalSynthEngine.voicevox]: 25,
    [VocalSynthEngine.neutrino]: 15,
    [VocalSynthEngine.voisona]: 26,
    [VocalSynthEngine.newtype]: 19,
    [VocalSynthEngine.voiceroid]: 24,
    [VocalSynthEngine.othervoicesynth]: 0
  }
  return dict[vdbArtistType] || 0;
}

function getLastSynthIdInInternalDb(db: sqlite3.Database): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    db.get(`SELECT MAX(id) AS lastid FROM synths;`, (err: Error | null, { lastid }: { lastid: number }) => {
      if (err !== null) {
        console.error(getLastSynthIdInInternalDb);
        reject(err);
        return;
      }
      resolve(lastid);
    })
  });
}

async function writeSqlUpdateDefinitions(db: sqlite3.Database, synthsToAdd: SynthToAddFromVdb[]): Promise<void> {
  try {
    if (synthsToAdd.length === 0) {
      console.log('No data to update');
      return;
    }

    const timestamp = Date.now();
    const folderPath = resolve(__dirname, "./migrations");
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath);
    }
    const filepath = resolve(folderPath, `./${timestamp}.sql`);

    let lastId = await getLastSynthIdInInternalDb(db);

    const sql = `INSERT INTO synths (id, original_name, vdb_id, engine_id, basevb_name, wikicat_name)\nVALUES\n${
      synthsToAdd.map(({ vdbId, originalName, engineId }, idx) => {
        return `\t(${lastId+idx+1}, '${originalName.replace(/'/g, "\\'")}', ${vdbId}, ${engineId}, '', '')`;
      }).join(',\n')
    };`
    writeFileSync(filepath, sql, { flag: 'w+', encoding: 'utf-8' });
    console.log(`Successfully written to file ${filepath}`);
  } catch (err) {
    throw err;
  }
}

async function main() {
  const db = initDbConnection();
  try {
    const arr = await fetchListOfSynthsFromVocaDb(db, FOR_ARTISTS, OFFSET);
    await writeSqlUpdateDefinitions(db, arr);
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
}
main();