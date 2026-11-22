/**
 * Rsbuild (Rspack + SWC) build configuration, driven by `configureRsbuild()` from hoist-dev-utils.
 * Run via `pnpm start` / `pnpm build` (see package.json scripts).
 *
 * The Rsbuild CLI has no `--env key=value` flag. Build-time overrides arrive as `XH_*` environment
 * variables through `readCliEnv()`, for example `XH_APP_VERSION=1.2.3 pnpm build`. Put per-developer
 * defaults such as `XH_DEV_HOST` in a gitignored `.env.local`, which Rsbuild loads on every run.
 */
import configureRsbuild, {readCliEnv} from '@xh/hoist-dev-utils/configureRsbuild';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url),
    pkg = require('./package.json');

export default ({envMode}) => {
    return configureRsbuild({
        appCode: 'hoistapp',
        appName: 'Hoist App',
        appVersion: pkg.version,
        favicon: './public/favicon.svg',
        devServerOpenPage: 'app/',
        // `pnpm build` runs `rsbuild build --env-mode prod`, `pnpm startWithHoist` runs
        // `rsbuild dev --env-mode inlineHoist`.
        prodBuild: envMode === 'prod',
        inlineHoist: envMode === 'inlineHoist',
        ...readCliEnv()
    });
};
