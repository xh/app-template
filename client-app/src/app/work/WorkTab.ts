import {creates, hoistCmp} from '@xh/hoist/core';
import {WorkModel} from './WorkModel';
import {grid, gridCountLabel} from '@xh/hoist/cmp/grid';
import {panel} from '@xh/hoist/desktop/cmp/panel';
import {toolbar} from '@xh/hoist/desktop/cmp/toolbar';
import {Icon} from '@xh/hoist/icon';
import './WorkTab.scss';
import {filler, span} from '@xh/hoist/cmp/layout';
import {storeFilterField} from '@xh/hoist/cmp/store';
import {button} from '@xh/hoist/desktop/cmp/button';

export const workTab = hoistCmp.factory({
    displayName: 'Work Tab',
    className: 'app-work-tab',
    model: creates(WorkModel),

    render({model, className}) {
        return panel({
            title: 'TODOs',
            icon: Icon.checkSquare(),
            className,
            height: 400,
            width: 700,
            tbar: tbar(),
            item: grid(),
            mask: 'onLoad'
        });
    }
});

const tbar = hoistCmp.factory<WorkModel>({
    render({model}) {
        return toolbar({
            items: [
                span(`Completed ${model.completedCount} / `),
                gridCountLabel({unit: 'task'}),
                filler(),
                storeFilterField(),
                '-',
                button({
                    icon: Icon.refresh(),
                    intent: 'success',
                    onClick: () => model.refreshAsync()
                })
            ]
        });
    }
});
