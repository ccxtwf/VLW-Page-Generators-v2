// Register Handsontable modules
// @ts-ignore
import Handsontable from 'handsontable/base';
import {
  registerCellType,
  AutocompleteCellType,
  CheckboxCellType,
  DropdownCellType,
  HandsontableCellType,
  NumericCellType,
  TextCellType
  // @ts-ignore
} from 'handsontable/cellTypes';
import {
  registerRenderer,
  autocompleteRenderer,
  checkboxRenderer,
  // dropdownRenderer,
  numericRenderer,
  textRenderer
  // @ts-ignore
} from 'handsontable/renderers';
import {
  registerEditor,
  AutocompleteEditor,
  CheckboxEditor,
  DropdownEditor,
  HandsontableEditor,
  NumericEditor,
  TextEditor
  // @ts-ignore
} from 'handsontable/editors';
import {
  registerValidator,
  autocompleteValidator,
  // dropdownValidator,
  numericValidator,
  // @ts-ignore
} from 'handsontable/validators';

import {
  registerPlugin, // plugins' registering function
  AutoColumnSize,
  AutoRowSize,
  Autofill,
  BasePlugin,
  ContextMenu,
  CopyPaste,
  DragToScroll,
  // DropdownMenu,
  HiddenColumns,
  // HiddenRows,
  // ManualColumnFreeze,
  ManualColumnMove,
  ManualColumnResize,
  ManualRowMove,
  ManualRowResize,
  // MultipleSelectionHandles,
  // PersistentState,
  TrimRows,
  UndoRedo,
  // @ts-ignore
} from 'handsontable/plugins';

export function registerHandsontableCellTypes() {
  // Cell types
  registerCellType(AutocompleteCellType);
  registerCellType(CheckboxCellType);
  registerCellType(DropdownCellType);
  registerCellType(HandsontableCellType);
  registerCellType(NumericCellType);
  registerCellType(TextCellType);

  // Renderers
  registerRenderer(numericRenderer);
  // registerRenderer(dropdownRenderer);
  registerRenderer(autocompleteRenderer);
  registerRenderer(textRenderer);
  registerRenderer(checkboxRenderer);

  // Editors
  registerEditor(AutocompleteEditor);
  registerEditor(CheckboxEditor);
  registerEditor(DropdownEditor);
  registerEditor(HandsontableEditor);
  registerEditor(NumericEditor);
  registerEditor(TextEditor);

  // Validators
  registerValidator(autocompleteValidator);
  // registerValidator(dropdownValidator);
  registerValidator(numericValidator);

  if (import.meta.env.DEV) console.log('Registered Handsontable cell types');
}

export function registerHandsontablePlugins() {
  registerPlugin(AutoColumnSize);
  registerPlugin(AutoRowSize);
  registerPlugin(Autofill);
  registerPlugin(BasePlugin);
  registerPlugin(ContextMenu);
  registerPlugin(CopyPaste);
  registerPlugin(DragToScroll);
  registerPlugin(HiddenColumns);
  registerPlugin(ManualColumnMove);
  registerPlugin(ManualColumnResize);
  registerPlugin(ManualRowMove);
  registerPlugin(ManualRowResize);
  registerPlugin(TrimRows);
  registerPlugin(UndoRedo);

  if (import.meta.env.DEV) console.log('Registered Handsontable plugins');
}

// import { registerAllModules } from 'handsontable/registry';
// registerAllModules();