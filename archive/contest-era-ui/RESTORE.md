# Contest / season / prize UI (archived)

Frozen snapshot of prize-trust and season-schedule UI removed for the always-on ranking migration.

**Do not restore unless bringing back contest/season prize UX.** Prefer the full-repo archive instead:

https://github.com/discernible-io/lastcradle-fe-archive-pre-always-on-ranking

## Files here

| Archived | Original path |
| --- | --- |
| `PrizesPage.jsx` | `src/pages/PrizesPage.jsx` |
| `OfficialPrizeRules.jsx` | `src/components/campaign/OfficialPrizeRules.jsx` |
| `PrizeTrustPanel.jsx` | `src/components/campaign/PrizeTrustPanel.jsx` |
| `SeasonStrip.jsx` | `src/components/campaign/SeasonStrip.jsx` |
| `First5Flash.jsx` | `src/components/campaign/First5Flash.jsx` |
| `GateSchedule.jsx` | `src/components/gate/GateSchedule.jsx` |

These modules expect the old `campaign` season/prize fields and contest APIs. The active app uses `/ranking` + `GET /api/game/ranking` instead.
