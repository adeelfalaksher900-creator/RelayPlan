import test from "node:test";
import assert from "node:assert/strict";
import { solve, type Scenario } from "../src/engine.ts";
test("three-objective solution matches 100 irregular graphs with parallel routes and zero-minute edges", () => {
  let seed = 98307;
  const rnd = (n: number) => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) % n;
  };
  for (let trial = 0; trial < 100; trial++) {
    const a = 1 + rnd(3),
      b = 1 + rnd(3);
    const s: Scenario = {
      version: 1,
      name: "Extended oracle",
      depots: Array.from({ length: a }, (_, i) => ({
        id: `d${i}`,
        name: `D${i}`,
        supply: rnd(6),
        x: 100,
        y: 70 + i * 100,
      })),
      communities: Array.from({ length: b }, (_, i) => ({
        id: `c${i}`,
        name: `C${i}`,
        demand: rnd(5),
        x: 600,
        y: 70 + i * 100,
      })),
      routes: Array.from({ length: 3 + rnd(4) }, (_, i) => ({
        id: `r${i}`,
        from: `d${rnd(a)}`,
        to: `c${rnd(b)}`,
        capacity: rnd(3),
        minutes: rnd(8),
        blocked: rnd(6) === 0,
      })),
    };
    let best = [-1, -1, Infinity];
    const used = Array(a).fill(0),
      received = Array(b).fill(0);
    const visit = (i: number, total: number, cost: number) => {
      if (i === s.routes.length) {
        const positive = s.communities
          .map((c, j) => (c.demand ? received[j] / c.demand : null))
          .filter((x): x is number => x !== null);
        const floor = positive.length ? Math.min(...positive) : 1;
        if (
          floor > best[0] + 1e-10 ||
          (Math.abs(floor - best[0]) < 1e-10 &&
            (total > best[1] || (total === best[1] && cost < best[2])))
        )
          best = [floor, total, cost];
        return;
      }
      const r = s.routes[i],
        d = s.depots.findIndex((x) => x.id === r.from),
        c = s.communities.findIndex((x) => x.id === r.to);
      const max = r.blocked
        ? 0
        : Math.min(
            r.capacity,
            s.depots[d].supply - used[d],
            s.communities[c].demand - received[c],
          );
      for (let k = 0; k <= max; k++) {
        used[d] += k;
        received[c] += k;
        visit(i + 1, total + k, cost + k * r.minutes);
        used[d] -= k;
        received[c] -= k;
      }
    };
    visit(0, 0, 0);
    const p = solve(s);
    assert.deepEqual([p.floor, p.delivered, p.effort], best, `trial ${trial}`);
  }
});
