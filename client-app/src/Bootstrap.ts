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
//-----------------------------------------------------------------
import {installAgGrid} from '@xh/hoist/kit/ag-grid';
import {XH} from '@xh/hoist/core';
import {when} from '@xh/hoist/mobx';
import {
    AllCommunityModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    provideGlobalGridOptions
} from 'ag-grid-community';
import {AllEnterpriseModule, LicenseManager} from 'ag-grid-enterprise';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

// Register the full community and enterprise module sets. Curating a module-by-module list saves
// little in shipped code, and a missing module fails silently at runtime rather than erroring -
// e.g. the enterprise TreeDataModule, which the Hoist Admin Console requires for the tree grids on
// its Cluster Objects, Activity Tracking, and Roles tabs, and the community RowDragModule, which
// the grid column chooser needs for drag-and-drop reordering.
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// Opt in to the legacy CSS-variable theme system Hoist styles target. Required for AG Grid v33+.
provideGlobalGridOptions({theme: 'legacy'});

installAgGrid(AgGridReact as any, ClientSideRowModelModule.version);

// AG Grid Enterprise requires a paid license. Hoist itself needs it for the Admin Console tree
// grids above, so the dependency is not optional for a standard app. Put your key in the
// `jsLicenses` config (Admin Console > Configs) under `agGrid`. Without one, grids stay fully
// functional but render an evaluation watermark and log a console error.
when(
    () => XH.appIsRunning,
    () => {
        const agLicense = XH.getConf('jsLicenses')?.agGrid;
        if (agLicense) LicenseManager.setLicenseKey(agLicense);
    }
);

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
