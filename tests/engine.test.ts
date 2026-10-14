import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SAMPLE,
  copyScenario,
  solve,
  nearestFirst,
  importScenario,
  csv,
  type Scenario,
} from "../src/engine.ts";
test("demo improves the coverage floor without sacrificing delivered kits", () => {
  const s = copyScenario(SAMPLE),
    p = solve(s),
    g = nearestFirst(s);
  assert.equal(p.delivered, 180);
  assert.equal(p.floor, 0.6);
  assert.equal(g.delivered, 180);
  assert.equal(g.floor, 0);
  assert.equal(p.demand, 300);
});
test("blocked route and zero supply are respected; input remains unchanged", () => {
  const s = copyScenario(SAMPLE);
  s.routes.find((r) => r.id === "s-o")!.blocked = true;
  const before = JSON.stringify(s),
    p = solve(s);
  assert.equal(p.allocations["s-o"], 0);
  assert.equal(p.floor, 0.25);
  assert.equal(JSON.stringify(s), before);
  s.depots.forEach((d) => (d.supply = 0));
  assert.equal(solve(s).delivered, 0);
});
test("disconnected and zero-demand communities are reported honestly", () => {
  const s = copyScenario(SAMPLE);
  s.routes.filter((r) => r.to === "orchard").forEach((r) => (r.blocked = true));
  assert.equal(solve(s).floor, 0);
  assert.deepEqual(solve(s).unreachable, ["orchard"]);
  s.communities.forEach((c) => (c.demand = 0));
  assert.equal(solve(s).floor, 1);
  assert.equal(solve(s).delivered, 0);
});
test("malformed imports are rejected and CSV formula prefixes are escaped", () => {
  assert.throws(() => importScenario("{"));
  assert.throws(() => importScenario("x".repeat(65537)));
  const s = copyScenario(SAMPLE);
  s.depots[0].supply = -1;
  assert.throws(() => solve(s));
  s.depots[0].supply = 100;
  s.communities[0].name = '=HYPERLINK("bad")';
  assert.ok(csv(s, solve(s)).includes("\"'=HYPERLINK"));
  const bad = copyScenario(SAMPLE);
  bad.routes[0].from = "missing";
  assert.throws(() => solve(bad));
});
test("exact three-level objective matches independent exhaustive enumeration on 200 seeded networks", () => {
  let seed = 781;
  const rnd = (n: number) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % n;
  };
  for (let trial = 0; trial < 200; trial++) {
    const s: Scenario = {
      version: 1,
      name: "Oracle test",
      depots: [
        { id: "a", name: "A", supply: rnd(5), x: 100, y: 100 },
        { id: "b", name: "B", supply: rnd(5), x: 100, y: 300 },
      ],
      communities: [
        { id: "x", name: "X", demand: 1 + rnd(4), x: 600, y: 100 },
        { id: "y", name: "Y", demand: 1 + rnd(4), x: 600, y: 300 },
      ],
      routes: ["a", "b"].flatMap((from) =>
        ["x", "y"].map((to) => ({
          id: from + to,
          from,
          to,
          capacity: rnd(4),
          minutes: 1 + rnd(12),
          blocked: rnd(5) === 0,
        })),
      ),
    };
    let best = [-1, -1, Infinity];
    function enumerate(i: number, amounts: number[]) {
      if (i < s.routes.length) {
        for (
          let k = 0;
          k <= (s.routes[i].blocked ? 0 : s.routes[i].capacity);
          k++
        )
          enumerate(i + 1, [...amounts, k]);
        return;
      }
      const used = [amounts[0] + amounts[1], amounts[2] + amounts[3]],
        received = [amounts[0] + amounts[2], amounts[1] + amounts[3]];
      if (
        used.some((v, i) => v > s.depots[i].supply) ||
        received.some((v, i) => v > s.communities[i].demand)
      )
        return;
      const floor = Math.min(
          ...received.map((v, i) => v / s.communities[i].demand),
        ),
        total = received[0] + received[1],
        cost = amounts.reduce((a, v, i) => a + v * s.routes[i].minutes, 0);
      if (
        floor > best[0] + 1e-10 ||
        (Math.abs(floor - best[0]) < 1e-10 &&
          (total > best[1] || (total === best[1] && cost < best[2])))
      )
        best = [floor, total, cost];
    }
    enumerate(0, []);
    const p = solve(s);
    assert.deepEqual([p.floor, p.delivered, p.effort], best, `trial ${trial}`);
  }
});
test("imports drop incidental fields and protect prototype identifiers", () => {
  const input = {
    ...copyScenario(SAMPLE),
    privateNote: "Do not export",
    token: "sample-not-a-secret",
  };
  Object.assign(input.depots[0], { householdContact: "Private sample" });
  const clean = importScenario(JSON.stringify(input));
  assert.equal("privateNote" in clean, false);
  assert.equal("token" in clean, false);
  assert.equal("householdContact" in clean.depots[0], false);
  for (const id of ["__proto__", "constructor", "prototype"]) {
    const bad = copyScenario(SAMPLE);
    bad.routes[0].id = id;
    assert.throws(() => importScenario(JSON.stringify(bad)));
  }
});
test("CSV neutralizes whitespace-prefixed formulas and marks zero demand N/A", () => {
  for (const name of ["=1+1", " +1", "\t@SUM(1)", "\n-1", "  =1+1"]) {
    const s = copyScenario(SAMPLE);
    s.communities[0].name = name;
    assert.ok(csv(s, solve(s)).includes(`"'${name}"`));
  }
  const s = copyScenario(SAMPLE);
  s.communities[0].demand = 0;
  assert.ok(csv(s, solve(s)).includes('"Riverbank","0","0","N/A"'));
});
