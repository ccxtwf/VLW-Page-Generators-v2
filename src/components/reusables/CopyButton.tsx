import { useState } from 'react';
import { useThemeMode } from '../ThemeModeProvider';

import { Button, Popup } from 'semantic-ui-react';

interface Params {
  copyState: string
}

export default function CopyButton({ copyState }: Params) {
  const [open, setOpen] = useState<boolean>(false);
  const { isDarkMode } = useThemeMode();
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
          inverted={isDarkMode}
        >
          Copy Output
        </Button>
      }
    />
  )
}