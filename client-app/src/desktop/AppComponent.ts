import {tabContainer} from '@xh/hoist/cmp/tab';
import {hoistCmp, uses} from '@xh/hoist/core';
import {appBar} from '@xh/hoist/desktop/cmp/appbar';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {tabSwitcher} from '@xh/hoist/desktop/cmp/tab';
import {Icon} from '@xh/hoist/icon';
import {AppModel} from './AppModel';

export const AppComponent = hoistCmp({
    displayName: 'App',
    model: uses(AppModel),

    render({model}) {
        return panel({
            tbar: appBar({
                icon: Icon.rocket({size: '2x'}),
                leftItems: [tabSwitcher({enableOverflow: true})]
            }),
            hotkeys: [
                {
                    label: 'Switch to the home tab',
                    combo: 'shift + h',
                    global: true,
                    onKeyDown: () => model.goHome()
                }
            ],
            item: tabContainer(),
            mask: 'onLoad'
        });
    }
});
