import {AppModel as HoistAdminAppModel} from '@xh/hoist/admin/AppModel';
import {XH} from '@xh/hoist/core';
import {AuthService} from '../core/svc/AuthService';

export class AppModel extends HoistAdminAppModel {
    static override instance: AppModel;

    static override async preAuthAsync() {
        await XH.installServicesAsync(AuthService);
    }

    override async logoutAsync() {
        await XH.authService.logoutAsync();
    }
}
