import { useAppDataSource } from "../components/DatabaseProvider";

interface dbItem {
  id: number
  name: string
}

export default function useFetchListOfEngines(): dbItem[] {
  try {
    const appSource = useAppDataSource();
    const rawQueryResults = appSource.exec("SELECT * FROM engines;");
    let engines = rawQueryResults[0].values?.map(([id, name]) => ({ 
      id: id as number, 
      name: name as string 
    }));
    return engines;
  } catch (err) {
    console.error(err);
  }
  return [];
}