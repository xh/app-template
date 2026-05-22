/**
 * Bootstrap routine for registering common client-side licenses and other low-level library setup.
 * Common routines to go in this file include:
 *  - TypeScript module augmentation
 *  - AG Grid license registration and feature registration.
 *  - Highcharts feature registration.
 */

//-----------------------------------------------------------------
// App Services -- Import and Register
//-----------------------------------------------------------------
declare module '@xh/hoist/core' {
    // Merge interface with XHApi class to include injected services.
    export interface XHApi {
        // someAppService: SomeAppService;
    }

    // Merge interface with HoistUser class to include additional app-specific user properties.
    export interface HoistUser {
        // someCustomUserProperty: string;
    }
}

//-----------------------------------------------------------------
// AG Grid Registration
// You must provide and install a suitable Enterprise license if importing and activating any
// enterprise features.
//-----------------------------------------------------------------
import {installAgGrid} from '@xh/hoist/kit/ag-grid';
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    CustomEditorModule,
    ModuleRegistry,
    PinnedRowModule,
    provideGlobalGridOptions,
    RenderApiModule,
    RowApiModule,
    RowAutoHeightModule,
    RowSelectionModule,
    RowStyleModule,
    ScrollApiModule,
    TextEditorModule,
    TextFilterModule,
    TooltipModule
} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

// Standard community modules - the baseline set Hoist needs for grids to work.
ModuleRegistry.registerModules([
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    CustomEditorModule,
    PinnedRowModule,
    RenderApiModule,
    RowApiModule,
    RowAutoHeightModule,
    RowSelectionModule,
    RowStyleModule,
    ScrollApiModule,
    TextEditorModule,
    TextFilterModule,
    TooltipModule
]);

// Opt in to the legacy CSS-variable theme system Hoist styles target. Required for AG Grid v33+.
provideGlobalGridOptions({theme: 'legacy'});

installAgGrid(AgGridReact as any, ClientSideRowModelModule.version);

// Uncomment and adapt to register Enterprise features if you have a license. Typical Hoist apps
// pull additional modules such as MenuModule, RowGroupingModule, TreeDataModule, ClipboardModule,
// CellSelectionModule, etc. from `ag-grid-enterprise`. See toolbox/Bootstrap.ts for a fuller list.
//
// import {LicenseManager, MenuModule, RowGroupingModule} from 'ag-grid-enterprise';
// import {when} from '@xh/hoist/mobx';
// import {XH} from '@xh/hoist/core';
// ModuleRegistry.registerModules([MenuModule, RowGroupingModule]);
// when(
//     () => XH.appIsRunning,
//     () => {
//         const agLicense = XH.getConf('jsLicenses').agGrid;
//         if (agLicense) LicenseManager.setLicenseKey(agLicense);
//     }
// );

//-------------------------------------------------------------------------------
// Highcharts Registration
// You must ensure you are suitably licensed for any features (e.g. highstock) that require it.
//-------------------------------------------------------------------------------
import {installHighcharts} from '@xh/hoist/kit/highcharts';
import Highcharts from 'highcharts/highstock';
import highchartsExportData from 'highcharts/modules/export-data';
import highchartsExporting from 'highcharts/modules/exporting';
import highchartsHeatmap from 'highcharts/modules/heatmap';
import highchartsOfflineExporting from 'highcharts/modules/offline-exporting';
import highchartsTree from 'highcharts/modules/treemap';
import highchartsTreeGraph from 'highcharts/modules/treegraph';

highchartsExportData(Highcharts);
highchartsExporting(Highcharts);
highchartsHeatmap(Highcharts);
highchartsOfflineExporting(Highcharts);
highchartsTree(Highcharts);
highchartsTreeGraph(Highcharts);
installHighcharts(Highcharts);
