import {div} from '@xh/hoist/cmp/layout';
import {TabContainerModel} from '@xh/hoist/cmp/tab';
import {HoistAppModel, managed} from '@xh/hoist/core';
import {
    autoRefreshAppOption,
    sizingModeAppOption,
    themeAppOption
} from '@xh/hoist/desktop/cmp/appOption';
import {Icon} from '@xh/hoist/icon';

export class AppModel extends HoistAppModel {
    static instance: AppModel;

    @managed tabModel: TabContainerModel;

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
