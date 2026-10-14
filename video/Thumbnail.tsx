import React from "react";
import { AbsoluteFill } from "remotion";
import { AppViewport } from "./Walkthrough";
export function Thumbnail() {
  return (
    <AbsoluteFill
      style={{
        background: "#143c35",
        color: "#f6f7f2",
        fontFamily: "Arial,sans-serif",
        padding: 70,
      }}
    >
      <div style={{ fontSize: 23, letterSpacing: 3, color: "#e3edb8" }}>
        EUREKADEV 2026 · CODING TRACK
      </div>
      <div style={{ position: "absolute", left: 70, top: 245, width: 590 }}>
        <div style={{ fontSize: 104, fontWeight: 750, letterSpacing: -5 }}>
          RelayPlan.
        </div>
        <div style={{ fontSize: 48, lineHeight: 1.22, marginTop: 30 }}>
          Every community
          <br />
          counts.
        </div>
        <p
          style={{
            fontSize: 26,
            lineHeight: 1.6,
            color: "#c7d7cb",
            marginTop: 28,
          }}
        >
          Allocate. Compare.
          <br />
          Stress-test. Export.
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          left: 735,
          top: 195,
          width: 695,
          height: 615,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 25px 65px #081e17aa",
          border: "5px solid #6c8b72",
          background: "#f6f7f2",
        }}
      >
        <div
          style={{
            width: 1500,
            height: 1330,
            scale: 0.465,
            transformOrigin: "top left",
          }}
        >
          <AppViewport state={{ view: "compare" }} width={1500} height={1330} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 115,
          left: 70,
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        <strong style={{ fontSize: 66, color: "#e3edb8" }}>0% → 60%</strong>
        <span style={{ fontSize: 23, lineHeight: 1.45 }}>
          Lowest community coverage
          <br />
          Same 180 kits · synthetic exercise
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 70,
          fontSize: 18,
          color: "#c7d7cb",
        }}
      >
        Browser-based relief allocation simulator · Problem in the Community
      </div>
    </AbsoluteFill>
  );
}
