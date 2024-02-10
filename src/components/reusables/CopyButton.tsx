import { useState } from 'react';

import { Button, Popup } from 'semantic-ui-react';

interface Params {
  copyState: string
}

export default function CopyButton({ copyState }: Params) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Popup 
      content='Copied to clipboard'
      position='top center'
      open={open}
      onClose={() => setOpen(false)}
      trigger={
        <Button 
          basic color='blue'
          onClick={() => {
            navigator.clipboard.writeText(copyState);
            setOpen(true);
          }}
        >
          Copy Output
        </Button>
      }
    />
  )
}