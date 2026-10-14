import React from "react";
import { AbsoluteFill } from "remotion";
import { AppViewport } from "./Walkthrough";
import { SAMPLE, copyScenario } from "../src/engine";
import type { PresentationState } from "../src/App";
const changed = copyScenario(SAMPLE);
changed.depots[0].supply = 150;
const closure = copyScenario(SAMPLE);
closure.routes.find((r) => r.id === "s-o")!.blocked = true;
const shortage = copyScenario(SAMPLE);
shortage.depots[0].supply = 55;
shortage.depots[1].supply = 35;
const empty = copyScenario(SAMPLE);
empty.depots.forEach((d) => (d.supply = 0));
const isolated = copyScenario(SAMPLE);
isolated.routes
  .filter((r) => r.to === "orchard")
  .forEach((r) => (r.blocked = true));
const zeroDemand = copyScenario(SAMPLE);
zeroDemand.communities[0].demand = 0;
export const galleryItems: {
  title: string;
  caption: string;
  state: PresentationState;
  scroll: number;
}[] = [
  {
    title: "Exact allocations and unmet need",
    caption:
      "Community audit: 42, 36, 54 and 48 kits, with unmet demand visible for every fictional community.",
    state: {},
    scroll: 710,
  },
  {
    title: "Edit a route",
    caption:
      "Route editor: change capacity and estimated minutes, or exclude a blocked route. Values recalculate locally.",
    state: { selected: "s-o" },
    scroll: 790,
  },
  {
    title: "Apply a closure",
    caption:
      "Applied closure: South depot to Orchard is excluded. The planner exposes the revised 25% coverage floor.",
    state: { scenario: closure },
    scroll: 0,
  },
  {
    title: "A supply shortage exercise",
    caption:
      "Shortage preset: 55 kits at North and 35 at South. Results reflect the actual constrained synthetic scenario.",
    state: { scenario: shortage, preset: "scarcity" },
    scroll: 240,
  },
  {
    title: "Precise stock editing",
    caption:
      "Stock can be entered as a number or adjusted with the slider. This exercise increases North stock to 150 kits.",
    state: { scenario: changed },
    scroll: 240,
  },
  {
    title: "Zero supply stays visible",
    caption:
      "Zero-supply boundary: no kits can be delivered; positive-demand communities remain visible with zero coverage.",
    state: { scenario: empty },
    scroll: 0,
  },
  {
    title: "Do not hide unreachable communities",
    caption:
      "Both routes to Orchard are blocked. Its zero coverage stays in the minimum rather than being silently excluded.",
    state: { scenario: isolated },
    scroll: 900,
  },
  {
    title: "Zero demand is explicit",
    caption:
      "Riverbank has no demand in this test. Its coverage is N/A, while positive-demand communities constrain the floor.",
    state: { scenario: zeroDemand },
    scroll: 880,
  },
  {
    title: "Three objectives, in order",
    caption:
      "Method: maximize the worst demand coverage, preserve it while maximizing deliveries, then reduce transport effort.",
    state: { view: "method" },
    scroll: 0,
  },
  {
    title: "Research, verification and limits",
    caption:
      "Research sources, model limits and independent exhaustive verification are documented in the app and repository.",
    state: { view: "method" },
    scroll: 690,
  },
];
export function Gallery({ imageIndex = 0 }: { imageIndex: number }) {
  const item = galleryItems[imageIndex];
  return (
    <AbsoluteFill
      style={{ background: "#143c35", fontFamily: "Arial,sans-serif" }}
    >
      <div
        style={{
          height: 60,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#f6f7f2",
          fontSize: 23,
          fontWeight: 650,
        }}
      >
        <span>RelayPlan · {item.title}</span>
        <span style={{ color: "#e3edb8", fontSize: 13, letterSpacing: 2 }}>
          SYNTHETIC EXERCISE
        </span>
      </div>
      <div style={{ translate: "0px 60px", position: "absolute", top: 0 }}>
        <AppViewport
          state={item.state}
          scroll={item.scroll}
          width={1500}
          height={940}
        />
      </div>
    </AbsoluteFill>
  );
}
