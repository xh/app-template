# CLAUDE.md

This file provides guidance to AI coding agents working in this repository.

## Project Overview

This repo is the **Hoist Application Template**, a minimal scaffold that runs out of the box and
starts a new Hoist application. It pairs a Grails 8 / Groovy / Spring Boot backend, built on the
`hoist-core` framework, with a TypeScript / React / MobX frontend, built on the `@xh/hoist`
framework.

The template ships a deliberately small surface: one example tab, one example controller, an Auth0
OAuth scaffold, and the boilerplate config that Hoist requires. The Auth0 scaffold is off by
default in favor of a bootstrapped local-admin login. See **README.md** for the "Important Caveats"
(H2 in-memory DB, password auth, unlicensed AG Grid Enterprise) and the "Next Steps" checklist
(renaming `appCode`, repackaging from `io.xh.app`, swapping in a real database). Run through that
checklist for every fresh clone.

Two framework plugins are central to work in this repo:

- **`@xh/hoist`** (hoist-react) - the client-side React/MobX framework
- **`hoist-core`** - the server-side Grails/Spring Boot framework

## Hoist Framework Documentation - READ THIS FIRST

Always consult the Hoist reference tools before you write code that imports from `@xh/hoist` or
`io.xh.hoist`. Prop names, decorators, and conventions change between versions, and stale guesses
produce real bugs.

- **`@xh/hoist` (hoist-react)** - when you write code under `client-app/`, the
  `xh:using-hoist-react-reference` skill routes you to the docs and symbol-search tools. Read the
  Architecture Primer below for the core mental model. The skill covers everything beyond it.
- **`hoist-core`** - when you write Groovy or Java under `grails-app/` or `src/`, the
  `xh:using-hoist-core-reference` skill routes you to the same tools for the server.

### Hoist Docs (MCP)

The reference tools come from Hoist Docs: one MCP server, `hoist-docs` in `.mcp.json`, run from
the `@xh/hoist-docs` dev dependency of `client-app`. It answers for the Hoist versions this app has
installed: hoist-react from `client-app/node_modules`, and hoist-core for the `hoistCoreVersion` in
`gradle.properties`, fetched once from Maven Central. Its tools are `mcp__hoist-docs__*`. Pass
`library: "react"` for client code and `library: "core"` for server code, because some names, such
as `Timer`, exist in both.

The server needs `pnpm install` in `client-app/` first. After a Hoist upgrade, restart Claude Code
so the server reads the new versions. If MCP is blocked or the server is not running, read the docs
that ship with hoist-react under `client-app/node_modules/@xh/hoist/docs/`. The hoist-core docs are
also on GitHub at https://github.com/xh/hoist-core/tree/develop/docs.

### hoist-react Architecture Primer

A Hoist application has three artifact types:

| Artifact | Base Class | Purpose | Lifecycle |
|----------|------------|---------|-----------|
| **Component** | `hoistCmp.factory` | UI rendering (React) | Transient - mounts and unmounts with views |
| **Model** | `HoistModel` | Observable state + business logic | Varies - linked to a component, or standalone |
| **Service** | `HoistService` | App-wide data access + shared state | Singleton - lives for the app lifetime |

**Element factories over JSX.** Hoist uses element factory functions, not JSX:
```typescript
// Hoist style
panel({title: 'Users', children: [grid(), button({text: 'Refresh'})]})

// Not used in Hoist
<Panel title="Users"><Grid /><Button text="Refresh" /></Panel>
```

Pass child elements with the standard React `children` key. A container component destructures
`children` from its props and passes it on as `children`. `item` and `items` are legacy aliases
for `children`. Do not use them in new code.

**Components.** Create a component with `hoistCmp.factory`. Each component declares its model
relationship:
```typescript
export const userList = hoistCmp.factory({
    model: creates(UserListModel),  // Component creates and owns this model
    render({model}) {
        return panel({title: 'Users', children: grid()});
    }
});
```

**Model wiring: `creates()` vs `uses()`**
- `creates(ModelClass)`: the component instantiates, owns, and destroys the model on unmount.
- `uses(ModelClass)`: the component receives the model from a parent, via context or an explicit
  prop.

**Context-based model lookup** removes prop drilling. When a component `creates()` a model, Hoist
publishes that model to React context. A child component that calls `uses(ModelClass)` finds the
nearest matching model in the ancestor tree. The lookup searches all public properties of ancestor
models. If `PanelModel` has a `gridModel: GridModel` property, a child `grid()` call resolves it.

`@managed` does not affect lookup. It controls cleanup on destroy, and lookup finds a property with
or without it.

When context holds more than one model of the same type, for example two `GridModel` instances,
pass the model explicitly: `grid({model: model.leftGridModel})`.

**`doLoadAsync(loadSpec)`.** Implement this template method to opt into managed data loading.
Trigger a load with `model.loadAsync()` or `model.refreshAsync()`. Never call `doLoadAsync`
directly. A linked model that implements `doLoadAsync` loads on mount.

**HoistService.** Singleton services, installed during app init and accessed through `XH`:
```typescript
XH.fetchJson({url: 'api/data'});            // FetchService alias
XH.getConf('featureFlag', false);            // ConfigService alias
XH.getPref('pageSize', 50);                  // PrefService alias
XH.<yourCustomService>.<yourMethodAsync>();  // Your app's services, registered during app init
```

**XH singleton.** The top-level API entry point. It gives access to services, data fetching
(`fetchJson`, `postJson`), user interaction (`toast`, `confirm`, `prompt`, `handleException`),
navigation (`navigate`, `appendRoute`), and app state (`appState`, `darkTheme`).

**Critical pitfalls:**
1. **Managing objects you do not own.** Only `@managed` objects your class creates. The provider
   owns objects passed in from outside.
2. **Mutating observables outside actions.** Use `runInAction()`, `@action`, or `@bindable`.
3. **Calling `lookupModel()` too early.** It only works during or after `onLinked()`.
4. **Calling `doLoadAsync()` directly.** Use the `loadAsync()` or `refreshAsync()` entry points.

#### Models and Decorators

This app uses TC39 decorators. Every `@observable`, `@observableRef`, `@bindable`, and
`@bindableRef` field takes the `accessor` keyword.

**HoistModel** is the core state holder:
```typescript
class UserListModel extends HoistModel {
    @observableRef accessor users: User[] = [];
    @bindable accessor selectedUserId: string = null;
    @bindable @persist accessor showInactive = false;
    @managed detailModel = new UserDetailModel();

    override async doLoadAsync(loadSpec: LoadSpec) {
        const users = await XH.fetchJson({url: 'api/users'}, {loadSpec});
        runInAction(() => this.users = users);
    }
}
```

**Key decorators:**

| Decorator | Purpose | `accessor`? |
|-----------|---------|-------------|
| `@observable` / `@observableRef` | MobX observable state, deep or reference-only | Yes |
| `@bindable` / `@bindableRef` | Observable + auto-generated action-wrapped setter | Yes |
| `@persist` | Sync property with a persistence provider (requires `persistWith`) | Yes, with the MobX decorator |
| `@managed` | Mark child object for automatic cleanup on `destroy()` | No |
| `@lookup(ModelClass)` | Inject ancestor model (linked models only, available after `onLinked`) | No |
| `@computed` | Cached derived value, on a getter | No |
| `@action` | Mark method as state-modifying | No |

**Decorator pitfalls:**
1. **Forgetting `accessor`.** The field compiles but silently stops reacting.
2. **`@persist` before the MobX decorator.** Write `@bindable @persist accessor x`. A reversed
   pair logs a console error and the field stops persisting, with no type error.
3. **Adding MobX setup calls to a constructor.** TC39 decorators register themselves. A
   constructor needs no MobX boilerplate.
4. **Enumerating a model.** `accessor` fields are prototype getters. `Object.keys()`,
   `JSON.stringify()`, and spread do not see them. Read named properties instead.
5. **Passing `loadSpec` inside fetch options.** Pass the load context as the second argument:
   `XH.fetchJson({url}, {loadSpec})`.

### hoist-core

The hoist-core docs cover server-side architecture, services, and conventions. Hoist Docs serves
them with `library: "core"`. For topics the docs do not cover, read the existing source in
`grails-app/`.

## Plugins

`.claude/settings.json` enables three plugins by default.

### `xh@hoist-ai` (Hoist AI plugin)

Provides the `using-hoist-react-reference`, `using-hoist-core-reference`, `hoist-upgrade`,
`onboard-app`, and `clear-writing` skills. Claude Code fetches it from `github:xh/hoist-ai`, through
`extraKnownMarketplaces` in `.claude/settings.json`, on first use.

### TypeScript LSP

`typescript-lsp` provides code intelligence (go-to-definition, find references, hover info) for
TypeScript and JavaScript files through the LSP tool. It needs `typescript-language-server` on your
machine:

```bash
npm install -g typescript-language-server typescript
```

Verify with `typescript-language-server --version`. If the binary is missing, LSP calls fail
silently.

### Java LSP

`jdtls-lsp` provides code intelligence for `.java` files. It needs `jdtls`:

```bash
brew install jdtls
```

In this mixed Java/Groovy project, jdtls works for Java-specific operations within `.java` files.
But **go-to-definition does not resolve Groovy classes**, and **workspace symbol search can return
empty results** for Groovy code. Use Grep and Glob to navigate Groovy.

## Tech Stack

- **Frontend**: TypeScript 7, React 19, MobX, AG Grid (Community + Enterprise), Highcharts,
  `@xh/hoist`. Built with Rsbuild through `@xh/hoist-dev-utils`.
- **Backend**: Grails 8 (Groovy/Spring Boot), `hoist-core`.
- **JDK**: 25. `majorJavaVersion` in `gradle.properties` sets it. The Gradle Java toolchain in
  `build.gradle` reads that value, the Tomcat base image in `docker/tomcat/Dockerfile` carries a
  matching `jdk25` suffix, and CI sets the same version. Keep all three in sync.
- **Database**: H2 in-memory by default (see README caveats). The MySQL connector is included.
- **Package Manager**: pnpm 12 for the frontend, pinned with `packageManager` in
  `client-app/package.json`. Gradle 9.9 through the wrapper for the backend.

The Gradle toolchain picks the JDK for compile and `bootRun`, so the Gradle daemon itself can run
on any JDK that Gradle supports. `build.gradle` keeps the daemon's own JDK properties out of the
`bootRun` JVM.

## Common Commands

### Frontend (run from `client-app/`)

```bash
pnpm install              # Install dependencies (also runs husky hook setup)
pnpm start                # Dev server on port 3000
pnpm build                # Production build (output to client-app/build/)
pnpm lint                 # ESLint + Stylelint
pnpm lint:code            # ESLint only
pnpm lint:styles          # Stylelint only
pnpm typecheck            # tsc --noEmit (not covered by lint)
pnpm test                 # Vitest unit tests
pnpm test:watch           # Vitest in watch mode
pnpm startWithHoist       # Dev server against a sibling ../hoist-react checkout
```

Rsbuild has no `--env key=value` flag. Pass build-time overrides as `XH_*` environment variables,
for example `XH_APP_VERSION=1.2.3 pnpm build`. Put per-developer defaults such as `XH_DEV_HOST` in a
gitignored `client-app/.env.local`.

### Backend (run from project root)

```bash
./gradlew bootRun                 # Start Grails server on port 8080
./gradlew console                 # Grails interactive console
./gradlew build                   # Build and test the WAR for deployment
```

### Local Development

Run both at once:
- Terminal 1: `./gradlew bootRun`
- Terminal 2: `cd client-app && pnpm start`

The dev server runs on **`http://localhost:3000`**. Each file under `client-app/src/apps/` defines
an entry point, and its filename (minus the extension) becomes the URL path. If port 3000 is busy,
Rsbuild serves on the next free port. Stop any old dev server before you start a new one.

**Primary entry points** (out of the box):

| App | URL |
|-----|-----|
| Desktop app | http://localhost:3000/app |
| Admin console | http://localhost:3000/admin |

To add a new entry point, add a file such as `apps/mobile.ts` next to `apps/app.ts`. Call
`XH.renderApp(...)` with the right `containerClass` (`MobileAppContainer` for mobile).

On the first run, the server creates a local admin user per the README's "Important Caveats". Log
in with the credentials configured in `.env` (defaults to `admin@xh.io / admin`).

### Unit Tests

Vitest runs the client specs, configured in `client-app/vitest.config.mts` on `configureVitest()`
from `@xh/hoist-dev-utils`. Specs use hoist-react's test kit (`@xh/hoist/test-support`), which runs
Hoist's real client services against a fake hoist-core. Write each spec beside the code it tests,
as `Foo.spec.ts` for `Foo.ts`. `app/work/WorkModel.spec.ts` is the sample: it serves the model's
external request with MSW and checks the loaded state.

Test the app's own logic: model rules, derived state, data transforms, and the requests its
services send. Do not import `Bootstrap.ts` or the entry points in `src/apps/` from a spec, because
they register libraries and render the app. See "Unit Tests in an App" in hoist-react's
`docs/unit-testing.md` for the full guide.

### Pre-commit Hooks

Husky runs `lint-staged` on commit: Prettier plus ESLint or Stylelint on staged files. It also runs
the TypeScript compiler if TS/JS or package files are staged. Run `pnpm install` from
`client-app/` to (re)install the hook scripts after a fresh clone.

### CI

`.github/workflows/ci.yml` runs on PRs and pushes to `main`. The client job lints, type-checks,
runs the unit tests, and builds. The server job runs `./gradlew build`. The client install needs a
`FONTAWESOME_PACKAGE_TOKEN` secret, because `@xh/hoist` depends on Font Awesome Pro packages from a
private registry.

## Code Style

- **Prettier**: 100 char width, single quotes, no trailing commas, 4-space indent (JS/TS), 2-space
  indent (SCSS/JSON)
- **No bracket spacing**: `{foo}` not `{ foo }`
- **Arrow parens**: avoid when possible (`x => x` not `(x) => x`)
- **Semicolons**: always

**Writing style**: prose that ships with this code follows the `clear-writing` skill from the `xh`
plugin. That covers CHANGELOG entries, PR descriptions, docs, and code comments. Write short active
sentences, one idea each, with no semicolons and no em dashes.

**Commit messages, PRs, and comments**: do not hard-wrap lines at a fixed column width in commit
message bodies, PR descriptions, or issue/PR comments. Let the viewing tool wrap them. Use line
breaks for structure: bullet lists, blank lines between paragraphs, and a break after the subject
line. Keep PR descriptions concise. Bullet the key changes and let the diff speak for itself.

**Comments in code**: default to writing no comments. Add one only when the *why* is not obvious,
such as a hidden constraint, a subtle invariant, or a workaround. Do not explain what well-named
code already says. Do not reference "this PR" or "the X bug" inside comments. Those belong in the
PR description and go stale quickly.

## Architecture

### Frontend (`client-app/src/`)

- **`apps/`** - Entry points for each compiled bundle. Each file calls `XH.renderApp({...})` with
  the right `modelClass`, `componentClass`, `authModelClass`, and `containerClass`.
- **`app/`** - The default desktop app: `AppModel.ts` (state, routing, tab definitions) and
  `AppComponent.ts` (UI shell with `appBar` + `tabContainer`). Tabs live in `app/<tab>/`.
- **`core/`** - Shared cross-app code, including `core/security/AuthModel.ts` for the OAuth /
  bootstrap-admin login flow.
- **`Bootstrap.ts`** - AG Grid module registration, Highcharts feature registration, and
  TypeScript module augmentation that adds app services and properties to `XHApi` and `HoistUser`.

**Key pattern**: apps pair a Model with a Component. Models hold state (MobX observables), and
Components render UI. Services are singleton classes for data fetching and business logic.

### Backend (`grails-app/`)

- **`controllers/`** - REST controllers extending `BaseController` from hoist-core.
- **`services/`** - Business logic extending `BaseService`. The services under
  `services/io/xh/app/security/` (AuthenticationService, UserService, RoleService, and others)
  scaffold OAuth and role wiring.
- **`domain/`** - GORM domain classes. The template ships only `User`.
- **`init/`** - `Application.groovy` (Spring Boot entry point), `BootStrap.groovy` (initial config
  and bootstrap-admin user creation), `ClusterConfig.groovy` (Hazelcast), and `LogbackConfig.groovy`
  (logging extension point, empty by default).
- **`conf/`** - `application.groovy` (build-time config) and `runtime.groovy` (runtime config,
  including mail settings and DBConfig wiring).

### Configuration

The server loads environment variables from `.env` (copy `.env.template` to `.env`). It exposes
them to the app as **instance configs**, readable through
`io.xh.hoist.util.InstanceConfigUtils.getInstanceConfig('someKey')`. Variable names follow
`APP_HOISTAPP_*`, where `HOISTAPP` is the uppercased `appCode`. Update this prefix when you rename
`appCode` per the README's Next Steps.

## Customizing the Template

The README has the authoritative "Next Steps" checklist. Highlights:

- Pick a real `appCode` and `appName`. Update `gradle.properties`, `client-app/package.json`,
  `client-app/rsbuild.config.mjs`, and `client-app/vitest.config.mts`, and rename the
  `APP_HOISTAPP_*` env vars in `.env` / `.env.template`.
- Repackage from `io.xh.app` to your real Java package. All of `grails-app/`, `src/main/groovy/`,
  and `Application.groovy`/`BootStrap.groovy`/`ClusterConfig.groovy`/`LogbackConfig.groovy`
  reference it.
- Swap H2 for a real database. Update `runtime.groovy` / `DBConfig.groovy` and `.env`.
- Replace bootstrap-admin auth with your real auth provider. The Auth0 scaffold in `AuthModel.ts`
  (client) and `AuthenticationService.groovy` (server) is wired but off by default.
- AG Grid Enterprise is already a dependency, registered in `Bootstrap.ts`, because the Admin
  Console's tree grids need it. Add your license key to the `jsLicenses` config under `agGrid` to
  clear the evaluation watermark.

## Related Repositories

XH and Hoist framework developers can check out the framework libraries as sibling directories, to
develop them inline. App development does **not** need this.

- **`../hoist-core`** - Groovy/Java backend framework. Enable with `runHoistInline=true` in
  `gradle.properties`.
- **`../hoist-react`** - React frontend library. Enable with `pnpm startWithHoist` from
  `client-app/`. hoist-react uses pnpm itself, so an inline checkout needs its own `pnpm install`.
