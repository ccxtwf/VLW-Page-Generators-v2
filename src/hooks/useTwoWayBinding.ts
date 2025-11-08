import { 
  // ChangeEvent, 
  FormEvent, Dispatch, SetStateAction, SyntheticEvent } from "react";
import { 
  // InputOnChangeData, TextAreaProps, 
  CheckboxProps, DropdownProps 
} from "semantic-ui-react";

interface BindInput {
  // value: any
  // onChange: (_: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void
  onBlur: (e: Event) => void
}
interface BindTextArea {
  // value: any
  // onChange: (_: ChangeEvent<HTMLTextAreaElement>, data: TextAreaProps) => void
  onBlur: (e: Event) => void
}
interface BindCheckbox {
  checked: boolean
  onChange: (_: FormEvent<HTMLInputElement>, data: CheckboxProps) => void
}
interface BindDropdown {
  value: any
  onChange: (_: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => void
}

export default function useTwoWayBinding<T>(state: T, setState: Dispatch<SetStateAction<T>>) {
  
  const bindInput = (key: string): BindInput => {
    return {
      // value: (state as any)[key],
      // onChange: (_: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      //   // console.log("Input changed");
      //   setState({
      //     ...state,
      //     [key]: data.value
      //   })
      // }
      onBlur: (e: Event) => {
        setState({
          ...state,
          //@ts-ignore
          [key]: e.target.value
        })
      }
    }
  }
  const bindTextArea = (key: string): BindTextArea => {
    return {
      // value: (state as any)[key],
      // onChange: (_: ChangeEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
      //   // console.log("Input changed");
      //   setState({
      //     ...state,
      //     [key]: data.value
      //   })
      // }
      onBlur: (e: Event) => {
        setState({
          ...state,
          //@ts-ignore
          [key]: e.target.value
        })
      }
    }
  }
  const bindCheckbox = (key: string): BindCheckbox => {
    return {
      checked: (state as any)[key],
      onChange: (_: FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        // console.log("Checkbox changed");
        setState({
          ...state,
          [key]: data.checked
        })
      }
    }
  }
  const bindDropdown = (key: string): BindDropdown => {
    return {
      value: (state as any)[key],
      onChange: (_: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        // console.log("Dropdown changed");
        setState({
          ...state,
          [key]: data.value
        })
      }
    }
  }
  
  return {bindInput, bindTextArea, bindCheckbox, bindDropdown}
}