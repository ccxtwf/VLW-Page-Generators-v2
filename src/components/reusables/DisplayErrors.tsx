import { Message, MessageHeader } from 'semantic-ui-react';
import { displayErrorsInterface } from "../../types";

export default function DisplayError({ errors, warnings, recommendToAutoloadCategories }: displayErrorsInterface) {
  return (
    <div>
      {
        errors.length === 0 ?
        null :
        <Message negative>
          <MessageHeader>Errors</MessageHeader>
          <ul>
          { errors.map((el, idx) => (<li key={idx}>{el}</li>)) }
          </ul>
        </Message>
      }
      {
        warnings.length === 0 ?
        null :
        <Message>
          <MessageHeader>Warnings</MessageHeader>
          <ul>
          { warnings.map((el, idx) => (<li key={idx}>{el}</li>)) }
          </ul>
        </Message>
      }
      {
        recommendToAutoloadCategories &&
        <Message positive>
          It is recommended to click the 'Autoload Categories' button before generating the page again.
        </Message>
      }
    </div>
  )
}