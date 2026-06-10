---
name: Tsconfig base path
description: Correct extends path for tsconfig.json depending on depth in the monorepo.
---

In this monorepo, `tsconfig.base.json` lives at the workspace root (`/home/runner/workspace/`).

- Packages at depth 1 (`frontend/`, `backend/`): `"extends": "../tsconfig.base.json"`
- Packages at depth 2 (`artifacts/foo/`, old location): `"extends": "../../tsconfig.base.json"`

The same depth rule applies to `references` paths.

**Why:** When the project renamed packages from `artifacts/atfal-ghana` → `frontend` and `artifacts/api-server` → `backend`, the tsconfig `extends` paths needed updating from `../../` to `../`. Getting this wrong causes esbuild/tsc to silently skip the base config (emitting a WARNING but continuing), which can cause unexpected behaviour.

**How to apply:** Any time a new workspace package is created or an existing one is moved, verify the `extends` depth in its tsconfig.json matches its actual position in the tree.
