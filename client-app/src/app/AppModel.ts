import {a, p, placeholder} from '@xh/hoist/cmp/layout';
import {TabContainerModel} from '@xh/hoist/cmp/tab';
import {HoistAppModel, LoadSpec, XH} from '@xh/hoist/core';
import {
    autoRefreshAppOption,
    sizingModeAppOption,
    themeAppOption
} from '@xh/hoist/desktop/cmp/appOption';
import {Icon} from '@xh/hoist/icon';
import {workTab} from './work/WorkTab';

export class AppModel extends HoistAppModel {
    static instance: AppModel;

    tabModel: TabContainerModel;

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
                        placeholder(
                            Icon.home(),
                            p('Welcome home!'),
                            a({item: 'Now go to work...', onClick: () => this.goToWork()})
                        )
                },
                {
                    id: 'work',
                    icon: Icon.portfolio(),
                    content: workTab
                }
            ]
        });

        await this.loadAsync();
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        const {greeting} = await XH.fetchJson({
            url: 'helloWorld',
            loadSpec
        });

        XH.successToast(`👋 ${greeting}`);
    }

    override getRoutes() {
        return [
            {
                name: 'default',
                path: '/app',
                children: [
                    {name: 'home', path: '/home'},
                    {name: 'work', path: '/work'}
                ]
            }
        ];
    }

    override getAppOptions() {
        return [themeAppOption(), sizingModeAppOption(), autoRefreshAppOption()];
    }

    goToWork() {
        this.tabModel.activateTab('work');
    }
}
