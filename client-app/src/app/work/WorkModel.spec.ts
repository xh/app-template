import {initTestAppAsync, server} from '@xh/hoist/test-support';
import {http, HttpResponse} from 'msw';
import {beforeAll, describe, expect, it, onTestFinished} from 'vitest';
import {WorkModel} from './WorkModel';

const TODOS_URL = 'https://jsonplaceholder.typicode.com/todos';

describe('WorkModel', () => {
    // Boot a Hoist test app against the fake hoist-core, once for this file.
    beforeAll(() => initTestAppAsync());

    it('loads TODOs into its grid and counts the completed ones', async () => {
        // Serve the external TODO list for this test only.
        server.use(
            http.get(TODOS_URL, () =>
                HttpResponse.json([
                    {id: 1, userId: 1, title: 'Write specs', completed: true},
                    {id: 2, userId: 1, title: 'Run specs', completed: false},
                    {id: 3, userId: 2, title: 'Ship it', completed: true}
                ])
            )
        );
        const model = createModel();

        await model.loadAsync();

        expect(model.gridModel.store.count).toBe(3);
        expect(model.completedCount).toBe(2);
    });

    it('clears its grid when the load fails', async () => {
        server.use(http.get(TODOS_URL, () => new HttpResponse(null, {status: 500})));
        const model = createModel();
        model.gridModel.loadData([{id: 1, userId: 1, title: 'Stale', completed: true}]);

        await model.loadAsync();

        expect(model.gridModel.store.count).toBe(0);
        expect(model.completedCount).toBe(0);
    });
});

function createModel(): WorkModel {
    const model = new WorkModel();
    onTestFinished(() => model.destroy());
    return model;
}
