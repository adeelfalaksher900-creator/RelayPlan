export type Depot = {
  id: string;
  name: string;
  supply: number;
  x: number;
  y: number;
};
export type Community = {
  id: string;
  name: string;
  demand: number;
  x: number;
  y: number;
};
export type Route = {
  id: string;
  from: string;
  to: string;
  capacity: number;
  minutes: number;
  blocked: boolean;
};
export type Scenario = {
  version: 1;
  name: string;
  depots: Depot[];
  communities: Community[];
  routes: Route[];
};
export type Plan = {
  allocations: Record<string, number>;
  received: Record<string, number>;
  delivered: number;
  demand: number;
  supply: number;
  floor: number;
  effort: number;
  unreachable: string[];
  algorithm: string;
};

export const SAMPLE: Scenario = {
  version: 1,
  name: "River district · flood exercise",
  depots: [
    { id: "north", name: "North depot", supply: 100, x: 135, y: 115 },
    { id: "south", name: "South depot", supply: 80, x: 135, y: 330 },
  ],
  communities: [
    { id: "river", name: "Riverbank", demand: 70, x: 610, y: 65 },
    { id: "meadow", name: "Meadow", demand: 60, x: 610, y: 175 },
    { id: "hill", name: "Hillside", demand: 90, x: 610, y: 285 },
    { id: "orchard", name: "Orchard", demand: 80, x: 610, y: 395 },
  ],
  routes: [
    {
      id: "n-r",
      from: "north",
      to: "river",
      capacity: 70,
      minutes: 12,
      blocked: false,
    },
    {
      id: "n-m",
      from: "north",
      to: "meadow",
      capacity: 60,
      minutes: 18,
      blocked: false,
    },
    {
      id: "n-h",
      from: "north",
      to: "hill",
      capacity: 90,
      minutes: 34,
      blocked: false,
    },
    {
      id: "n-o",
      from: "north",
      to: "orchard",
      capacity: 20,
      minutes: 48,
      blocked: false,
    },
    {
      id: "s-r",
      from: "south",
      to: "river",
      capacity: 40,
      minutes: 22,
      blocked: false,
    },
    {
      id: "s-m",
      from: "south",
      to: "meadow",
      capacity: 60,
      minutes: 16,
      blocked: false,
    },
    {
      id: "s-h",
      from: "south",
      to: "hill",
      capacity: 70,
      minutes: 25,
      blocked: false,
    },
    {
      id: "s-o",
      from: "south",
      to: "orchard",
      capacity: 80,
      minutes: 38,
      blocked: false,
    },
  ],
};
export const copyScenario = (s: Scenario) => structuredClone(s);

type Edge = {
  to: number;
  rev: number;
  cap: number;
  cost: number;
  initial: number;
};
class Network {
  g: Edge[][];
  constructor(n: number) {
    this.g = Array.from({ length: n }, () => []);
  }
  add(u: number, v: number, cap: number, cost = 0) {
    const e = { to: v, rev: this.g[v].length, cap, cost, initial: cap };
    this.g[u].push(e);
    this.g[v].push({
      to: u,
      rev: this.g[u].length - 1,
      cap: 0,
      cost: -cost,
      initial: 0,
    });
    return e;
  }
  // Successive shortest augmenting paths. Negative reverse edges let later
  // augmentations reroute earlier allocations rather than lock in a greedy choice.
  flow(source: number, sink: number) {
    let total = 0;
    for (;;) {
      const n = this.g.length,
        dist = Array(n).fill(Infinity),
        pv = Array(n).fill(-1),
        pe = Array(n).fill(-1),
        inQ = Array(n).fill(false);
      dist[source] = 0;
      const q = [source];
      inQ[source] = true;
      for (let head = 0; head < q.length; head++) {
        const u = q[head];
        inQ[u] = false;
        for (let i = 0; i < this.g[u].length; i++) {
          const e = this.g[u][i];
          if (e.cap > 0 && dist[u] + e.cost < dist[e.to]) {
            dist[e.to] = dist[u] + e.cost;
            pv[e.to] = u;
            pe[e.to] = i;
            if (!inQ[e.to]) {
              q.push(e.to);
              inQ[e.to] = true;
            }
          }
        }
      }
      if (pv[sink] < 0) break;
      let amount = Infinity;
      for (let v = sink; v !== source; v = pv[v])
        amount = Math.min(amount, this.g[pv[v]][pe[v]].cap);
      for (let v = sink; v !== source; v = pv[v]) {
        const e = this.g[pv[v]][pe[v]];
        e.cap -= amount;
        this.g[v][e.rev].cap += amount;
      }
      total += amount;
    }
    return total;
  }
}
function build(s: Scenario, targets: number[], final = false) {
  const a = s.depots.length,
    b = s.communities.length,
    source = a + b,
    sink = source + 1,
    net = new Network(sink + 1),
    edges: Record<string, Edge> = {};
  s.depots.forEach((d, i) => net.add(source, i, d.supply));
  s.routes.forEach((r) => {
    if (!r.blocked)
      edges[r.id] = net.add(
        s.depots.findIndex((d) => d.id === r.from),
        a + s.communities.findIndex((c) => c.id === r.to),
        r.capacity,
        final ? r.minutes : 0,
      );
  });
  // One missed mandatory kit must outweigh every possible transport saving.
  const budget = s.depots.reduce((sum, d) => sum + d.supply, 0),
    big = 1 + budget * Math.max(1, ...s.routes.map((r) => r.minutes));
  s.communities.forEach((c, i) => {
    net.add(a + i, sink, targets[i], final ? -big : 0);
    if (final) net.add(a + i, sink, c.demand - targets[i]);
  });
  return { net, source, sink, edges };
}
function summarize(
  s: Scenario,
  allocations: Record<string, number>,
  algorithm: string,
): Plan {
  const received = Object.fromEntries(s.communities.map((c) => [c.id, 0]));
  let effort = 0;
  for (const r of s.routes) {
    received[r.to] += allocations[r.id] ?? 0;
    effort += (allocations[r.id] ?? 0) * r.minutes;
  }
  const active = s.communities.filter((c) => c.demand > 0),
    unreachable = active
      .filter(
        (c) =>
          !s.routes.some(
            (r) =>
              r.to === c.id &&
              !r.blocked &&
              r.capacity > 0 &&
              s.depots.some((d) => d.id === r.from && d.supply > 0),
          ),
      )
      .map((c) => c.id);
  return {
    allocations,
    received,
    delivered: Object.values(received).reduce((a, b) => a + b, 0),
    demand: s.communities.reduce((a, c) => a + c.demand, 0),
    supply: s.depots.reduce((a, d) => a + d.supply, 0),
    floor: active.length
      ? Math.min(...active.map((c) => received[c.id] / c.demand))
      : 1,
    effort,
    unreachable,
    algorithm,
  };
}
export function solve(s: Scenario): Plan {
  validateScenario(s);
  // The optimum is an integer allocation fraction k / demand. Search the finite
  // candidate set exactly; ceil targets use a tiny tolerance at exact fractions.
  const levels = [
    ...new Set([
      0,
      1,
      ...s.communities.flatMap((c) =>
        Array.from({ length: c.demand }, (_, k) => (k + 1) / c.demand),
      ),
    ]),
  ].sort((a, b) => a - b);
  const target = (t: number) =>
    s.communities.map((c) => Math.ceil(t * c.demand - 1e-9));
  let lo = 0,
    hi = levels.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2),
      targets = target(levels[mid]),
      n = build(s, targets);
    if (n.net.flow(n.source, n.sink) === targets.reduce((a, b) => a + b, 0))
      lo = mid;
    else hi = mid - 1;
  }
  const n = build(s, target(levels[lo]), true);
  n.net.flow(n.source, n.sink);
  const allocations = Object.fromEntries(
    s.routes.map((r) => [
      r.id,
      n.edges[r.id] ? n.edges[r.id].initial - n.edges[r.id].cap : 0,
    ]),
  );
  return summarize(
    s,
    allocations,
    "Worst-coverage floor → maximum delivery → minimum kit-minutes",
  );
}
export function nearestFirst(s: Scenario): Plan {
  validateScenario(s);
  const stock = Object.fromEntries(s.depots.map((d) => [d.id, d.supply])),
    need = Object.fromEntries(s.communities.map((c) => [c.id, c.demand])),
    allocations: Record<string, number> = {};
  for (const r of [...s.routes].sort(
    (a, b) => a.minutes - b.minutes || a.id.localeCompare(b.id),
  )) {
    const amount = r.blocked
      ? 0
      : Math.min(r.capacity, stock[r.from], need[r.to]);
    allocations[r.id] = amount;
    stock[r.from] -= amount;
    need[r.to] -= amount;
  }
  return summarize(
    s,
    allocations,
    "Nearest-first heuristic (not an optimized baseline)",
  );
}
export function validateScenario(input: unknown): asserts input is Scenario {
  const fail = (msg: string): never => {
    throw new Error(msg);
  };
  if (!input || typeof input !== "object" || Array.isArray(input))
    fail("Expected a scenario object.");
  const s = input as Scenario;
  const name = (v: unknown) =>
    typeof v === "string" && v.trim().length > 0 && v.length <= 80;
  const integer = (v: unknown, max = 500) =>
    Number.isInteger(v) && Number(v) >= 0 && Number(v) <= max;
  if (s.version !== 1 || !name(s.name))
    fail("Scenario needs version 1 and a name (1–80 characters).");
  if (
    !Array.isArray(s.depots) ||
    !s.depots.length ||
    s.depots.length > 4 ||
    !Array.isArray(s.communities) ||
    !s.communities.length ||
    s.communities.length > 8 ||
    !Array.isArray(s.routes) ||
    s.routes.length > 32
  )
    fail("Use 1–4 depots, 1–8 communities and at most 32 routes.");
  const ids = new Set<string>();
  for (const n of [...s.depots, ...s.communities]) {
    if (
      !n ||
      !name(n.name) ||
      typeof n.id !== "string" ||
      !/^[-a-zA-Z0-9_]{1,32}$/.test(n.id) ||
      ids.has(n.id) ||
      ["__proto__", "constructor", "prototype"].includes(n.id)
    )
      fail("Nodes need unique simple IDs and valid names.");
    ids.add(n.id);
    if (
      !Number.isFinite(n.x) ||
      !Number.isFinite(n.y) ||
      n.x < 70 ||
      n.x > 700 ||
      n.y < 35 ||
      n.y > 425
    )
      fail("Node positions must stay inside the schematic.");
  }
  for (const d of s.depots)
    if (!integer(d.supply))
      fail("Depot supplies must be whole kits from 0 to 500.");
  for (const c of s.communities)
    if (!integer(c.demand))
      fail("Community demands must be whole kits from 0 to 500.");
  const routeIds = new Set();
  for (const r of s.routes) {
    if (
      !r ||
      typeof r.id !== "string" ||
      !/^[-a-zA-Z0-9_]{1,32}$/.test(r.id) ||
      routeIds.has(r.id) ||
      ["__proto__", "constructor", "prototype"].includes(r.id) ||
      !s.depots.some((d) => d.id === r.from) ||
      !s.communities.some((c) => c.id === r.to) ||
      !integer(r.capacity) ||
      !integer(r.minutes, 180) ||
      typeof r.blocked !== "boolean"
    )
      fail(
        "Routes need unique IDs, existing endpoints, integer capacities and minutes (0–180), and a blocked flag.",
      );
    routeIds.add(r.id);
  }
}
export function importScenario(text: string): Scenario {
  if (text.length > 65536)
    throw new Error("Scenario files must be smaller than 64 KB.");
  const s: unknown = JSON.parse(text);
  validateScenario(s);
  // Reconstruct the documented schema so incidental private or unknown fields
  // in a supplied file cannot travel into later exports.
  return {
    version: 1,
    name: s.name,
    depots: s.depots.map(({ id, name, supply, x, y }) => ({
      id,
      name,
      supply,
      x,
      y,
    })),
    communities: s.communities.map(({ id, name, demand, x, y }) => ({
      id,
      name,
      demand,
      x,
      y,
    })),
    routes: s.routes.map(({ id, from, to, capacity, minutes, blocked }) => ({
      id,
      from,
      to,
      capacity,
      minutes,
      blocked,
    })),
  };
}
export function csv(s: Scenario, p: Plan) {
  const quote = (v: string | number) =>
    '"' +
    String(v)
      .replace(/^(?=\s*[=+\-@])|^(?=[\t\r\n])/, "'")
      .replace(/"/g, '""') +
    '"';
  return [
    ["Community", "Demand kits", "Allocated kits", "Coverage percent"],
    ...s.communities.map((c) => [
      c.name,
      c.demand,
      p.received[c.id],
      c.demand
        ? Math.round((10000 * p.received[c.id]) / c.demand) / 100
        : "N/A",
    ]),
  ]
    .map((row) => row.map(quote).join(","))
    .join("\r\n");
}
