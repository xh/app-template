import {AppComponent} from '@xh/hoist/admin/AppComponent';
import {XH} from '@xh/hoist/core';
import {AppContainer} from '@xh/hoist/desktop/appcontainer';
import {AppModel} from '../admin/AppModel';
import {AuthModel} from '../core/AuthModel';

import '@/Bootstrap';

XH.renderApp({
    clientAppCode: 'admin',
    clientAppName: 'Hoist App Admin',
    componentClass: AppComponent,
    modelClass: AppModel,
    containerClass: AppContainer,
    authModelClass: AuthModel,
    isMobileApp: false,
    enableLogout: true,
    webSocketsEnabled: true,
    checkAccess: 'HOIST_ADMIN_READER'
});
