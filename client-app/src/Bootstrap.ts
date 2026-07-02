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
// You must provide and install a suitable Enterprise license if importing and activating any enterprise features.
//-----------------------------------------------------------------
import {installAgGrid} from '@xh/hoist/kit/ag-grid';
import {ModuleRegistry, provideGlobalGridOptions} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

// 1) Standard community modules - required for all Hoist Apps.
import {
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
} from 'ag-grid-community';
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

// 2) Typical enterprise modules - required by Hoist's Admin Console, useful for most apps.
import {
    CellSelectionModule,
    ClipboardModule,
    MenuModule,
    RowGroupingModule,
    TreeDataModule
} from 'ag-grid-enterprise';
ModuleRegistry.registerModules([
    CellSelectionModule,
    ClipboardModule,
    MenuModule,
    RowGroupingModule,
    TreeDataModule
]);

// Use the legacy CSS-based theme (ag-theme-balham.css above) rather than AG Grid's newer
// JS-based Theming API.
provideGlobalGridOptions({theme: 'legacy'});

installAgGrid(AgGridReact as any, ClientSideRowModelModule.version);

// Pattern below is used to register enterprise license from config, if you do not wish to commit your license
// key directly to the source code.
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

// Check https://api.highcharts.com/highcharts/ for modules that require other base modules and
// import in order. Highcharts v12 modules self-register via side effect - do not call as functions.
import 'highcharts/modules/exporting';
import 'highcharts/modules/heatmap';
import 'highcharts/modules/treemap';

// `treegraph` must be imported after `treemap`
import 'highcharts/modules/treegraph';

// `export-data` + `offline-exporting` must be imported after `exporting`
import 'highcharts/modules/export-data';
import 'highcharts/modules/offline-exporting';

installHighcharts(Highcharts);
