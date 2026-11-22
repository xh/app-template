/**
 * Vitest unit test configuration, driven by `configureVitest()` from hoist-dev-utils.
 * Run via `pnpm test` / `pnpm test:watch` (see package.json scripts).
 *
 * The preset compiles specs with the same SWC settings as `rsbuild.config.mjs`. It also loads
 * hoist-react's test kit (`@xh/hoist/test-support`), which runs Hoist's real client services
 * against a fake hoist-core. Specs live beside their source as `*.spec.ts`. See "Unit Tests in an
 * App" in hoist-react's `docs/unit-testing.md`.
 */
import configureVitest from '@xh/hoist-dev-utils/configureVitest';
import {createRequire} from 'node:module';
import {defineConfig, mergeConfig} from 'vitest/config';

const require = createRequire(import.meta.url),
    pkg = require('./package.json');

export default defineConfig(
    mergeConfig(
        configureVitest({
            appCode: 'hoistapp',
            appName: 'Hoist App',
            appVersion: pkg.version
        }),
        // In CI, also report failures as GitHub annotations on the PR.
        {test: {reporters: process.env.CI ? ['default', 'github-actions'] : ['default']}}
    )
);
