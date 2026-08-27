# Hoist Application Template

This repository is intended as a minimal starting point for a new Hoist application. It includes
the boilerplate structure for the Grails + Typescript applications, with recent versions of Hoist
Core (https://github.com/xh/hoist-core) and Hoist React (https://github.com/xh/hoist-react). See
these project READMEs for additional info and checkout their CHANGELOGs for the latest releases.

## Important Caveats

This template is designed to be run immediately "out of the box" after cloning, and so includes a
few default configurations that would *not* be suitable for running in production, specifically:

* An in-memory database (H2) is specified. This will allow the app to start, but no changes will be
  persisted. You will quickly wish to connect to a real database, even for local exploration.
    * You will need to add an appropriate JDBC driver (and should remove the H2 dependency) to
      `build.gradle` and update your `.env` with required connection details.
    * The template `DBConfig.groovy` includes some MyQSL-based configuration - contact XH for help
      modifying this appropriately for use with another database.

* Code to perform OAuth authentication is included with an Auth0 (https://auth0.com/) client, but
  the default configuration deactivates that and creates a bootstrapped local admin user with a
  password. You will quickly want to connect to the OAuth provider (or other authentication scheme)
  of your choice and remove both the bootstrap routine and support for user passwords.

* AG Grid (https://www.ag-grid.com/) ships with both its Community and Enterprise modules
  registered in `Bootstrap.ts`. Enterprise is **not optional for a standard Hoist app** - the
  Admin Console's Cluster Objects, Activity Tracking, and Roles tabs are tree grids, and tree data
  is an Enterprise-only module.

  Enterprise requires a paid license. Until you add one, grids remain fully functional but render
  an evaluation watermark and log a console error. Add your key via the bootstrapped `jsLicenses`
  app config under `agGrid` (Admin Console > Configs), or hard-code it in `Bootstrap.ts` if you
  are working in a private repo.

## Development Environment Setup

The only local prerequisites for running this template are:

* **Java JDK 21** - with `java` on your system PATH or `JAVA_HOME` set to the JDK install location.
    * Many IDEs offer a built-in way to manage JDKs and run projects under a particular JDK. If you
      are using IntelliJ, you can set the JDK in the project settings (File > Project Structure)
      and then run the app from the IDE. In that case, we recommend the JetBrains (JBR) distro.
    * Windows users can also install an [OpenJDK distro from Microsoft](https://www.ag-grid.com/),
      as just one option, or download and unpack a zipped JDK without an install routine and add it
      to your `PATH` or set `JAVA_HOME` (no admin rights required).
    * Mac users can use [Homebrew](https://brew.sh/) to install with `brew install openjdk@21`, or
      use SDKMan (https://sdkman.io/) for a more general-purpose JDK manager.
    * Validate by running `java -version` in a terminal.
* **Node 22.15 or newer + pnpm**
    * Install Node from [nodejs.org](https://nodejs.org/en/download/) or via a package manager.
      `client-app/.nvmrc` tracks `lts/*`, so `nvm use` picks a suitable version.
    * pnpm is the package manager, pinned via the `packageManager` field in
      `client-app/package.json`. Enable Corepack once with `corepack enable pnpm` and it will
      install the pinned version on first use.
    * Validate by running `node -v` and `pnpm -v` in a terminal.
* **A Font Awesome Pro token** - hoist-react depends on the `@fortawesome/*` Pro packages.
  `client-app/.npmrc` points at the Pro registry but deliberately carries no credential. Add
  `//npm.fontawesome.com/:_authToken=<your-token>` to your `~/.npmrc` before installing.

## Running the Template

Once you have installed the above and cloned the repo, `cd` into the project directory and run:

```
cp .env.template .env
```

This will copy the default/template environment variable file into a working .env file, where the
values within will be read by the Gradle build and made available to the app as environment
variables. (The variables used follow a naming convention that exposes them as "instance configs",
readable via `getInstanceConfig('someKey')`.)

To start the Grails server, run:

```
./gradlew bootRun
```

This will download a portable version of Gradle, the server-side build tool, download all required
server-side dependencies, and start the server. Look for a line like:

```
Grails application running at http://localhost:8080 in environment: development
```

to confirm that the server has started, then leave running in that terminal and start another shell.
From there, run:

```
cd client-app
pnpm install
pnpm start
```

to install the client-side dependencies and start the client application via WebPack dev server.
Your browser should open automatically to `http://localhost:3000/app` and display a login screen.

As mentioned above, a default local user with password is created by the Bootstrap routine, so you
can login as `admin@xh.io / admin` and explore the (very minimal) app. Visit
`http://localhost:3000/admin` to check out the built-in Admin Console.

It is typical for developers to run the above via their IDE - e.g. as IntelliJ "Run Configurations"
or the equivalent in any IDE of your choice.

## Next Steps

* Review the important caveats above, as they cover several immediate items you will want to review
  and adjust around the database, auth, and licensed dependencies.
* Every Hoist app is given an `appCode` - this repo uses the default value of `hoistApp` which you
  should change. Likewise with `appName`. Look for these codes in:
    * `gradle.properties`
    * `client-app/package.json`
    * `client-app/webpack.config.js`
* After changing your `appCode`, you will need to update your `.env` and `.env.template` to replace
  `APP_HOISTAPP_XXX` with `APP_YOURCODE_XXX`. (See `InstanceConfigUtils` in Hoist Core for details.)
* The server-side classes within `grails-app` and `src` have a default package of `io.xh.app`, which
  you should also change.

After that is complete, all that remains is for you to write the rest of the application. Easy! ✨

------------------------------------------
info@xh.io | https://xh.io
