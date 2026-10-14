import React from "react";
import { registerRoot, Composition, Still } from "remotion";
import { Walkthrough } from "./Walkthrough";
import { Gallery } from "./Gallery";
import { Thumbnail } from "./Thumbnail";
function Root() {
  return (
    <>
      <Composition
        id="RelayPlan"
        component={Walkthrough}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={3540}
      />
      <Still
        id="Gallery"
        component={Gallery}
        width={1500}
        height={1000}
        defaultProps={{ imageIndex: 0 }}
      />
      <Still id="Thumbnail" component={Thumbnail} width={1500} height={1000} />
    </>
  );
}
registerRoot(Root);
