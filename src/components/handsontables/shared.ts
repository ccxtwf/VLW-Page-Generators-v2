import { PredefinedMenuItemKey } from "handsontable/plugins/contextMenu";

// @ts-ignore
export const urlRenderer = (instance, td, row, col, prop, value, cellProperties) => {
  if ((value || '').match(/^https?:\/\//) === null) {
    td.innerText = value;
  } else {
    value = value.replace('<', '&lt;').replace('>', '&gt;');
    td.innerHTML = `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>`;
  }
  return td;
}

export const sharedContextMenuOptions: PredefinedMenuItemKey[] = [
  'copy', 'cut', '---------',
  'undo', 'redo', '---------',
  'row_above', 'row_below', 'remove_row',
  'clear_column'
]