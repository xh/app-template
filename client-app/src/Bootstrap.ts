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
    AllCommunityModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    provideGlobalGridOptions
} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

// Register the full community module set. Curating a module-by-module list saves no meaningful
// bundle size in a typical Hoist app, and a missing module fails silently at runtime - notably
// `RowDragModule`, which the grid column chooser needs for drag-and-drop reordering.
ModuleRegistry.registerModules([AllCommunityModule]);

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

// Check https://api.highcharts.com/highcharts/ for modules that require other base modules and
// import in order.
import 'highcharts/modules/exporting';
import 'highcharts/modules/heatmap';
import 'highcharts/modules/treemap';

// `treegraph` must be imported after `treemap`
import 'highcharts/modules/treegraph';

// `export-data` + `offline-exporting` must be imported after `exporting`
import 'highcharts/modules/export-data';
import 'highcharts/modules/offline-exporting';

installHighcharts(Highcharts);
