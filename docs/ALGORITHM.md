# Algorithm

For depot supply s, community demand d, and route allocation x, each route satisfies 0 ≤ x ≤ capacity. Blocked routes have x=0. Depot outbound totals cannot exceed supply. Community inbound totals cannot exceed demand.

The first objective is max min(received_c / d_c) over positive-demand communities. For a tested threshold t, set target_c = ceil(t × d_c) with a small numeric tolerance at exact fractions. A source → depot → community → sink network checks whether all targets can be delivered. Candidate thresholds are all k/d_c for integer k, so finite search recovers an exact integer-allocation floor.

The final flow has parallel community-to-sink edges: a mandatory target edge with dominating negative cost and an extra-demand edge with zero cost. Route costs are minutes per kit. The dominating reward is one greater than total available supply multiplied by the largest route cost. Missing one mandatory unit cannot be compensated by any possible saving on route cost.

Successive shortest augmenting paths run until no augmenting path remains. Reverse residual edges permit revisions of prior choices. Within the maximum feasible flow, costs prioritize mandatory target satisfaction, then minimum effort. The floor targets are jointly feasible; the independent oracle tests verify the resulting three-level objective.

Nearest-first sorts routes by minutes, then route ID, filling each greedily within remaining stock and need. It is a pedagogical heuristic, not an optimal comparator.

The oracle recursively enumerates every route's integer quantity on small networks. It discards infeasible choices and ranks feasible allocations independently by floor, total, then effort. 200 seeded cases are tested.

Model limits: direct independent routes, one item type, one round, no deadlines or fleet scheduling. This optimizes only the worst floor, not the entire lexicographically ordered coverage vector.
