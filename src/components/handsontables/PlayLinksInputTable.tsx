import { ForwardedRef, forwardRef, useMemo } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';
import { PV_SERVICES, PV_SERVICE_PROVIDER } from "../../constants/linkDomains";
import { urlRenderer, sharedContextMenuOptions } from "./shared";
import { convertAvidToBvId, convertTwitterLink, standardizeYoutubeLink, upgradeInsecureHttpLink } from "../../utils";

const PlayLinksInputTable = forwardRef(function PlayLinksInputTable(
  _,
  ref: ForwardedRef<any>
) {

  const headerText = ['Site', 'URL', 'Reprint?', 'Auto-gen?', 'Deleted?', 'View Count'];

  const handleChanges = useMemo(() => (changes: any[][] | null) => {
    for (let change of (changes || [])) {
      let [rowId, colId, oldValue, newValue] = change;
      if (oldValue === newValue) continue;
      if (colId === 1) {    // changed cell is URL 
        const referUrl = PV_SERVICES.find(({ re }) => {
          return newValue.match(re) !== null;
        });
        if (!!referUrl) {
          // @ts-ignore
          ref?.current?.hotInstance?.setDataAtCell(rowId, 0, referUrl.site);   // set description automatically
          if (referUrl.site === PV_SERVICE_PROVIDER.youtube) {
            newValue = standardizeYoutubeLink(newValue); 
          }
          if (referUrl.site === PV_SERVICE_PROVIDER.bilibili) {
            newValue = convertAvidToBvId(newValue);
          }
          if (referUrl.site === PV_SERVICE_PROVIDER.xitter) {
            newValue = convertTwitterLink(newValue);
          }
          if ((Object.values(PV_SERVICE_PROVIDER) as string[]).includes(referUrl.site || '')) {
            newValue = upgradeInsecureHttpLink(newValue);
          }
          // @ts-ignore
          ref?.current?.hotInstance?.setDataAtCell(rowId, colId, newValue);
        }
      }
    }
  }, []);
  
  const columnDefinitions = useMemo(() => [
    { 
      type: 'dropdown',
      source: PV_SERVICES.map(el => el.site),
      strict: false,
      allowInvalid: true,
      validator: undefined
    },
    { 
      type: 'text', 
      renderer: urlRenderer
    },
    { type: 'checkbox', className: 'htCenter htMiddle' },
    { type: 'checkbox', className: 'htCenter htMiddle' },
    { type: 'checkbox', className: 'htCenter htMiddle' },
    { type: 'text' }
  ], []);

  return (
    <div className="table-container">
      <HotTable
        ref={ref}
        tableClassName='playlinks-table'
        rowHeaders={true}
        colHeaders={headerText}
        columns={columnDefinitions}
        width="100%"
        contextMenu={sharedContextMenuOptions}
        autoWrapRow={true}
        autoWrapCol={true}
        manualColumnResize={true}
        // imeFastEdit={true}
        selectionMode="multiple"
        rowHeights={30}
        colWidths={[20, 35, 10, 10, 10, 15]}
        stretchH="all"
        // minSpareRows={0}
        afterChange={handleChanges}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default PlayLinksInputTable;