# CLAUDE.md

This file provides guidance to AI coding agents working in this repository.

## Project Overview

This repo is the **Hoist Application Template** -- a minimal, run-it-out-of-the-box scaffold for
starting a new Hoist application. It pairs a Grails 7 / Groovy / Spring Boot backend (built on the
`hoist-core` framework) with a TypeScript / React / MobX frontend (built on the `@xh/hoist`
framework).

The template intentionally ships a tiny surface: one example tab, one example controller, an
Auth0 OAuth scaffold (deactivated by default in favor of a bootstrapped local-admin login), and
the boilerplate config required by Hoist. See **README.md** for the "Important Caveats" (H2
in-memory DB, password auth, unlicensed AG Grid Enterprise) and the "Next Steps" checklist
(renaming `appCode`, repackaging from `io.xh.app`, swapping in a real database) that every fresh
clone should run through.

Two framework plugins are central to work in this repo:

- **`@xh/hoist`** (hoist-react) -- the client-side React/MobX framework
- **`hoist-core`** -- the server-side Grails/Spring Boot framework

Understanding these frameworks is essential to writing correct, idiomatic code.

## Hoist Framework Documentation -- READ THIS FIRST

This project depends on two framework plugins. Always consult the framework reference tools
before authoring code that imports from `@xh/hoist` or `io.xh.hoist` -- prop names, decorators,
and conventions evolve, and stale guesses produce real bugs.

- **`@xh/hoist` (hoist-react)** -- when authoring under `client-app/`, the
  `xh:using-hoist-react-reference` skill is your routing table for the docs and symbol-search
  tools (MCP + CLI). Read the Architecture Primer below for the foundational mental model; the
  skill covers everything beyond.
- **`hoist-core`** -- when authoring Groovy/Java under `grails-app/` or `src/`, the
  `xh:using-hoist-core-reference` skill is your routing table. It also owns the install /
  upgrade procedure for the project-local CLI launchers and MCP server.

### hoist-react Architecture Primer

Hoist applications are built around three artifact types:

| Artifact | Base Class | Purpose | Lifecycle |
|----------|------------|---------|-----------|
| **Component** | `hoistCmp.factory` | UI rendering (React) | Transient -- mount/unmount with views |
| **Model** | `HoistModel` | Observable state + business logic | Varies -- linked to component or standalone |
| **Service** | `HoistService` | App-wide data access + shared state | Singleton -- lives for app lifetime |

**Element factories over JSX.** Hoist uses element factory functions, not JSX:
```typescript
// Hoist style
panel({title: 'Users', items: [grid(), button({text: 'Refresh'})]})

// Not used in Hoist
<Panel title="Users"><Grid /><Button text="Refresh" /></Panel>
```

**Components** are created with `hoistCmp.factory`. Each component declares its model relationship:
```typescript
export const userList = hoistCmp.factory({
    model: creates(UserListModel),  // Component creates and owns this model
    render({model}) {
        return panel({title: 'Users', item: grid()});
    }
});
```

**Model wiring -- `creates()` vs `uses()`:**
- `creates(ModelClass)` -- component instantiates, owns, and destroys the model on unmount.
- `uses(ModelClass)` -- component receives model from a parent via context or explicit prop.

**Context-based model lookup** eliminates prop drilling. When a component `creates()` a model, that
model is published to React context. Child components using `uses(ModelClass)` automatically find
the nearest matching model in the ancestor tree. All public properties of ancestor models are
searched -- so if `PanelModel` has a `gridModel: GridModel` property, a child `grid()` call
resolves it automatically. (Note: `@managed` is unrelated to lookup -- it controls cleanup on
destroy. A property does not need `@managed` to be found via context lookup.)

When multiple models of the same type exist in context (e.g. two `GridModel` instances), pass the
model explicitly: `grid({model: model.leftGridModel})`.

**HoistModel** -- the core state holder:
```typescript
class UserListModel extends HoistModel {
    @observable.ref users: User[] = [];
    @bindable selectedUserId: string = null;
    @managed detailModel = new UserDetailModel();

    constructor() {
        super();
        makeObservable(this);  // Required when class adds new observables
    }

    override async doLoadAsync(loadSpec: LoadSpec) {
        const users = await XH.fetchJson({url: 'api/users', loadSpec});
        runInAction(() => this.users = users);
    }
}
```

**Key decorators:**

| Decorator | Purpose |
|-----------|---------|
| `@observable` / `@observable.ref` | MobX observable state |
| `@bindable` | Observable + auto-generated action-wrapped setter |
| `@managed` | Mark child object for automatic cleanup on `destroy()` |
| `@persist` | Sync property with a persistence provider (requires `persistWith`) |
| `@lookup(ModelClass)` | Inject ancestor model (linked models only, available after `onLinked`) |
| `@computed` | Cached derived value |
| `@action` | Mark method as state-modifying |

**`makeObservable(this)`** must be called in the constructor of any class that introduces new
`@observable`, `@bindable`, or `@computed` properties. The base class call does not cover subclass
decorators. Forgetting this is the most common Hoist bug.

**`doLoadAsync(loadSpec)`** -- implement this template method to opt into managed data loading.
Call `model.loadAsync()` or `model.refreshAsync()` to trigger -- never call `doLoadAsync` directly.
Linked models with `doLoadAsync` are loaded automatically on mount.

**HoistService** -- singleton services installed during app init and accessed via `XH`:
```typescript
XH.myAppService.doSomethingAsync(args);   // Custom service
XH.fetchJson({url: 'api/data'});          // FetchService alias
XH.getConf('featureFlag', false);         // ConfigService alias
XH.getPref('pageSize', 50);              // PrefService alias
```

**XH singleton** -- the top-level API entry point. Provides service access, data fetching
(`fetchJson`, `postJson`), user interaction (`toast`, `confirm`, `prompt`, `handleException`),
navigation (`navigate`, `appendRoute`), and app state (`appState`, `darkTheme`).

**Critical pitfalls:**
1. **Forgetting `makeObservable(this)`** -- observables silently won't react.
2. **Managing objects you don't own** -- only `@managed` objects your class creates. Objects passed
   in from outside are owned by the provider.
3. **Mutating observables outside actions** -- use `runInAction()`, `@action`, or `@bindable`.
4. **Calling `lookupModel()` too early** -- only works during or after `onLinked()`.
5. **Calling `doLoadAsync()` directly** -- use `loadAsync()` / `refreshAsync()` entry points.

#### Quick Reference -- MCP Doc IDs by Task

Use `hoist-search-docs` (or `npx hoist-docs read <id>`) with the doc ID for full documentation
on any topic.

| If you need to... | Doc ID |
|---|---|
| Understand the component/model/service pattern | `core` |
| Work with Stores, Records, Fields, or Filters | `data` |
| Fetch data, read configuration, or manage preferences | `svc` |
| Build or configure a data grid | `cmp/grid` |
| Build a form with validation | `cmp/form` |
| Understand input change/commit lifecycle | `cmp/input` |
| Use layout containers (Box, HBox, VBox) | `cmp/layout` |
| Create a tabbed interface | `cmp/tab` |
| Save and restore named view configurations | `cmp/viewmanager` |
| Configure a desktop panel (toolbars, masks, collapse) | `desktop/cmp/panel` |
| Build a mobile app | `mobile` |
| Format numbers, dates, or currencies | `format` |
| Understand app lifecycle and startup sequence | `lifecycle-app` |
| Understand model/service lifecycles and loading | `lifecycle-models-and-services` |
| Add authentication (OAuth, login) | `authentication` |
| Persist UI state (columns, filters, panel sizes) | `persistence` |
| Check roles, gates, or app access | `authorization` |
| Configure client-side routing | `routing` |
| Handle exceptions and display errors | `error-handling` |
| Use Promises with error handling and tracking | `promise` |
| Work with MobX observables and `@bindable` | `mobx` |
| Configure OAuth with Auth0 or Microsoft Entra | `security` |

### hoist-core

The hoist-core repository has comprehensive documentation covering server-side architecture,
services, and conventions across 20+ feature docs and upgrade notes -- all surfaced via the
reference tools described in the `xh:using-hoist-core-reference` skill. For topics not yet
covered by docs, refer to the existing source code in `grails-app/`, or browse the public docs
at https://github.com/xh/hoist-core/tree/develop/docs.

## MCP Servers

This project configures MCP (Model Context Protocol) servers in `.mcp.json` that expose Hoist
framework documentation and symbol search to AI coding agents. Both servers are enabled by
default in `.claude/settings.json` under `enabledMcpjsonServers`.

### hoist-react (enabled by default)

A local Node.js process that exposes hoist-react framework documentation and symbol search. It
runs directly from `client-app/node_modules/@xh/hoist/bin/hoist-mcp.mjs` -- no additional setup
required beyond `pnpm install`. See the `xh:using-hoist-react-reference` skill for the routing
table of MCP and CLI surfaces.

### hoist-core (enabled by default, requires one-time install)

A Groovy-based MCP server exposing hoist-core docs and AST-based symbol inspection. Runs via a
project-local launcher (`./bin/hoist-core-mcp`) generated by `./gradlew installHoistCoreTools`.
**Re-run that task after cloning the repo or bumping `hoistCoreVersion`** -- the launcher embeds
an absolute path to a version-locked JAR and goes stale on upgrade. The same task also writes
`./bin/hoist-core-docs` and `./bin/hoist-core-symbols` CLI launchers. See
`xh:using-hoist-core-reference` for the full install/upgrade procedure.

## Plugins

The `.claude/settings.json` enables three plugins by default:

### `xh@hoist-ai` (Hoist AI plugin -- enabled by default)

Provides the `using-hoist-react-reference`, `using-hoist-core-reference`, `hoist-upgrade`, and
`onboard-app` skills referenced throughout this file. Sourced from `github:xh/hoist-ai` via
`extraKnownMarketplaces` in `.claude/settings.json` -- Claude Code will fetch it automatically
on first use.

### TypeScript LSP (enabled by default)

`typescript-lsp` provides code intelligence (go-to-definition, find references, hover info, etc.)
for TypeScript and JavaScript files via the LSP tool. Requires `typescript-language-server` on
your machine:

```bash
npm install -g typescript-language-server typescript
```

Verify with `typescript-language-server --version`. If the binary is missing, LSP calls fail
silently.

### Java LSP (enabled by default)

`jdtls-lsp` provides code intelligence for `.java` files. Requires `jdtls`:

```bash
brew install jdtls
```

Note: in this mixed Java/Groovy project, jdtls works for Java-specific operations within `.java`
files, but **go-to-definition does not resolve Groovy classes** and **workspace symbol search may
return empty results** for Groovy code. For navigating into Groovy, use Grep/Glob.

## Tech Stack

- **Frontend**: TypeScript, React 19, MobX, AG Grid (Community + Enterprise), Highcharts, `@xh/hoist`
- **Backend**: Grails 7 (Groovy/Spring Boot), `hoist-core`
- **JDK**: 21 (set via `majorJavaVersion` in `gradle.properties`; the Gradle Java toolchain in
  `build.gradle` reads that value, and the Tomcat base image in `docker/tomcat/Dockerfile` carries
  a matching `jdk21` suffix -- keep these in sync if you bump the toolchain).
- **Database**: H2 in-memory by default (see README caveats); MySQL connector is included.
- **Package Manager**: pnpm 11 (frontend, pinned via `packageManager` in `client-app/package.json`),
  Gradle 8.14.5 via wrapper (backend).

### A note on JDK 21 specifically

Gradle 8.14 supports running its daemon JVM on JDK 21 directly, so there is no split-JDK gymnastics
required for this template -- if you have JDK 21 on PATH (or as your active SDKman/asdf/mise
version), `./gradlew` just works. The Gradle Java toolchain still handles compile/`bootRun` JVM
selection via `majorJavaVersion`, so even if you bump the toolchain target to a newer JDK in the
future, only the daemon JVM needs to be a supported LTS that the active Gradle version accepts.

## Common Commands

### Frontend (run from `client-app/`)

```bash
pnpm install              # Install dependencies (also runs husky hook setup)
pnpm start                # Dev server on port 3000
pnpm build                # Production build (output to client-app/build/)
pnpm buildAndAnalyze      # Production build + webpack bundle analyzer
pnpm lint                 # ESLint + Stylelint
pnpm lint:code            # ESLint only
pnpm lint:styles          # Stylelint only
pnpm typecheck            # tsc --noEmit (not covered by lint)
pnpm startWithHoist       # Dev server against a sibling ../hoist-react checkout
```

### Backend (run from project root)

```bash
./gradlew bootRun                 # Start Grails server on port 8080
./gradlew console                 # Grails interactive console
./gradlew installHoistCoreTools   # Install/refresh bin/hoist-core-* launchers
./gradlew build                   # Build WAR for deployment
```

### Local Development

Run both simultaneously:
- Terminal 1: `./gradlew bootRun`
- Terminal 2: `cd client-app && pnpm start`

The webpack dev server runs on **`http://localhost:3000`**. Each file under
`client-app/src/apps/` defines an entry point, and its filename (minus the extension) becomes
the URL path.

**Primary entry points** (out of the box):

| App | URL |
|-----|-----|
| Desktop app | http://localhost:3000/app |
| Admin console | http://localhost:3000/admin |

To add a new entry point, drop e.g. `apps/mobile.ts` next to `apps/app.ts` calling
`XH.renderApp(...)` with the appropriate `containerClass` (`MobileAppContainer` for mobile).

The first time you run, a local admin user is created per the README's "Important Caveats" --
log in with the credentials configured in `.env` (defaults to `admin@xh.io / admin`).

### Pre-commit Hooks

Husky runs automatically on commit via `lint-staged` (Prettier + ESLint/Stylelint on staged files)
and conditionally the TypeScript compiler if TS/JS/package files are staged. Re-run
`pnpm install` from `client-app/` to (re)install the hook scripts after pulling fresh.

## Code Style

- **Prettier**: 100 char width, single quotes, no trailing commas, 4-space indent (JS/TS), 2-space
  indent (SCSS/JSON)
- **No bracket spacing**: `{foo}` not `{ foo }`
- **Arrow parens**: avoid when possible (`x => x` not `(x) => x`)
- **Semicolons**: always

**Commit messages, PRs, and comments**: do not hard-wrap lines at a fixed column width in commit
message bodies, PR descriptions, or issue/PR comments -- let the viewing tool handle display
wrapping. Use line breaks for structure (bullet lists, blank lines between paragraphs, a break
after the subject line). Keep PR descriptions concise -- bullet the key changes and let the diff
speak for itself.

**Comments in code**: default to writing no comments. Only add one when the *why* is non-obvious
-- a hidden constraint, a subtle invariant, a workaround. Don't explain what well-named code
already says, and don't reference "this PR" or "the X bug" inside comments (those belong in the
PR description and rot quickly).

## Architecture

### Frontend (`client-app/src/`)

- **`apps/`** -- Entry points for each compiled bundle. Each file calls `XH.renderApp({...})`
  with the appropriate `modelClass`, `componentClass`, `authModelClass`, and `containerClass`.
- **`app/`** -- The default desktop app: `AppModel.ts` (state, routing, tab definitions) and
  `AppComponent.ts` (UI shell with `appBar` + `tabContainer`). Tabs live in `app/<tab>/`.
- **`core/`** -- Shared cross-app code, including `core/security/AuthModel.ts` for the OAuth /
  bootstrap-admin login flow.
- **`Bootstrap.ts`** -- AG Grid module registration, Highcharts feature registration, TypeScript
  module augmentation to add app services/properties to `XHApi` and `HoistUser`.

**Key pattern**: Apps follow Model + Component pairing. Models hold state (MobX observables),
Components render UI. Services are singleton classes for data fetching and business logic. See
the hoist-react docs (referenced above) for detailed coverage.

### Backend (`grails-app/`)

- **`controllers/`** -- REST controllers extending `BaseController` from hoist-core.
- **`services/`** -- Business logic extending `BaseService`. Two example services live under
  `services/io/xh/app/security/` (AuthenticationService, UserService, RoleService, etc.) to
  scaffold OAuth + role wiring.
- **`domain/`** -- GORM domain classes. The template ships only `User`.
- **`init/`** -- `Application.groovy` (Spring Boot entry point), `BootStrap.groovy` (initial
  config + bootstrap-admin user creation), `ClusterConfig.groovy` (Hazelcast), `LogbackConfig.groovy`
  (logging extension point -- empty by default).
- **`conf/`** -- `application.groovy` (build-time config) and `runtime.groovy` (runtime config,
  including mail settings + DBConfig wiring).

### Configuration

Environment variables are loaded from `.env` (copy `.env.template` to `.env`). Variables are
exposed to the app as **instance configs** -- readable via
`io.xh.hoist.util.InstanceConfigUtils.getInstanceConfig('someKey')`. Variable naming follows
`APP_HOISTAPP_*` (where `HOISTAPP` is the uppercased `appCode`); update this prefix when you
rename `appCode` per the README's Next Steps.

## Customizing the Template

The README has the authoritative "Next Steps" checklist. Highlights:

- Pick a real `appCode` and `appName` -- update `gradle.properties`, `client-app/package.json`,
  `client-app/webpack.config.js`, and rename the `APP_HOISTAPP_*` env vars in `.env` /
  `.env.template`.
- Repackage from `io.xh.app` to your real Java package -- all of `grails-app/`, `src/main/groovy/`,
  and `Application.groovy`/`BootStrap.groovy`/`ClusterConfig.groovy`/`LogbackConfig.groovy`
  reference this.
- Swap H2 for a real database -- update `runtime.groovy` / `DBConfig.groovy` and `.env`.
- Replace bootstrap-admin auth with your real auth provider -- the Auth0 scaffold in
  `AuthModel.ts` (client) and `AuthenticationService.groovy` (server) is wired but inactive by
  default.
- AG Grid Enterprise is already a dependency and registered in `Bootstrap.ts` -- the Admin
  Console's tree grids need it. Add your license key to the `jsLicenses` config under `agGrid` to
  clear the evaluation watermark.

## Related Repositories

XH / Hoist framework developers can optionally check out the framework libraries as sibling
directories for inline development of the libraries themselves. This is **not required** for
app development.

- **`../hoist-core`** -- Groovy/Java backend framework. Enable with `runHoistInline=true` in
  `gradle.properties`.
- **`../hoist-react`** -- React frontend library. Enable with `pnpm startWithHoist` from
  `client-app/`. Note that hoist-react itself is managed with pnpm, so an inline checkout needs
  its own `pnpm install` regardless of what the app uses.
