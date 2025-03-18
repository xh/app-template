import {AppModel as HoistAdminAppModel} from '@xh/hoist/admin/AppModel';

export class AppModel extends HoistAdminAppModel {
    static override instance: AppModel;

    override async initAsync() {
        await super.initAsync();
    }
}
