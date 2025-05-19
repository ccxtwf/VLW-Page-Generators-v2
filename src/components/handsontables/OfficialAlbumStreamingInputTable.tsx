import { ForwardedRef, forwardRef, useMemo, useState, useEffect } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';
import { urlRenderer } from "./shared";
import { CONST_ALBUM_STREAMING_LINKS } from "../../constants/linkDomains";
import { IDictionary } from "../../types";

const OfficialAlbumStreamingInputTable = forwardRef(function OfficialAlbumStreamingInputTable(
  _,
  ref: ForwardedRef<any>
) {

  const headerText = useMemo(() => ['Type', 'URL'], []);
  let columnWidths = useMemo(() => [80, 200], []);
  
  const [selectedOptions, setSelectedOptions] = useState<IDictionary<number>>(
    () => {
      const options: IDictionary<number> = {};
      for (let o of CONST_ALBUM_STREAMING_LINKS.map(el => el.name)) {
        options[o] = 1;
      }
      return options;
    }
  );

  const columnDefinitions = useMemo(() => [
    { 
      type: 'dropdown',
      source: Object.entries(selectedOptions)
        .filter(([_, c]) => c === 0)
        .map(([o, _]) => o),
      strict: false,
      allowInvalid: true,
      validator: undefined
    },
    { 
      type: 'text', 
      renderer: urlRenderer
    },
  ], [selectedOptions]);

  const rowAddingIsDisabled = useMemo(() => (options: string[]) => {
    const hasBlanks = options.some((el) => (el || '') === '');
    if (hasBlanks) return true;
    console.log(selectedOptions);
    const hasAvailableOptions = Object.values(selectedOptions).every(el => el > 0);
    return hasAvailableOptions;
  }, [selectedOptions]);

  const contextMenuOptions = useMemo(() => ({
    items: {
      copy: { disabled: false },
      cut: { disabled: false },
      sp1: '---------',
      undo: { disabled: false },
      redo: { disabled: false },
      sp2: '---------',
      row_above: { 
        disabled() {
          //@ts-ignore
          const options: string[] = this.getData().map((rw) => rw[0]);
          return rowAddingIsDisabled(options);
        }
      }, 
      row_below: { 
        disabled() {
          //@ts-ignore
          const options: string[] = this.getData().map((rw) => rw[0]);
          return rowAddingIsDisabled(options);
        }
      }, 
      remove_row: { 
        disabled: false,
        //@ts-ignore
        callback(key, selection, clickEvent) {
          const { start: { row: fromRow = null } = {}, end: { row: toRow = null } = {} } = (selection || [{}])[0];
          const options = {...selectedOptions};
          for (let i = fromRow; i <= toRow; i++) {
            //@ts-ignore
            const removedOption = ref?.current?.hotInstance.getDataAtCell(i, 0) || '';
            console.log(removedOption);
            if (removedOption !== '') options[removedOption] = 0;
          }
          setSelectedOptions(options);
          //@ts-ignore
          ref?.current?.hotInstance.alter(key, fromRow, toRow-fromRow+1);
        }
      },
      clear_column: { disabled: false }
    }
  }), [selectedOptions]);

  const handleChanges = useMemo(() => (changes: any[][] | null) => {
    console.log('Detected change');
    console.log('selectedOptions', selectedOptions)
    for (let change of (changes || [])) {
      const [_, colId, oldValue, newValue] = change;
      if (colId !== 0) return;
      if ((oldValue || '') !== '' && (newValue || '') === '') {
        setSelectedOptions({
          ...selectedOptions,
          [oldValue]: 0,
        });
      } else if ((oldValue || '') === '' && (newValue || '') !== '') {
        setSelectedOptions({
          ...selectedOptions,
          [newValue]: 1,
        });
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [oldValue]: 0,
          [newValue]: 1,
        })
      }
    }
  }, [selectedOptions]);
  
  useEffect(() => {
    console.log('Updated settings');
    console.log(columnDefinitions);
    //@ts-ignore
    ref?.current?.hotInstance?.updateSettings({
      columns: columnDefinitions,
      contextMenu: contextMenuOptions,
      afterChange: handleChanges,
    })
  }, [selectedOptions]);

  return (
    <div className="table-container">
      <HotTable
        ref={ref}
        tableClassName='playlinks-table'
        rowHeaders={true}
        colHeaders={headerText}
        columns={columnDefinitions}
        width="100%"
        contextMenu={contextMenuOptions}
        autoWrapRow={true}
        autoWrapCol={true}
        manualColumnResize={true}
        // imeFastEdit={true}
        selectionMode="multiple"
        rowHeights={30}
        colWidths={columnWidths}
        stretchH="all"
        minSpareRows={0}
        afterChange={handleChanges}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default OfficialAlbumStreamingInputTable;