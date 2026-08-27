# deepreefmap-ui

**The web console for the DeepReefMap metadata registry.**

Administrators define the sites, campaigns and transects that field laptops download,
enrol those laptops, and browse the survey metadata they upload.

## Quick Start

The console needs the registry and a Keycloak realm. The compose stack in this repository
brings up all three:

```bash
docker compose up -d
```

The console is then at `http://localhost:88`, and everything binds to loopback only.

For a local dev server against a registry that is already running:

```bash
yarn install
yarn dev
```

## Viewing a run

The run page shows the reconstruction in five tabs. Cover draws the ortho in the class
colours the registry publishes (`/api/config/classes`), reading the label grid from the
run's archived `ortho.npz`, with the photograph behind a switch and a magnifier under
the pointer. 3D cloud reads the archived `cloud_web.drmw` and draws it with three.js:
classes by default, click a point to name its class and isolate it, double click to
move the pivot, and a camera path where the file carries one. Outputs lists the run's
files by group from `/api/runs/{id}/outputs`, reading a group's own files only when it
is opened, and downloads any group, or the whole run, as one zip streamed by the
registry.

## Types from the contract

Every entity type is generated from the registry's published `OpenAPI` document, so a
field the server renamed becomes a compile error here:

```bash
yarn contract-types
```

It reads `../deepreefmap-api/contract/openapi.json`, or `$DRM_API_DIR/contract` when the
registry lives elsewhere.

## Checks

```bash
yarn type-check
yarn build
```

## End-to-end tests

Playwright drives the console at `http://localhost:88`, signed in as the dev realm's `admin`:

```bash
yarn install
npx playwright install chromium
yarn e2e
```

The catalogue flow creates a site and a transect named with a timestamp on each run.

## Licence

MIT
