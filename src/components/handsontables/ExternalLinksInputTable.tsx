import { ForwardedRef, forwardRef, useMemo } from "react";
// @ts-ignore
import { HotTable } from '@handsontable/react';
import { urlRenderer, sharedContextMenuOptions } from "./shared";
import { RECOGNIZED_LINKS, PV_SERVICE_PROVIDER } from "../../constants/linkDomains";
import { convertTwitterLink, standardizeYoutubeLink, upgradeInsecureHttpLink } from "../../utils";

interface ExternalLinksTableInterface {
  forProducerPages?: boolean
}

const ExternalLinksInputTable = forwardRef(function ExternalLinksInputTable(
  { forProducerPages = false }: ExternalLinksTableInterface, 
  ref: ForwardedRef<any>
) {

  const { headerText, columnDefinitions, columnWidths } = useMemo(() => {
    const headerText = ['URL', 'Description', 'Official'];
    const columnDefinitions = [
      { 
        type: 'text', 
        renderer: urlRenderer
      },
      { type: 'text' },
      { type: 'checkbox', className: 'htCenter htMiddle' }
    ];
    let columnWidths = [60, 30, 10];
    if (forProducerPages) {
      headerText.push(...['Media', 'Inactive?']);
      columnDefinitions.push(...[
        { type: 'checkbox', className: 'htCenter htMiddle' },
        { type: 'checkbox', className: 'htCenter htMiddle' }
      ])
      columnWidths = [60, 25, 5, 5, 5];
    }
    return { headerText, columnDefinitions, columnWidths };
  }, []);

  const handleChanges = useMemo(() => (changes: any[][] | null) => {
    for (let change of (changes || [])) {
      let [rowId, colId, oldValue, newValue] = change;
      if (oldValue === newValue) continue;
      if (colId === 0) {    // changed cell is URL 
        const referUrl = RECOGNIZED_LINKS.find(({ re }) => {
          return newValue.match(re) !== null;
        });
        if (!!referUrl) {
          // @ts-ignore
          ref?.current?.hotInstance?.setDataAtCell(rowId, 1, referUrl.site);   // set description automatically
          if (referUrl.site === PV_SERVICE_PROVIDER.youtube) {
            newValue = standardizeYoutubeLink(newValue); 
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

  return (
    <div className="table-container">
      <HotTable
        ref={ref}
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
        colWidths={columnWidths}
        stretchH="all"
        minSpareRows={0}
        afterChange={handleChanges}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
});

export default ExternalLinksInputTable;