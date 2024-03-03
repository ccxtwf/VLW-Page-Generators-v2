import { useAsync } from "react-use";

import initSqlJs from "sql.js";
import { createContext, FunctionComponent, PropsWithChildren, useContext } from "react";

import wasm from "sql.js/dist/sql-wasm.wasm?url";

import dbUrl from "../assets/synths.db?url";

import { Dimmer, Loader } from "semantic-ui-react";

interface DatabaseContextProps {
  AppDataSource: initSqlJs.Database
}

const DatabaseContext = createContext<DatabaseContextProps>({
  AppDataSource: {} as initSqlJs.Database,
});

let AppDataSource: initSqlJs.Database;
export const DatabaseProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const { value, loading } = useAsync(async () => {    
    try {
      // Initialize SQL.js database connection
      const SQL = await initSqlJs({
        locateFile: () => wasm,
      });
      const buf = await fetch(dbUrl).then(res => res.arrayBuffer());
      const db = new SQL.Database(new Uint8Array(buf));
      if (import.meta.env.DEV) console.log("Initialized DB connection");
      return db;
    } catch (e) {
      console.error(e);
    }
  }, []);

  
  if (loading) {
    return (
      <Dimmer active>
        <Loader>Loading</Loader>
      </Dimmer>
    )
  }

  AppDataSource = value!;

  return (
    <DatabaseContext.Provider
      value={{
        AppDataSource: value!,
      }}
    >
      {!loading && children}
    </DatabaseContext.Provider>
  );
};

export const useAppDataSource = () => {
  const { AppDataSource } = useContext(DatabaseContext);
  return AppDataSource;
};

/**
 * Used outside the provider or in functions.
 */
export { AppDataSource };