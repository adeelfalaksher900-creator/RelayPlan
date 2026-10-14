# RelayPlan

Every community counts. RelayPlan is a private, browser-based relief allocation simulator for community volunteers, students, and planning exercises.

**Live demo:** https://relayplan-eurekadev.vercel.app/

**Website walkthrough:** https://relayplan-eurekadev.vercel.app/demo.html

Built as a new project on 13 October 2026 for EurekaDev 2026, Coding Track, Problem in the Community. MIT licensed. Created for Adeel Falak Sher and Raouf Khalid's team. Do not infer field deployment, volunteer testing or operational approval from this prototype.

## The problem

When supply is insufficient, filling the shortest routes first can leave a distant community without any allocation. Improving total deliveries alone does not tell us who is being left behind. A transparent exercise should show unmet need, transport effort, and how a closure changes the feasible plan.

RelayPlan makes those decisions inspectable without an account, server-side scenario storage, AI API, or paid service.

## Try it in two minutes

1. Open the demo. The fictional River district exercise has 180 available kits and 300 kits of demand.
2. Inspect the allocation planner: 42, 36, 54 and 48 kits. Each community receives 60% of its demand.
3. Open **Compare strategies**. The nearest-first heuristic delivers the same 180 kits but gives Orchard zero kits. Its lowest community coverage is 0%. It is deliberately a simple, clearly labeled heuristic, not an optimal efficiency baseline.
4. Inspect the cost trade-off: 3,320 kit-minutes for nearest-first versus 4,524 for RelayPlan. Kit-minutes are allocation multiplied by route minutes, not fleet travel time.
5. Open **Stress test**. Closing South depot → Orchard reduces the coverage floor to 25%. The preview does not mutate the scenario until **Apply closure**.
6. Edit stock, demand, route capacity and minutes. The solver recalculates immediately. **Reset demo** restores the original exercise.
7. Export an allocation audit, CSV, or reusable scenario JSON. Import the scenario JSON to reproduce the exercise.

All example communities, capacities, supply and demand are synthetic. The schematic is not a geographic map. No personal household records are required.

## Features

- Capacity-aware allocation, with blocked routes excluded.
- Exact worst-coverage objective, followed by maximum delivery and minimum transport effort.
- Side-by-side baseline comparison and an exact allocation audit.
- Non-mutating route-closure previews.
- Validated JSON import and local JSON/CSV export.
- Explicit disconnected-community and zero-demand handling.
- Responsive layout, labeled inputs, keyboard dialog navigation and reduced-motion support.
- Source-grounded method and model-limit explanations inside the app.

## Run locally

Use Node.js 22 or 24 and npm.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite. For verification and a production build:

```sh
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

No `.env`, database, authentication provider, API key, billing account or migration is needed. Rendered video assets are distributed separately and are not required to run the app.

## How the solver works

Each depot has a whole-kit supply. Each community has a whole-kit demand. Each independent direct route has a whole-kit capacity, estimated minutes and a blocked flag.

The objective is ordered:

1. Maximize the minimum allocated/demand fraction across all positive-demand communities.
2. Preserve that floor while maximizing total delivered kits.
3. Minimize the sum of allocated kits × route minutes among those plans.

The optimum worst-coverage value belongs to the finite candidate set `k / communityDemand`. Binary search checks exact feasibility via flow with required community targets. A successive shortest augmenting-path solver then maximizes delivery and minimizes cost, using residual reverse edges to reroute previous decisions. Mandatory coverage has a dominating reward greater than every possible transport saving.

This is **worst-coverage floor optimization**, not full lexicographic max-min fairness across the entire ordered vector of community coverages. If one community is unreachable, the floor remains zero; that community is not silently excluded. Zero-demand communities do not constrain the floor.

See [algorithm and assumptions](docs/ALGORITHM.md), [research](docs/RESEARCH.md) and [security scope](docs/SECURITY.md).

## Validation

The test suite compares all three objective values against independent exhaustive enumeration of every feasible allocation in 200 seeded small networks and 100 irregular networks. Additional tests cover the default exercise, route closure, zero supply, disconnected and zero-demand communities, malformed imports, and CSV formula escaping.

This verifies the implementation within its bounded model. It does not establish real-world fairness, route safety or humanitarian effectiveness. No external user study has been conducted.

## Scope and limits

- One homogeneous type of whole kit, one allocation round.
- Independent depot-to-community routes. Shared road bottlenecks are not represented.
- No truck scheduling, vehicle constraints, delivery deadlines, uncertain demand, medical triage or live road safety information.
- Up to 4 depots, 8 communities, 32 routes; stock, demand and capacity 0–500; estimated route minutes 0–180.
- The app does not persist scenarios after refresh unless you export them.
- Static delivery still exposes normal web request metadata to the hosting provider. Scenario content stays in the browser.

Use for learning and tabletop planning exercises. A real operation needs expert review and a richer, validated model.

## Architecture

React 19 + TypeScript + Vite + Tailwind CSS. Lucide supplies icons. The pure TypeScript solver runs locally, without network requests or telemetry. Vercel serves static assets and security headers. No Cloudflare data store, tenant data, server API or row-level authorization is present.

```
src/engine.ts       Types, validation, flow solver, baseline, exports
src/App.tsx         Planner, comparison, stress test, method screens
src/main.tsx        Browser entry point
src/index.css      Responsive design and semantic palette
tests/engine.test.ts Independent oracle and boundary cases
docs/              Research, assumptions, security, submission notes
video/             Editable video sources, script, timing data and media
public/            App favicon and machine-readable documentation
```

## Contribute

See [video reproduction](video/README.md) for the 1080p composition, narration and captions, and [judging evidence](docs/JUDGING.md) for the submission's reviewable claims.

Open an issue describing the problem, expected behavior and a small reproducible scenario. For code changes, create a branch, add a focused test for solver or import changes, run `npm test` and `npm run build`, then open a pull request explaining the result and limits.

Useful directions: a richer route network, uncertainty intervals, multiple kit types, volunteer usability studies, localized copy and clearer scenario editing. Do not add demographic priority weights without discussing the ethics and model behavior first. Do not upload personal beneficiary records or secrets.

## Research and originality

Fair allocation and humanitarian logistics are established research areas. RelayPlan's original contribution is the small, private workflow connecting explicit objectives, baseline comparison, closure simulation and reproducible export. We do not claim a new research algorithm or measured field impact.

- [World Bank Pakistan floods assessment, 2022](https://www.worldbank.org/en/news/press-release/2022/10/28/pakistan-flood-damages-and-economic-losses-over-usd-30-billion-and-reconstruction-needs-over-usd-16-billion-new-assessme): context, including 33 million people affected.
- [Models for relief routing: Equity, efficiency and efficacy](https://www.sciencedirect.com/science/article/pii/S1366554511000639): the objective trade-off.
- [Equitable last mile distribution in emergency response](https://www.sciencedirect.com/science/article/pii/S0360835218305655): fairness in relief allocation.

The demo values are illustrative, not extracted from those sources. Research informed the model choices, not fabricated operational data.

## License and credits

MIT, see [LICENSE](LICENSE). Dependency licenses remain with their respective projects. AI assistance was used throughout development and narration; the implementation is accompanied by executable tests and explicit scope limits. The video renders the actual app interface with deterministic inputs, scrolling and a pointer. Narration uses ElevenLabs’ stock Mark voice; it is not a recording of a team member.
