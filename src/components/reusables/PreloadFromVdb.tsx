import { Input, Button } from 'semantic-ui-react';

interface Props {
  handleFetchFromVocadb: () => void
  loading: boolean
  mode: 'S' | 'Al' | 'Ar'
  // value: string | null 
  // onChange: (value: string) => void
  setStateOnBlur: (value: string) => void 
}

export default function PreloadFromVdb({
  handleFetchFromVocadb, loading, mode, setStateOnBlur
}: Props) {
  return (
    <Input 
      fluid 
      placeholder={`https://vocadb.net/${mode}/...`} 
      label={
        <Button onClick={handleFetchFromVocadb} loading={loading}>
          Pre-load
        </Button>
      }
      // value={value}
      // onChange={(_, data) => onChange(data.value)}
      onBlur={(e: Event) => {
        // @ts-ignore
        setStateOnBlur(e?.target?.value || '');
      }}
      labelPosition='right'
    />
  )
}