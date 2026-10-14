import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import App, { type PresentationState } from "../src/App";
import { SAMPLE, copyScenario } from "../src/engine";
import captions from "./walkthrough-captions.json";
import "./assets/app.css";

const closure = copyScenario(SAMPLE);
closure.routes.find((r) => r.id === "s-o")!.blocked = true;
const shortage = copyScenario(SAMPLE);
shortage.depots[0].supply = 55;
shortage.depots[1].supply = 35;
const changed = copyScenario(SAMPLE);
changed.depots[0].supply = 150;
const edited = copyScenario(SAMPLE);
edited.routes.find((r) => r.id === "s-o")!.capacity = 40;
const editedMinutes = copyScenario(edited);
editedMinutes.routes.find((r) => r.id === "s-o")!.minutes = 30;
const editedBlocked = copyScenario(editedMinutes);
editedBlocked.routes.find((r) => r.id === "s-o")!.blocked = true;

type Cue = {
  at: number;
  state: PresentationState;
  scroll: number;
  cursor: [number, number];
  click?: boolean;
  chapter: string;
};
export const cues: Cue[] = [
  {
    at: 0,
    state: {},
    scroll: 0,
    cursor: [870, 220],
    chapter: "The planning lab",
  },
  {
    at: 6.5,
    state: {},
    scroll: 235,
    cursor: [920, 410],
    chapter: "Two depots. Four communities. 180 kits.",
  },
  {
    at: 15.7,
    state: {},
    scroll: 0,
    cursor: [1110, 270],
    chapter: "Inspect the default allocation",
  },
  {
    at: 21.7,
    state: {},
    scroll: 700,
    cursor: [920, 530],
    chapter: "Exact kits and unmet need",
  },
  {
    at: 25.6,
    state: { view: "compare" },
    scroll: 0,
    cursor: [110, 326],
    click: true,
    chapter: "Compare strategies",
  },
  {
    at: 31.6,
    state: { view: "compare" },
    scroll: 445,
    cursor: [930, 520],
    chapter: "The same 180 kits",
  },
  {
    at: 34,
    state: { view: "compare" },
    scroll: 0,
    cursor: [1300, 510],
    chapter: "Keep the transport trade-off visible",
  },
  {
    at: 41.2,
    state: {},
    scroll: 330,
    cursor: [110, 277],
    click: true,
    chapter: "Edit depot stock",
  },
  {
    at: 43,
    state: {},
    scroll: 330,
    cursor: [1453, 288],
    click: true,
    chapter: "Enter an exact stock count",
  },
  {
    at: 44.3,
    state: { scenario: changed },
    scroll: 0,
    cursor: [1460, 540],
    chapter: "Recalculated locally",
  },
  {
    at: 46.8,
    state: { notice: "Demo reset." },
    scroll: 815,
    cursor: [1550, 35],
    click: true,
    chapter: "Restore the sample and edit a route",
  },
  {
    at: 48,
    state: {},
    scroll: 815,
    cursor: [1140, 542],
    click: true,
    chapter: "Open South depot → Orchard",
  },
  {
    at: 48.6,
    state: { selected: "s-o" },
    scroll: 815,
    cursor: [940, 333],
    chapter: "Route capacity and travel estimate",
  },
  {
    at: 50.2,
    state: { selected: "s-o", scenario: edited },
    scroll: 815,
    cursor: [860, 411],
    click: true,
    chapter: "Capacity: 80 → 40 kits",
  },
  {
    at: 51.2,
    state: { selected: "s-o", scenario: editedMinutes },
    scroll: 815,
    cursor: [860, 490],
    click: true,
    chapter: "Travel estimate: 38 → 30 minutes",
  },
  {
    at: 52.2,
    state: { selected: "s-o", scenario: editedBlocked },
    scroll: 815,
    cursor: [970, 558],
    click: true,
    chapter: "Block the route",
  },
  {
    at: 53.2,
    state: {},
    scroll: 0,
    cursor: [800, 633],
    click: true,
    chapter: "Restore before the closure exercise",
  },
  {
    at: 54.4,
    state: { view: "stress" },
    scroll: 0,
    cursor: [110, 373],
    click: true,
    chapter: "Preview a route closure",
  },
  {
    at: 58.8,
    state: { view: "stress" },
    scroll: 0,
    cursor: [1420, 365],
    chapter: "60% → 25% coverage floor",
  },
  {
    at: 63,
    state: { view: "stress" },
    scroll: 365,
    cursor: [1070, 510],
    chapter: "Preview before applying",
  },
  {
    at: 66.7,
    state: {
      scenario: closure,
      notice: "Closure applied to the current scenario.",
    },
    scroll: 0,
    cursor: [1460, 350],
    click: true,
    chapter: "Apply the closure",
  },
  {
    at: 69.2,
    state: { scenario: closure },
    scroll: 735,
    cursor: [1050, 570],
    chapter: "Inspect the revised allocations",
  },
  {
    at: 71.55,
    state: {
      scenario: shortage,
      preset: "scarcity",
      notice: "Scenario loaded.",
    },
    scroll: 280,
    cursor: [550, 239],
    click: true,
    chapter: "Try the shortage preset",
  },
  {
    at: 73.5,
    state: { notice: "Demo reset." },
    scroll: 0,
    cursor: [1550, 35],
    click: true,
    chapter: "Reset the exercise",
  },
  {
    at: 75.25,
    state: {},
    scroll: 0,
    cursor: [1350, 170],
    click: true,
    chapter: "Import reusable scenario JSON",
  },
  {
    at: 77.3,
    state: {
      preset: "custom",
      notice: "Scenario imported. Results recalculated locally.",
    },
    scroll: 0,
    cursor: [1320, 171],
    chapter: "A valid import preserves the same result",
  },
  {
    at: 79.1,
    state: {
      preset: "custom",
      notice: "Import failed: Expected a scenario object.",
    },
    scroll: 0,
    cursor: [1320, 171],
    chapter: "Reject invalid input; keep the current plan",
  },
  {
    at: 83.15,
    state: { exportOpen: true },
    scroll: 0,
    cursor: [1500, 170],
    click: true,
    chapter: "Export your evidence",
  },
  {
    at: 85.4,
    state: { notice: "Plan exported with scenario, results and model scope." },
    scroll: 0,
    cursor: [850, 399],
    click: true,
    chapter: "Allocation audit · JSON",
  },
  {
    at: 86.6,
    state: { exportOpen: true },
    scroll: 0,
    cursor: [1480, 170],
    click: true,
    chapter: "Community allocation · CSV",
  },
  {
    at: 88,
    state: { notice: "Allocation CSV exported." },
    scroll: 0,
    cursor: [860, 486],
    click: true,
    chapter: "Exact community counts",
  },
  {
    at: 89,
    state: { exportOpen: true },
    scroll: 0,
    cursor: [1480, 170],
    click: true,
    chapter: "Reusable scenario · JSON",
  },
  {
    at: 90.2,
    state: { notice: "Scenario exported for re-import." },
    scroll: 0,
    cursor: [860, 574],
    click: true,
    chapter: "Generated locally",
  },
  {
    at: 91.85,
    state: { view: "method" },
    scroll: 0,
    cursor: [110, 423],
    click: true,
    chapter: "How it works",
  },
  {
    at: 97.8,
    state: { view: "method" },
    scroll: 490,
    cursor: [910, 465],
    chapter: "Research and model limits",
  },
  {
    at: 100,
    state: { view: "method" },
    scroll: 950,
    cursor: [990, 475],
    chapter: "Independent solver verification",
  },
  {
    at: 103,
    state: { view: "method" },
    scroll: 0,
    cursor: [1360, 536],
    chapter: "Learning and tabletop planning",
  },
  {
    at: 108.3,
    state: {},
    scroll: 0,
    cursor: [110, 277],
    click: true,
    chapter: "Every shortfall stays visible",
  },
];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export function AppViewport({
  state = {},
  scroll = 0,
  width = 1600,
  height = 900,
}: {
  state?: PresentationState;
  scroll?: number;
  width?: number;
  height?: number;
}) {
  return (
    <div
      data-walkthrough
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        background: "#f6f7f2",
        color: "#20352f",
        fontFamily: "Inter,system-ui,sans-serif",
      }}
    >
      <style>{`[data-walkthrough] .skip-link{display:none}[data-walkthrough] .app{min-height:${height}px}[data-walkthrough] .sidebar{height:${height}px}[data-walkthrough] .main-shell{height:${height}px;overflow:hidden}[data-walkthrough] .topbar{position:relative;z-index:10}[data-walkthrough] main{translate:0 -${scroll}px}[data-walkthrough] *{animation:none!important;transition:none!important}`}</style>
      <App presentation={state} />
    </div>
  );
}
export function Walkthrough() {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = f / fps;
  const idx = Math.max(
      0,
      cues.findLastIndex((c) => t >= c.at),
    ),
    cue = cues[idx],
    previous = cues[Math.max(0, idx - 1)];
  const scroll = interpolate(
    t,
    [cue.at, cue.at + 0.65],
    [previous.scroll, cue.scroll],
    clamp,
  );
  const x = interpolate(
      t,
      [cue.at - 0.45, cue.at + 0.15],
      [previous.cursor[0], cue.cursor[0]],
      clamp,
    ),
    y = interpolate(
      t,
      [cue.at - 0.45, cue.at + 0.15],
      [previous.cursor[1], cue.cursor[1]],
      clamp,
    );
  const caption = captions.find((c) => t >= c.start && t < c.end);
  return (
    <AbsoluteFill style={{ background: "#143c35" }}>
      <div
        style={{
          position: "absolute",
          width: 1600,
          height: 900,
          scale: 1.2,
          transformOrigin: "top left",
        }}
      >
        <AppViewport state={cue.state} scroll={scroll} />
      </div>
      <div
        style={{
          position: "absolute",
          left: x * 1.2,
          top: y * 1.2,
          width: 30,
          height: 35,
          filter: "drop-shadow(0 2px 3px #0007)",
        }}
      >
        <svg width="30" height="35" viewBox="0 0 30 35">
          <path
            d="M3 2v27l8-7 6 11 5-3-6-10 11-1z"
            fill="#183e34"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>
      {cue.click && t < cue.at + 0.65 && (
        <div
          style={{
            position: "absolute",
            left: x * 1.2 - 22,
            top: y * 1.2 - 22,
            width: 60,
            height: 60,
            border: "3px solid #ae541e",
            borderRadius: "50%",
            scale: interpolate(t, [cue.at, cue.at + 0.65], [0.7, 1.5], clamp),
            opacity: interpolate(t, [cue.at, cue.at + 0.65], [0.8, 0], clamp),
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 15,
          right: 75,
          background: "#143c35",
          color: "#e3edb8",
          padding: "9px 15px",
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {cue.chapter}
      </div>
      {caption && (
        <div
          style={{
            position: "absolute",
            bottom: 26,
            left: 240,
            right: 120,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Arial,sans-serif",
              background: "#122b24f5",
              color: "white",
              fontSize: 28,
              padding: "12px 23px",
              borderRadius: 8,
              lineHeight: 1.35,
              textAlign: "center",
            }}
          >
            {caption.text}
          </div>
        </div>
      )}
      <Audio src={staticFile("walkthrough-voice.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
}
