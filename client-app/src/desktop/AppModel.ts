import {div} from '@xh/hoist/cmp/layout';
import {TabContainerModel} from '@xh/hoist/cmp/tab';
import {HoistAppModel, managed, XH} from '@xh/hoist/core';
import {
    autoRefreshAppOption,
    sizingModeAppOption,
    themeAppOption
} from '@xh/hoist/desktop/cmp/appOption';
import {Icon} from '@xh/hoist/icon';
import {AuthService} from '../core/svc/AuthService';

export class AppModel extends HoistAppModel {
    static instance: AppModel;

    @managed tabModel: TabContainerModel;

    static override async preAuthAsync() {
        await XH.installServicesAsync(AuthService);
    }

    override async initAsync() {
        await super.initAsync();

        this.tabModel = new TabContainerModel({
            route: 'default',
            track: true,
            switcher: false,
            tabs: [
                {
                    id: 'home',
                    icon: Icon.home(),
                    content: () =>
                        div({
                            item: 'Welcome home!',
                            className: 'xh-pad'
                        })
                }
            ]
        });
    }

    override async logoutAsync() {
        return XH.authService.logoutAsync();
    }

    override getAppOptions() {
        return [themeAppOption(), sizingModeAppOption(), autoRefreshAppOption()];
    }

    override getRoutes() {
        return [
            {
                name: 'default',
                path: '/app',
                children: [
                    {
                        name: 'home',
                        path: '/home'
                    }
                ]
            }
        ];
    }

    goHome() {
        this.tabModel.activateTab('home');
    }
}
