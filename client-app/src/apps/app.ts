import '../Bootstrap';
import {XH} from '@xh/hoist/core';
import {AppContainer} from '@xh/hoist/desktop/appcontainer';
import {AppComponent} from '../desktop/AppComponent';
import {AppModel} from '../desktop/AppModel';

XH.renderApp({
    clientAppCode: 'app',
    clientAppName: 'Hoist App',
    componentClass: AppComponent,
    modelClass: AppModel,
    containerClass: AppContainer,
    isMobileApp: false,
    enableLogout: true,
    webSocketsEnabled: true,
    checkAccess: () => true
});
