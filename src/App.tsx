import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDownToLine,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  GitCompareArrows,
  Layers3,
  Map,
  Menu,
  Package,
  Play,
  Plus,
  RotateCcw,
  Route as RouteIcon,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
  BookOpen,
  ExternalLink,
  TriangleAlert,
  LockKeyhole,
  Activity,
} from "lucide-react";
import {
  SAMPLE,
  copyScenario,
  solve,
  nearestFirst,
  importScenario,
  csv,
  type Scenario,
  type Plan,
  type Route,
} from "./engine";

export type View = "planner" | "compare" | "stress" | "method";
const pct = (n: number) => `${Math.round(n * 100)}%`;
function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function scenarioPreset(key: string) {
  const s = copyScenario(SAMPLE);
  if (key === "bridge") {
    s.name = "Bridge closure · flood exercise";
    s.routes.find((r) => r.id === "s-o")!.blocked = true;
  }
  if (key === "scarcity") {
    s.name = "Supply shortage · flood exercise";
    s.depots[0].supply = 55;
    s.depots[1].supply = 35;
  }
  return s;
}
function Logo() {
  return (
    <span className="logo-mark">
      <RouteIcon size={21} />
    </span>
  );
}
function Network({
  s,
  p,
  onRoute,
  selected,
}: {
  s: Scenario;
  p: Plan;
  onRoute: (r: Route) => void;
  selected: string | null;
}) {
  return (
    <svg
      className="network"
      viewBox="0 0 780 470"
      role="img"
      aria-labelledby="network-title"
    >
      <title id="network-title">
        Supply network schematic. Route controls are listed below. Fictional
        locations, not a geographic map.
      </title>
      <defs>
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r=".8" fill="#cad7cc" />
        </pattern>
      </defs>
      <rect width="780" height="470" fill="url(#dots)" />
      <path
        d="M350 -20 C280 100 445 210 352 310 S350 460 435 500"
        fill="none"
        stroke="#e2eded"
        strokeWidth="70"
      />
      <path
        d="M350 -20 C280 100 445 210 352 310 S350 460 435 500"
        fill="none"
        stroke="#d6e5e4"
        strokeWidth="2"
        strokeDasharray="6 8"
      />
      <text x="361" y="449" fill="#738b85" fontSize="10" letterSpacing="2">
        SCHEMATIC · NOT A MAP
      </text>
      {s.routes.map((r, i) => {
        const d = s.depots.find((d) => d.id === r.from)!,
          c = s.communities.find((c) => c.id === r.to)!,
          amount = p.allocations[r.id] ?? 0;
        const active = selected === r.id;
        const x1 = d.x + 28,
          x2 = c.x - 28;
        const cy = (d.y + c.y) / 2 + (i % 2 ? 13 : -13);
        return (
          <g key={r.id} className="network-route" onClick={() => onRoute(r)}>
            <path
              d={`M ${x1} ${d.y} C 310 ${d.y}, 430 ${c.y}, ${x2} ${c.y}`}
              fill="none"
              stroke={r.blocked ? "#ae541e" : amount ? "#527f69" : "#a6b6ac"}
              strokeWidth={active ? 5 : amount ? 3 : 1.5}
              strokeDasharray={r.blocked ? "7 5" : amount ? undefined : "4 6"}
              opacity={selected && !active ? 0.35 : 1}
            />
            <rect
              x={278 + (i % 2) * 105}
              y={cy - 11}
              rx="6"
              width="67"
              height="23"
              fill={r.blocked ? "#fff0e3" : "#fff"}
              stroke={r.blocked ? "#d6a079" : "#d5dfd5"}
            />
            <text
              x={311 + (i % 2) * 105}
              y={cy + 4}
              textAnchor="middle"
              fill={r.blocked ? "#914518" : "#36594a"}
              fontSize="10"
              fontWeight="600"
            >
              {r.blocked ? "Blocked" : `${amount} / ${r.capacity}`}
            </text>
          </g>
        );
      })}
      {s.depots.map((d) => (
        <g key={d.id}>
          <rect
            x={d.x - 28}
            y={d.y - 28}
            width="56"
            height="56"
            rx="15"
            fill="#143c35"
          />
          <path
            d={`M${d.x - 12} ${d.y - 2}l12-8 12 8v13h-24zm8 0v13m8-13v13`}
            fill="none"
            stroke="#e4efcc"
            strokeWidth="2"
          />
          <text
            x={d.x}
            y={d.y + 47}
            textAnchor="middle"
            fill="#20352f"
            fontSize="13"
            fontWeight="650"
          >
            <title>{d.name}</title>
            {d.name.length > 20 ? `${d.name.slice(0, 18)}…` : d.name}
          </text>
          <text
            x={d.x}
            y={d.y + 65}
            textAnchor="middle"
            fill="#5e7068"
            fontSize="11"
          >
            {d.supply} kits available
          </text>
        </g>
      ))}
      {s.communities.map((c) => (
        <g key={c.id}>
          <circle
            cx={c.x}
            cy={c.y}
            r="27"
            fill="white"
            stroke={p.received[c.id] === 0 && c.demand ? "#ae541e" : "#7a9677"}
            strokeWidth="2"
          />
          <path
            d={`M${c.x - 11} ${c.y + 6}v-8l11-8 11 8v8m-15 0v-6h8v6`}
            fill="none"
            stroke="#36594a"
            strokeWidth="2"
          />
          <text
            x={c.x + 41}
            y={c.y - 5}
            fill="#20352f"
            fontSize="13"
            fontWeight="650"
          >
            <title>{c.name}</title>
            {c.name.length > 18 ? `${c.name.slice(0, 16)}…` : c.name}
          </text>
          <text x={c.x + 41} y={c.y + 13} fill="#5e7068" fontSize="11">
            {p.received[c.id]} / {c.demand} kits
          </text>
          <text
            x={c.x + 41}
            y={c.y + 29}
            fill="#36594a"
            fontSize="11"
            fontWeight="600"
          >
            {c.demand ? pct(p.received[c.id] / c.demand) : "No demand"}
          </text>
        </g>
      ))}
    </svg>
  );
}

export type PresentationState = {
  view?: View;
  scenario?: Scenario;
  selected?: string | null;
  notice?: string;
  exportOpen?: boolean;
  preset?: string;
  stressId?: string;
};
export default function App({
  presentation,
}: { presentation?: PresentationState } = {}) {
  const [viewState, setView] = useState<View>("planner"),
    [scenarioState, setScenario] = useState(() => copyScenario(SAMPLE)),
    [selectedState, setSelected] = useState<string | null>(null),
    [noticeState, setNotice] = useState(""),
    [exportState, setExportOpen] = useState(false),
    [mobile, setMobile] = useState(false),
    [presetState, setPreset] = useState("default"),
    [revision, setRevision] = useState(0),
    [stressState, setStressId] = useState("s-o");
  const view = presentation?.view ?? viewState,
    s = presentation?.scenario ?? scenarioState,
    selected = presentation ? (presentation.selected ?? null) : selectedState,
    notice = presentation?.notice ?? noticeState,
    exportOpen = presentation?.exportOpen ?? exportState,
    preset = presentation?.preset ?? presetState,
    stressId = presentation?.stressId ?? stressState;
  const input = useRef<HTMLInputElement>(null);
  const p = useMemo(() => solve(s), [s, revision]),
    g = useMemo(() => nearestFirst(s), [s]);
  const stressed = useMemo(() => {
    const next = copyScenario(s);
    const r = next.routes.find((r) => r.id === stressId);
    if (r) r.blocked = true;
    return solve(next);
  }, [s, stressId]);
  const route = s.routes.find((r) => r.id === selected);
  useEffect(() => {
    if (!selected && !exportOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const modal = document.querySelector<HTMLElement>("[role=dialog]");
    const items = () =>
      Array.from(
        modal?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input, select, a[href]",
        ) ?? [],
      );
    items()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setExportOpen(false);
      }
      if (e.key === "Tab") {
        const controls = items(),
          first = controls[0],
          last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [selected, exportOpen]);

  function update(fn: (next: Scenario) => void) {
    setScenario((old) => {
      const n = copyScenario(old);
      fn(n);
      return n;
    });
    setNotice("");
  }
  function switchView(v: View) {
    setView(v);
    setMobile(false);
    setSelected(null);
  }
  function exportPlan() {
    download(
      "relayplan-audit.json",
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          scenario: s,
          plan: p,
          baseline: g,
          scope:
            "Fictional planning simulation. Whole kits; independent direct routes. Not a dispatch or route-safety tool.",
        },
        null,
        2,
      ),
      "application/json",
    );
    setNotice("Plan exported with scenario, results and model scope.");
    setExportOpen(false);
  }
  async function load(file?: File) {
    if (!file) return;
    try {
      if (file.size > 65536)
        throw new Error("Scenario files must be smaller than 64 KB.");
      const imported = importScenario(await file.text());
      setScenario(imported);
      setStressId(imported.routes.find((r) => !r.blocked)?.id ?? "");
      setPreset("custom");
      setSelected(null);
      setNotice("Scenario imported. Results recalculated locally.");
    } catch (e) {
      setNotice(
        `Import failed: ${e instanceof Error ? e.message : "Invalid file."}`,
      );
    }
    if (input.current) input.current.value = "";
  }
  const totalUnused = p.supply - p.delivered,
    open = s.routes.filter((r) => !r.blocked).length;
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <aside
        inert={Boolean(selected || exportOpen)}
        className={mobile ? "sidebar open" : "sidebar"}
      >
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            switchView("planner");
          }}
        >
          <Logo />
          <span>
            RelayPlan<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="workspace-label">COMMUNITY OPERATIONS</div>
        <div className="workspace-card">
          <span className="workspace-icon">
            <Layers3 size={17} />
          </span>
          <span>
            Relief planning lab<small>Local workspace</small>
          </span>
          <LockKeyhole size={13} />
        </div>
        <div className="sidebar-caption">WORKSPACE</div>
        <nav aria-label="Workspace">
          {(
            [
              ["planner", "Allocation planner", Map],
              ["compare", "Compare strategies", GitCompareArrows],
              ["stress", "Stress test", Activity],
              ["method", "How it works", BookOpen],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              className={view === key ? "nav-item active" : "nav-item"}
              onClick={() => switchView(key)}
              aria-current={view === key ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
              {view === key && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <a className="nav-item demo-link" href="/demo.html">
          <Play size={18} />
          Watch walkthrough
          <ArrowUpRight size={14} />
        </a>
        <div className="sidebar-note">
          <div className="note-icon">
            <ShieldCheck size={20} />
          </div>
          <h3>Your scenario stays yours.</h3>
          <p>
            Allocation runs in your browser. No account, uploads to a server, or
            API keys.
          </p>
          <span>
            <span className="tiny-dot" />
            Private by design
          </span>
        </div>
        <div className="sidebar-footer">
          <div className="avatar">AF</div>
          <div>
            Adeel Falak Sher<small>EurekaDev 2026 · Coding</small>
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={Boolean(selected || exportOpen)}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Toggle navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={21} />
            </button>
            <span>Relief planning lab</span>
            <ChevronRight size={13} />
            <strong>
              {view === "planner"
                ? "Allocation planner"
                : view === "compare"
                  ? "Compare strategies"
                  : view === "stress"
                    ? "Stress test"
                    : "How it works"}
            </strong>
          </div>
          <span className="local-badge">
            <span className="tiny-dot" />
            Runs locally
          </span>
          <button
            className="icon-button"
            title="Reset demo scenario"
            aria-label="Reset demo scenario"
            onClick={() => {
              setScenario(copyScenario(SAMPLE));
              setPreset("default");
              setSelected(null);
              setStressId("s-o");
              setNotice("Demo reset.");
            }}
          >
            <RotateCcw size={17} />
          </button>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="tiny-dot" />
                PLANNING, WITH EVERY COMMUNITY IN VIEW
              </div>
              <h1>
                {view === "planner"
                  ? "Every community counts."
                  : view === "compare"
                    ? "Same supplies. Different outcomes."
                    : view === "stress"
                      ? "A blocked route changes the plan."
                      : "Make the decision explainable."}
              </h1>
              <p>
                {view === "planner"
                  ? "Turn limited supplies into a fairer, traceable allocation plan."
                  : view === "compare"
                    ? "See what changes when the least-served community comes first."
                    : view === "stress"
                      ? "Test a closure before it becomes a constraint in your plan."
                      : "The method, evidence and limits behind every allocation."}
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="button secondary"
                onClick={() => input.current?.click()}
              >
                <Upload size={15} />
                Import scenario
              </button>
              <button
                className="button primary"
                onClick={() => setExportOpen(true)}
              >
                <ArrowDownToLine size={16} />
                Export plan
                <ChevronDown size={13} />
              </button>
            </div>
            <input
              ref={input}
              type="file"
              accept=".json,application/json"
              hidden
              aria-label="Import scenario JSON"
              onChange={(e) => load(e.target.files?.[0])}
            />
          </div>
          <div className="simulation-strip">
            <FlaskConical size={16} />
            <span>
              <strong>Simulation workspace.</strong> Fictional communities and
              supplies. Use for learning and planning exercises.
            </span>
            <span className="strip-tag">NO LIVE DISASTER DATA</span>
          </div>
          {notice && (
            <div
              className={
                notice.startsWith("Import failed") ? "notice error" : "notice"
              }
              role="status"
            >
              {notice}
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {view === "planner" && (
            <>
              <section className="metrics" aria-label="Allocation summary">
                <Metric
                  label="Kits allocated"
                  value={String(p.delivered)}
                  unit={`/ ${p.demand}`}
                  detail={`${p.supply} kits available`}
                  icon={<Package size={18} />}
                  progress={p.demand ? p.delivered / p.demand : 0}
                />
                <Metric
                  label="Lowest community coverage"
                  value={pct(p.floor)}
                  detail="Minimum share of demand met"
                  icon={<ShieldCheck size={18} />}
                  accent
                />
                <Metric
                  label="Communities in plan"
                  value={String(s.communities.length)}
                  detail={`${p.unreachable.length} unreachable with current inputs`}
                  icon={<Layers3 size={18} />}
                />
                <Metric
                  label="Open routes"
                  value={String(open)}
                  unit={`/ ${s.routes.length}`}
                  detail={`${s.routes.length - open} blocked · ${totalUnused} kits unused`}
                  icon={<RouteIcon size={18} />}
                />
              </section>
              <div className="workspace-grid">
                <section className="panel network-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Supply network</h2>
                      <p>Explore the routes behind your allocation.</p>
                    </div>
                    <span className="badge green">
                      {pct(p.floor)} coverage floor
                    </span>
                  </div>
                  <div className="network-toolbar">
                    <label className="scenario-select">
                      <Layers3 size={14} />
                      <select
                        value={preset}
                        onChange={(e) => {
                          setPreset(e.target.value);
                          setScenario(scenarioPreset(e.target.value));
                          setSelected(null);
                          setStressId("s-o");
                          setNotice("Scenario loaded.");
                        }}
                        aria-label="Scenario preset"
                      >
                        <option value="default">
                          River district · flood exercise
                        </option>
                        <option value="bridge">Bridge closure exercise</option>
                        <option value="scarcity">
                          Supply shortage exercise
                        </option>
                        {preset === "custom" && (
                          <option value="custom">Imported scenario</option>
                        )}
                      </select>
                    </label>
                    <span className="network-period">ONE ALLOCATION ROUND</span>
                  </div>
                  <Network
                    s={s}
                    p={p}
                    onRoute={(r) => setSelected(r.id)}
                    selected={selected}
                  />
                  <div className="network-legend">
                    <span>
                      <i className="legend-line" />
                      Allocated route
                    </span>
                    <span>
                      <i className="legend-line dotted" />
                      Unused route
                    </span>
                    <span>
                      <i className="legend-line blocked" />
                      Blocked route
                    </span>
                    <span>Label: allocated / capacity</span>
                  </div>
                </section>
                <aside className="panel controls-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Plan inputs</h2>
                      <p>Change a supply. See the trade-off.</p>
                    </div>
                    <SlidersHorizontal size={18} />
                  </div>
                  <div className="control-body">
                    <div className="field-label">
                      AVAILABLE SUPPLIES<span>WHOLE KITS</span>
                    </div>
                    {s.depots.map((d) => (
                      <div className="supply-control" key={d.id}>
                        <label htmlFor={`supply-${d.id}`}>
                          <span>
                            <Package size={14} />
                            {d.name}
                          </span>
                          <span className="stock-entry">
                            <input
                              type="number"
                              min="0"
                              max="500"
                              step="1"
                              value={d.supply}
                              aria-label={`${d.name} stock in kits`}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                if (Number.isInteger(v) && v >= 0 && v <= 500)
                                  update((n) => {
                                    n.depots.find(
                                      (x) => x.id === d.id,
                                    )!.supply = v;
                                  });
                              }}
                            />
                            <small>kits</small>
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          step="1"
                          id={`supply-${d.id}`}
                          value={d.supply}
                          onChange={(e) =>
                            update((n) => {
                              n.depots.find((x) => x.id === d.id)!.supply =
                                Number(e.target.value);
                            })
                          }
                        />
                        <div className="range-labels">
                          <span>0</span>
                          <span>500 kits</span>
                        </div>
                      </div>
                    ))}
                    <div className="rule-separator" />
                    <div className="field-label">
                      COMMUNITY DEMAND<span>KITS NEEDED</span>
                    </div>
                    {s.communities.map((c) => (
                      <div className="demand-field" key={c.id}>
                        <label htmlFor={`demand-${c.id}`}>{c.name}</label>
                        <input
                          type="number"
                          min="0"
                          max="500"
                          step="1"
                          id={`demand-${c.id}`}
                          value={c.demand}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (Number.isInteger(v) && v >= 0 && v <= 500)
                              update((n) => {
                                n.communities.find(
                                  (x) => x.id === c.id,
                                )!.demand = v;
                              });
                          }}
                        />
                      </div>
                    ))}
                    <div className="objective">
                      <ShieldCheck size={18} />
                      <div>
                        <strong>Lowest coverage first</strong>
                        <p>
                          Maximize the minimum demand coverage, then deliveries,
                          then reduce transport effort.
                        </p>
                      </div>
                    </div>
                    <button
                      className="button primary full"
                      onClick={() => {
                        setRevision((x) => x + 1);
                        setNotice(
                          "Plan recalculated. All route, stock and demand constraints respected.",
                        );
                      }}
                    >
                      <Play size={15} />
                      Recalculate plan
                      <ArrowRight size={15} />
                    </button>
                    <div className="auto-label">
                      <CheckCircle2 size={12} />
                      Inputs also recalculate automatically
                    </div>
                  </div>
                </aside>
              </div>
              <section className="panel allocations">
                <div className="panel-heading">
                  <div>
                    <h2>Community allocation</h2>
                    <p>
                      Every kit is accounted for. Every shortfall stays visible.
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => switchView("compare")}
                  >
                    Compare with nearest-first
                    <ArrowUpRight size={15} />
                  </button>
                </div>
                <AllocationTable s={s} p={p} />
              </section>
              <section className="panel routes-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Route conditions</h2>
                    <p>
                      Select a route to change its capacity, travel estimate or
                      availability.
                    </p>
                  </div>
                  <span className="badge">{s.routes.length} direct routes</span>
                </div>
                <div className="route-grid">
                  {s.routes.map((r) => (
                    <button
                      className={
                        r.blocked ? "route-card is-blocked" : "route-card"
                      }
                      key={r.id}
                      onClick={() => setSelected(r.id)}
                    >
                      <div>
                        <RouteIcon size={15} />
                        <strong>
                          {s.depots.find((d) => d.id === r.from)?.name} →{" "}
                          {s.communities.find((c) => c.id === r.to)?.name}
                        </strong>
                        <ChevronRight size={14} />
                      </div>
                      <span>
                        {r.blocked
                          ? "Blocked"
                          : `${p.allocations[r.id]} allocated`}
                        <small>
                          {r.minutes} min · cap {r.capacity}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
          {view === "compare" && (
            <>
              <section className="comparison-hero">
                <div>
                  <span className="badge green">
                    FAIRNESS IS A CHOICE YOU CAN INSPECT
                  </span>
                  <h2>
                    {pct(g.floor)} → {pct(p.floor)}
                  </h2>
                  <p>Lowest community coverage, using the same inputs.</p>
                </div>
                <div>
                  <strong>
                    {p.delivered - g.delivered >= 0 ? "+" : ""}
                    {p.delivered - g.delivered} kits
                  </strong>
                  <p>Change in total deliveries</p>
                  <strong>{p.effort.toLocaleString()} kit-minutes</strong>
                  <p>Fair plan transport effort</p>
                </div>
              </section>
              <div className="compare-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Coverage by community</h2>
                      <p>Share of each community’s demand met.</p>
                    </div>
                  </div>
                  <div className="compare-bars">
                    {s.communities.map((c) => (
                      <div className="compare-row" key={c.id}>
                        <h3>
                          {c.name}
                          <small>{c.demand} kits needed</small>
                        </h3>
                        <div className="bar-row">
                          <span>Nearest-first</span>
                          <div className="bar-track">
                            <div
                              className="bar-fill baseline"
                              style={{
                                width: pct(
                                  c.demand ? g.received[c.id] / c.demand : 1,
                                ),
                              }}
                            />
                          </div>
                          <strong>
                            {pct(c.demand ? g.received[c.id] / c.demand : 1)}
                          </strong>
                        </div>
                        <div className="bar-row">
                          <span>RelayPlan</span>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: pct(
                                  c.demand ? p.received[c.id] / c.demand : 1,
                                ),
                              }}
                            />
                          </div>
                          <strong>
                            {pct(c.demand ? p.received[c.id] / c.demand : 1)}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="panel explanation-panel">
                  <span className="badge">READ THE TRADE-OFF</span>
                  <h2>A better floor is not a free lunch.</h2>
                  <p>
                    Nearest-first fills the shortest available routes in order.
                    It is a simple heuristic, not an optimized competitor.
                  </p>
                  <div className="tradeoff-stat">
                    <span>Nearest-first effort</span>
                    <strong>{g.effort.toLocaleString()} kit-min</strong>
                  </div>
                  <div className="tradeoff-stat">
                    <span>RelayPlan effort</span>
                    <strong>{p.effort.toLocaleString()} kit-min</strong>
                  </div>
                  <p>
                    The fair plan protects the lowest coverage first. That
                    sometimes means more transport effort. Kit-minutes are kits
                    multiplied by route minutes, not fleet time.
                  </p>
                  <div className="objective">
                    <TriangleAlert size={18} />
                    <div>
                      <strong>A clear limit</strong>
                      <p>
                        This does not model trucks, shared roads, delivery
                        deadlines or route safety.
                      </p>
                    </div>
                  </div>
                  <button
                    className="button secondary full"
                    onClick={() => switchView("stress")}
                  >
                    Test a blocked route
                    <ArrowRight size={16} />
                  </button>
                </section>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Allocation audit</h2>
                    <p>
                      Use the table to inspect exact counts behind the
                      comparison.
                    </p>
                  </div>
                </div>
                <AllocationTable s={s} p={p} g={g} />
              </section>
            </>
          )}
          {view === "stress" && (
            <>
              <section className="panel stress-intro">
                <div>
                  <span className="badge amber">WHAT-IF SIMULATION</span>
                  <h2>What happens if this route closes?</h2>
                  <p>
                    The current scenario stays intact until you apply the
                    closure.
                  </p>
                </div>
                <label className="stress-select">
                  Route to close
                  <select
                    value={
                      s.routes.some((r) => r.id === stressId) ? stressId : ""
                    }
                    onChange={(e) => setStressId(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a route
                    </option>
                    {s.routes.map((r) => (
                      <option value={r.id} key={r.id}>
                        {s.depots.find((d) => d.id === r.from)?.name} →{" "}
                        {s.communities.find((c) => c.id === r.to)?.name}
                        {r.blocked ? " (already blocked)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </section>
              <section className="metrics three">
                <Metric
                  label="Current coverage floor"
                  value={pct(p.floor)}
                  detail="Current inputs"
                  icon={<ShieldCheck size={18} />}
                />
                <Metric
                  label="After closure"
                  value={pct(stressed.floor)}
                  detail={`${stressed.delivered} kits still delivered`}
                  icon={<TriangleAlert size={18} />}
                />
                <Metric
                  label="Change in worst coverage"
                  value={`${Math.round((stressed.floor - p.floor) * 100)} pp`}
                  detail="Percentage-point difference"
                  icon={<Activity size={18} />}
                />
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Closure impact</h2>
                    <p>
                      Remaining routes are reallocated, not merely subtracted.
                    </p>
                  </div>
                  <button
                    className="button primary"
                    disabled={
                      !s.routes.some((r) => r.id === stressId && !r.blocked)
                    }
                    onClick={() => {
                      update((n) => {
                        n.routes.find((r) => r.id === stressId)!.blocked = true;
                      });
                      setNotice("Closure applied to the current scenario.");
                      switchView("planner");
                    }}
                  >
                    Apply closure
                    <ArrowRight size={15} />
                  </button>
                </div>
                <AllocationTable
                  s={s}
                  p={stressed}
                  g={p}
                  baselineLabel="Current"
                />
              </section>
              <section className="panel explanation-panel wide">
                <h2>Constraints, not a predicted disaster.</h2>
                <p>
                  A route closure is an input you set. RelayPlan does not fetch
                  or predict road status. The model treats each
                  depot-to-community route as independent, with a per-round
                  capacity. If a community becomes unreachable, its zero
                  coverage remains in the fairness metric rather than being
                  hidden.
                </p>
                <p>
                  Try closing South depot → Orchard in the default exercise. The
                  lowest coverage falls from 60% to 25%. Restore it using Reset
                  demo.
                </p>
              </section>
            </>
          )}
          {view === "method" && (
            <>
              <div className="method-grid">
                <section className="panel explanation-panel">
                  <span className="badge green">EXPLAINABLE OPTIMIZATION</span>
                  <h2>Three priorities. In order.</h2>
                  <ol className="steps">
                    <li>
                      <span>01</span>
                      <div>
                        <h3>Protect the lowest coverage</h3>
                        <p>
                          Find the largest feasible minimum allocated/demand
                          fraction across all communities with positive demand.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>02</span>
                      <div>
                        <h3>Deliver as many kits as possible</h3>
                        <p>
                          Keep that floor and maximize total deliveries within
                          supply, demand and route capacity.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>03</span>
                      <div>
                        <h3>Reduce transport effort</h3>
                        <p>
                          Among those allocations, minimize Σ allocated kits ×
                          route minutes.
                        </p>
                      </div>
                    </li>
                  </ol>
                  <p>
                    Exact finite coverage thresholds, capacity flow feasibility,
                    then successive shortest augmenting paths with residual
                    rerouting. Zero-demand nodes do not constrain the floor.
                  </p>
                </section>
                <section className="panel explanation-panel">
                  <span className="badge">MODEL SCOPE</span>
                  <h2>Good models state their limits.</h2>
                  <ul className="scope-list">
                    <li>
                      <Check size={17} />
                      Whole kits, one allocation round
                    </li>
                    <li>
                      <Check size={17} />
                      User-supplied stock, demand and capacities
                    </li>
                    <li>
                      <Check size={17} />
                      Independent direct routes, bounded inputs
                    </li>
                    <li>
                      <Check size={17} />
                      Deterministic results and downloadable audit
                    </li>
                    <li>
                      <X size={17} />
                      No truck scheduling or shared-road congestion
                    </li>
                    <li>
                      <X size={17} />
                      No medical priorities or real-time route safety
                    </li>
                    <li>
                      <X size={17} />
                      No real-world impact claims from sample data
                    </li>
                  </ul>
                  <p>
                    This maximizes the worst coverage fraction. It does not
                    recursively optimize the second-worst, third-worst, etc. It
                    is not a full lexicographic max-min fairness solver.
                  </p>
                </section>
              </div>
              <section className="panel explanation-panel wide">
                <span className="badge">WHY THIS PROBLEM</span>
                <h2>Disruption exposes allocation choices.</h2>
                <p>
                  The World Bank reported that Pakistan’s 2022 floods affected
                  33 million people. Humanitarian logistics research already
                  studies the tension between equity, delivery and transport
                  cost. RelayPlan translates that established research into a
                  small, inspectable planning exercise.
                </p>
                <div className="source-list">
                  <a
                    href="https://www.worldbank.org/en/news/press-release/2022/10/28/pakistan-flood-damages-and-economic-losses-over-usd-30-billion-and-reconstruction-needs-over-usd-16-billion-new-assessme"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    World Bank · Pakistan flood assessment, 2022
                    <ExternalLink size={14} />
                  </a>
                  <a
                    href="https://www.sciencedirect.com/science/article/pii/S1366554511000639"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Models for relief routing: equity, efficiency and efficacy
                    <ExternalLink size={14} />
                  </a>
                  <a
                    href="https://www.sciencedirect.com/science/article/pii/S0360835218305655"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Equitable last mile distribution in emergency response
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="small-copy">
                  The algorithm is established. Our contribution is the
                  privacy-first comparison, disruption and audit workflow.
                  Example communities, needs and roads are synthetic.
                </p>
              </section>
              <section className="panel explanation-panel wide">
                <span className="badge green">VERIFICATION</span>
                <h2>Checked against an independent oracle.</h2>
                <p>
                  The solver is checked against every feasible allocation in 200
                  seeded small networks and 100 irregular networks. Tests also
                  cover blocked routes, disconnected communities, zero supply,
                  zero demand, malformed import and CSV formula escaping. A
                  passing test suite verifies the bounded implementation, not
                  real-world suitability.
                </p>
                <button
                  className="button secondary"
                  onClick={() =>
                    download(
                      "relayplan-scenario.json",
                      JSON.stringify(s, null, 2),
                      "application/json",
                    )
                  }
                >
                  <ArrowDownToLine size={15} />
                  Download an example scenario
                </button>
              </section>
            </>
          )}
          <footer className="workspace-footer">
            <span>
              <ShieldCheck size={13} />
              Local computation · No account required
            </span>
            <span>
              RelayPlan · Planning simulation · Built for EurekaDev 2026
            </span>
          </footer>
        </main>
      </div>
      {route && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="route-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSelected(null);
            }}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close route editor"
              onClick={() => setSelected(null)}
            >
              <X size={20} />
            </button>
            <span className="badge">ROUTE INPUT</span>
            <h2 id="route-title">
              {s.depots.find((d) => d.id === route.from)?.name} →{" "}
              {s.communities.find((c) => c.id === route.to)?.name}
            </h2>
            <p>Changes update your plan immediately.</p>
            <label className="modal-field">
              Capacity per round (kits)
              <input
                type="number"
                min="0"
                max="500"
                value={route.capacity}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isInteger(v) && v >= 0 && v <= 500)
                    update((n) => {
                      n.routes.find((r) => r.id === selected)!.capacity = v;
                    });
                }}
              />
            </label>
            <label className="modal-field">
              Travel estimate (minutes)
              <input
                type="number"
                min="0"
                max="180"
                value={route.minutes}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isInteger(v) && v >= 0 && v <= 180)
                    update((n) => {
                      n.routes.find((r) => r.id === selected)!.minutes = v;
                    });
                }}
              />
            </label>
            <div className="switch-field">
              <div>
                <strong>Route blocked</strong>
                <p>Remove this route from the allocation.</p>
              </div>
              <button
                role="switch"
                aria-checked={route.blocked}
                aria-label="Route blocked"
                className={route.blocked ? "switch checked" : "switch"}
                onClick={() =>
                  update((n) => {
                    n.routes.find((r) => r.id === selected)!.blocked =
                      !route.blocked;
                  })
                }
              >
                <span />
              </button>
            </div>
            <button
              className="button primary full"
              onClick={() => setSelected(null)}
            >
              Done
              <Check size={15} />
            </button>
          </section>
        </div>
      )}
      {exportOpen && (
        <div className="modal-backdrop" onClick={() => setExportOpen(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setExportOpen(false);
            }}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close export menu"
              onClick={() => setExportOpen(false)}
            >
              <X size={20} />
            </button>
            <span className="badge green">TAKE THE EVIDENCE WITH YOU</span>
            <h2 id="export-title">Export your plan</h2>
            <p>Files are generated locally. Nothing is uploaded.</p>
            <button className="export-option" onClick={exportPlan}>
              <ShieldCheck size={21} />
              <div>
                <strong>Allocation audit · JSON</strong>
                <span>Inputs, fair plan, baseline and model scope</span>
              </div>
              <ArrowDownToLine size={17} />
            </button>
            <button
              className="export-option"
              onClick={() => {
                download("relayplan-allocation.csv", csv(s, p), "text/csv");
                setExportOpen(false);
                setNotice("Allocation CSV exported.");
              }}
            >
              <Layers3 size={21} />
              <div>
                <strong>Community allocation · CSV</strong>
                <span>Exact demand, allocated kits and coverage</span>
              </div>
              <ArrowDownToLine size={17} />
            </button>
            <button
              className="export-option"
              onClick={() => {
                download(
                  "relayplan-scenario.json",
                  JSON.stringify(s, null, 2),
                  "application/json",
                );
                setExportOpen(false);
                setNotice("Scenario exported for re-import.");
              }}
            >
              <Map size={21} />
              <div>
                <strong>Scenario · JSON</strong>
                <span>Re-import this scenario into RelayPlan</span>
              </div>
              <ArrowDownToLine size={17} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
function Metric({
  label,
  value,
  unit,
  detail,
  icon,
  accent,
  progress,
}: {
  label: string;
  value: string;
  unit?: string;
  detail: string;
  icon: React.ReactNode;
  accent?: boolean;
  progress?: number;
}) {
  return (
    <article className={accent ? "metric accent" : "metric"}>
      <div className="metric-top">
        <span>{label}</span>
        {icon}
      </div>
      <div className="metric-value">
        {value}
        <small>{unit}</small>
      </div>
      {progress !== undefined && (
        <div className="metric-progress">
          <span style={{ width: pct(progress) }} />
        </div>
      )}
      <p>
        {accent && <span className="tiny-dot" />}
        {detail}
      </p>
    </article>
  );
}
function AllocationTable({
  s,
  p,
  g,
  baselineLabel = "Nearest-first",
}: {
  s: Scenario;
  p: Plan;
  g?: Plan;
  baselineLabel?: string;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Community</th>
            <th>Demand</th>
            {g && <th>{baselineLabel}</th>}
            <th>Allocated</th>
            <th>Coverage</th>
            <th>Unmet need</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {s.communities.map((c, i) => (
            <tr key={c.id}>
              <td>
                <span className="community-icon">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <strong>{c.name}</strong>
              </td>
              <td>
                {c.demand} <small>kits</small>
              </td>
              {g && (
                <td>
                  {g.received[c.id]} <small>kits</small>
                </td>
              )}
              <td>
                <strong>{p.received[c.id]}</strong> <small>kits</small>
              </td>
              <td>
                <div className="coverage-cell">
                  <div className="coverage-track">
                    <span
                      style={{
                        width: pct(c.demand ? p.received[c.id] / c.demand : 1),
                      }}
                    />
                  </div>
                  <strong>
                    {c.demand ? pct(p.received[c.id] / c.demand) : "N/A"}
                  </strong>
                </div>
              </td>
              <td>
                {c.demand - p.received[c.id]} <small>kits</small>
              </td>
              <td>
                <span
                  className={
                    p.unreachable.includes(c.id) ? "badge amber" : "badge green"
                  }
                >
                  {!c.demand
                    ? "No demand"
                    : p.unreachable.includes(c.id)
                      ? "Unreachable"
                      : p.received[c.id] === c.demand
                        ? "Fully served"
                        : "Partial coverage"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
