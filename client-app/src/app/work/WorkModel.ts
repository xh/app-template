import {GridModel} from '@xh/hoist/cmp/grid';
import {HoistModel, LoadSpec, managed, XH} from '@xh/hoist/core';
import {Icon} from '@xh/hoist/icon';
import {computed} from '@xh/hoist/mobx';

export class WorkModel extends HoistModel {
    @managed gridModel: GridModel;

    @computed
    get completedCount(): number {
        return this.gridModel.store.records.filter(it => it.data.completed).length;
    }

    constructor() {
        super();
        this.gridModel = this.createGridModel();
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        const {gridModel} = this;

        try {
            const todos = await XH.fetchJson({
                url: 'https://jsonplaceholder.typicode.com/todos',
                loadSpec
            });

            gridModel.loadData(todos);
            XH.successToast({
                icon: Icon.checkSquare(),
                message: 'TODOs loaded successfully'
            });
        } catch (e) {
            if (loadSpec.isStale || loadSpec.isAutoRefresh) return;
            gridModel.clear();
            XH.handleException(e, {title: 'Error loading TODOs'});
        }
    }

    //------------------
    // Implementation
    //------------------
    private createGridModel() {
        return new GridModel({
            autosizeOptions: {mode: 'managed'},
            columns: [
                {field: {name: 'userId', type: 'number'}},
                {field: {name: 'title', type: 'string'}, flex: 1},
                {
                    field: {name: 'completed', displayName: 'Completed?', type: 'bool'},
                    align: 'center',
                    renderer: v => (v ? Icon.checkSquare({intent: 'success'}) : Icon.square())
                }
            ],
            onCellClicked: ({data: record, colDef}) => {
                if (colDef.field === 'completed' && record) {
                    this.gridModel.store.modifyRecords({
                        id: record.id,
                        completed: !record.data.completed
                    });
                }
            }
        });
    }
}
