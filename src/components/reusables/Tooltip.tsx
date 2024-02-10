import { ReactNode } from 'react';
import { Popup, Icon, IconGroup } from 'semantic-ui-react';

interface TooltipPropsInterface {
  content: ReactNode
  required?: boolean
  wide?: boolean
}

export default function Tooltip({ content, required = false, wide = false }: TooltipPropsInterface) {

  let trigger: ReactNode = (<Icon name='help circle' />);
  if (required) {
    trigger = (
      <IconGroup>
        {trigger}
        <Icon corner='top right' name='asterisk' color='red' />
      </IconGroup>
    )
  }

  return (
    <Popup
      content={
        <>
          { content }
          { required && <><hr />(required)</> }
        </>
      }
      mouseLeaveDelay={1500}
      on='hover'
      inverted
      position='bottom center'
      wide={wide}
      trigger={trigger}
      style={{ zIndex: '1000' }}
    />
  )
}