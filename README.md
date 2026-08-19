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

## Licence

MIT
