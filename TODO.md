# Security and compliance — slcfrontend-slc

> **Before editing:** Review [`documentation-standard.md`](../docs/docs/documentation-standard.md).
>
> **Branch rule:** This file must stay **byte-identical** on `main` and `development`. Edit once, then land the same `TODO.md` on both branches.

**Created:** 2026-10-27  
**Last reviewed:** 2026-10-27 — host audit vs discernible-io/docs (`bad60c82`)

Spectator SPA for Last Cradle (GHCR/Podman + nginx). Applies as **Browser SPA** per [`documentation-standard.md`](../docs/docs/documentation-standard.md) applicability matrix.

## Standards referenced

| Standard | Relevance |
| --- | --- |
| [`documentation-standard.md`](../docs/docs/documentation-standard.md) | Root `TODO.md`, README index, docs pin |
| [`vocabulary-standard.md`](../docs/docs/vocabulary-standard.md) | **development** / **main** tiers |
| [`configuration-standard.md`](../docs/docs/configuration-standard.md) | Frontend public config binding |
| [`frontend-branch-env-migration.md`](../docs/docs/frontend-branch-env-migration.md) | `.env.development` / `.env.main` |
| [`logging-standard.md`](../docs/docs/logging-standard.md) | Frontend binding / level gating |
| [`funnel-standard.md`](../docs/docs/funnel-standard.md) | Cookieless `land` on lastcradle.io |
| [`cicd-deployment-standard.md`](../docs/docs/cicd-deployment-standard.md) | GHCR, Gitleaks, audit, image scan |
| [`coding-standard.md`](../docs/docs/coding-standard.md) | Observable outcome tests |

## Compliance snapshot

| Area | Status | Notes |
| --- | --- | --- |
| Branch env (`.env.development` / `.env.main`) | Aligned | `env:sync`, `validate:env`, `nginx.Dockerfile` |
| Root `TODO.md` + README index | Gap | This file; link from README |
| Docs consumption pin | Gap | README links docs `main` without commit SHA |
| `docs/frontend-configuration.md` | Gap | No service addendum for `REACT_APP_*` |
| Funnel cookieless land | Aligned | `src/utils/utm.js`; `test:funnel-attribution` local |
| Logging / `REACT_APP_LOG_LEVEL` | Gap | Env key read but unused; residual `console.info` |
| CI: audit + tests on deploy path | Gap | Build mostly inside Docker only |
| CI: Trivy / SBOM / provenance | Gap | Not in `deploy.yml` |
| CI: `pull_request` job | Gap | Push/deploy only |
| CI: GitHub Environments | Gap | No `environment:` on jobs |
| CI: Actions SHA pins | Gap | Uses `@v4` tags |
| localStorage UX keys | Partial | Follow cradles / watch guide — not funnel ids (document) |

## Ordered improvements

1. Index this `TODO.md` from [`README.md`](README.md); keep blob identical on `main` and `development`.
2. README: state discernible-io/docs **commit SHA** (or explicit “follow docs `main`”) for audits.
3. Add [`docs/frontend-configuration.md`](docs/frontend-configuration.md) (`REACT_APP_*` table, validation, branch mapping) and index it.
4. CI `build-images`: run `validate:env`, `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run test:funnel-attribution`, and a production build **before** image push (not only inside Dockerfile).
5. CI: Trivy on pushed nginx image (fail on fixable CRITICAL/HIGH).
6. CI: `sbom: true` + `provenance: mode=max` on `docker/build-push-action`.
7. CI: `pull_request` job with the same gates (no SSH/GHCR push).
8. CI: `environment: main|development` + concurrency group on deploy jobs.
9. Pin third-party Actions to full commit SHAs.
10. Wire `REACT_APP_LOG_LEVEL`; gate debug; redact tokens/URLs in any remaining console output.
11. Expand outcome tests (utm normalization, env reader, critical route smoke).
12. Document non-funnel `localStorage` UX keys so they are not mistaken for visitor stitching.
