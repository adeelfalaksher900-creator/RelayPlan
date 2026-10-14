# RelayPlan website walkthrough

1920×1080, 30 fps, 118 seconds. This composition renders the actual React app, with deterministic scenario states, scrolling and a pointer. It is not a slide deck or a raw browser screen recording. Demonstrated actions are also verified on the deployed app.

Narration uses ElevenLabs stock Mark voice, generated using existing free credits. No team member was recorded or cloned. Captions follow provider alignment, with speech slowed to 0.8× without changing pitch. The script uses no invented user testimony or real-world outcome claim.

## Reproduce

Use Node 22/24 and `npm ci`. Current voice assets are included in the downloadable source archive, but generated audio/video binaries are excluded from Git. Use `npm run video:studio`, `npm run video:render`, or `npm run video:thumbnail`. Remotion may download its supported Chrome headless shell. `remotion.config.ts` points to `video/assets`.

Before rendering, run `npm run build` and copy its `dist/assets/index-*.css` to `video/assets/app.css` so the video uses the current product styling. `video/Walkthrough.tsx` controls timed views and synthetic inputs; `Gallery.tsx` defines ten 3:2 gallery views; `Thumbnail.tsx` defines the 1500×1000 cover. These templates remain editable.

In the managed Linux runtime used for the original render:

```sh
NODE_OPTIONS='--require ./video/runtime.cjs' npx remotion render video/index.tsx RelayPlan video/out/RelayPlan-1080p.mp4 --browser-executable=/path/to/chromium --concurrency=4 --codec=h264 --crf=24 --audio-codec=aac
```

The final video is hosted in the project’s own `/demo.html` player. This direct URL is a supplementary project link; Devpost’s required video field still needs a supported hosting-platform link.
