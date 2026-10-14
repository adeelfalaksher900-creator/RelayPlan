# RelayPlan

Elevator pitch: Every community counts. A private relief allocation simulator to compare coverage, test route closures, and export an explainable plan.

Track: Coding
Category: Problem in the Community
Built with: React, TypeScript, Vite, Tailwind CSS, Lucide, network flow, Remotion, HyperFrames, Vercel
Live demo: https://relayplan-eurekadev.vercel.app/

## Inspiration

Pakistan's 2022 floods affected 33 million people, according to the World Bank. Relief planning includes a difficult question: when supplies are insufficient, who receives the smallest share of what they need?

We wanted to make that allocation choice visible in a simple exercise. A nearest-first decision might deliver many kits while leaving one community without any. RelayPlan lets a user compare that outcome with a plan that explicitly protects the lowest demand coverage.

## What it does

RelayPlan is a browser-based planning simulator. Users edit depot stock, community demand, route capacity, travel estimates and blocked routes. It produces an allocation, shows exact unmet need, compares a nearest-first heuristic, previews a route closure, and exports an audit or reusable scenario.

The default fictional exercise has 180 kits and 300 kits of demand. Both strategies deliver 180 kits. Nearest-first has a 0% minimum community coverage because Orchard receives none. RelayPlan allocates 42, 36, 54 and 48 kits to four communities, meeting 60% of each demand.

The trade-off is visible: 3,320 kit-minutes for nearest-first and 4,524 for RelayPlan. Kit-minutes mean kits multiplied by route minutes, not fleet time. Closing South depot → Orchard lowers the coverage floor to 25%, exposing the remaining route's 20-kit bottleneck.

All demo places, needs, supplies and routes are synthetic. There is no live geographic or disaster data, and no measured field-impact claim.

## How we built it

React and TypeScript provide the interactive workspace. Vite and Tailwind CSS handle the build and styling, and Lucide provides icons. A pure TypeScript network-flow solver runs in the browser. Vercel serves the static app.

The solver first maximizes the smallest allocated/demand fraction across positive-demand communities. It then maximizes deliveries while preserving that floor, and finally minimizes transport effort. A finite search over integer coverage thresholds checks flow feasibility; successive shortest augmenting paths use reverse residual edges to revise earlier allocations.

This optimizes the worst coverage floor. It does not recursively optimize the entire ordered vector of community coverage and is not a newly invented fairness algorithm.

## Challenges

The main technical challenge was preserving mandatory community coverage while improving total delivery and cost. A purely greedy approach locks in early route choices. Residual rerouting permits revisions, and a dominating reward ensures mandatory coverage outweighs any possible transport saving.

We also had to keep input and output trustworthy. The app validates bounded scenario files, rejects invalid routes and prototype-related identifiers, renders imported names as text, and escapes spreadsheet formula prefixes in CSV. Scenario data is processed locally rather than uploaded to a server.

## Verification and what we learned

An independent brute-force oracle enumerates every feasible allocation in 200 seeded small networks and 100 irregular networks and compares all three objective values. Additional tests cover the sample scenario, closures, zero supply, disconnected and zero-demand communities, malformed imports and CSV escaping. The production build passes, and the live browser workflow covers strategy comparison, closure preview/application and scenario export.

The key lesson was that a single delivery total hides important differences. A useful planning tool shows both who is underserved and the cost of improving that outcome. Tests verify this bounded implementation, not humanitarian effectiveness.

## Originality

This is a new project created during EurekaDev 2026. We did not reuse SATOpen or Daanish Alumni. Fair allocation and flow optimization are established research areas. Our contribution is the integrated private workflow: an explicit objective, baseline comparison, non-mutating disruption preview, reproducible audit, visible shortfalls and a simple independent oracle.

AI assistance was used in development. Demo narration is synthetic; the demonstrated results use the app’s fictional exercise.

## What's next

Volunteer tabletop testing, interviews about actual planning constraints, a richer route network, uncertain demand and multiple kit types. Real operations would require expert review, validated input, vehicle and deadline constraints, and trustworthy road-status data.

Current scope: one kit type, one round, independent direct routes. No truck scheduling, shared-road congestion, medical priorities or real-time route-safety decisions.

## References

- World Bank, Pakistan flood damage/loss/needs assessment, 28 October 2022: https://www.worldbank.org/en/news/press-release/2022/10/28/pakistan-flood-damages-and-economic-losses-over-usd-30-billion-and-reconstruction-needs-over-usd-16-billion-new-assessme
- Models for relief routing: Equity, efficiency and efficacy: https://www.sciencedirect.com/science/article/pii/S1366554511000639
- Equitable last mile distribution in emergency response: https://www.sciencedirect.com/science/article/pii/S0360835218305655

## Screenshot captions

1. Allocation planner: fictional depots, communities and route capacities, with a 60% minimum coverage floor.
2. Strategy comparison: the same 180 kits, a 0% nearest-first floor and 60% RelayPlan floor, with transport effort shown.
3. Closure preview: blocking South depot → Orchard lowers the coverage floor from 60% to 25%.
4. Local export: download an allocation audit, exact community counts or a reusable scenario without uploading data.
