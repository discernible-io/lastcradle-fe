# lastcradle-fe — open work

> **Before editing:** Review [documentation-standard.md](https://github.com/discernible-io/docs/blob/main/docs/documentation-standard.md).

**Created:** 2026-10-27  
**Last reviewed:** 2026-10-27

Living backlog for this spectator SPA. Index: [`README.md`](README.md). Scored as **browser SPA** against discernible-io/docs ([applicability matrix](https://github.com/discernible-io/docs/blob/main/docs/documentation-standard.md#applicability-matrix)). Reference-only to standards (no vendored `docs/`).

## Standards conformance gaps (host audit 2026-10-27)

| Gap | Standard | Evidence / action |
| --- | --- | --- |
| Missing root backlog (closed by this file) | documentation principle **21** | Index from README |
| Floating Actions | cicd **PI 16** (image/deploy hygiene) | **Done 2026-10-27** — `deploy.yml` actions SHA-pinned |
| Frontend env | [`frontend-branch-env-migration.md`](https://github.com/discernible-io/docs/blob/main/docs/frontend-branch-env-migration.md) | Confirm `.env.development` / `.env.main` + build copy logging of public keys |
| Funnel privacy | [`funnel-standard.md`](https://github.com/discernible-io/docs/blob/main/docs/funnel-standard.md) | `utm.js` is cookieless for stitching; `sessionTtlCache` / watch-guide `localStorage` are product UX — keep funnel ids out of storage (already the rule). Confirm no regression |
| Coding **PI 12** | coding | Outcome tests beyond funnel smoke; apply when touching features |
| Logging **PI 14** (frontend) | logging | One app logger; raise detail via public `LOG_LEVEL` without editing business logic |

## Product / ops (non-standards)

- Confirm live `funnel.land` from `lastcradle.io` lands in the shared Loki tenant after CORS/beacon deploy.
- Keep enroll CTA attribution on query string only.
