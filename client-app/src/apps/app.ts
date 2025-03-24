import {XH} from '@xh/hoist/core';
import {AppContainer} from '@xh/hoist/desktop/appcontainer';
import {AppComponent} from '../desktop/AppComponent';
import {AppModel} from '../desktop/AppModel';
import {AuthModel} from '../core/AuthModel';

import '@/Bootstrap';

XH.renderApp({
    clientAppCode: 'app',
    clientAppName: 'Hoist App',
    componentClass: AppComponent,
    modelClass: AppModel,
    containerClass: AppContainer,
    authModelClass: AuthModel,
    isMobileApp: false,
    enableLogout: true,
    webSocketsEnabled: true,
    checkAccess: () => true
});
