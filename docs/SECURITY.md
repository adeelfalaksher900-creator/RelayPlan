# Security scope and review

Reviewed 13 October 2026. RelayPlan is a static client application. There are no scenario APIs, accounts, tenant tables, server storage, Cloudflare bindings or authentication tokens. Therefore API authorization, IDOR and Cloudflare RLS controls are not applicable to this architecture. This is not a Cloudflare account audit.

## Implemented boundaries

- Scenario processing and file exports are local.
- JSON files are capped at 64 KB; array sizes, IDs, endpoints, integer limits and coordinates are validated before computation.
- Reserved prototype-related identifiers are rejected.
- Imported files are reconstructed from the documented schema; unknown fields are dropped so incidental private data cannot enter exports.
- Imported strings are rendered as React text, never inserted as HTML.
- No dynamic code evaluation, URL fetching, SQL or shell operations process scenario content.
- CSV cells quote embedded quotes and prefix spreadsheet formula-leading characters.
- Production CSP limits scripts to same-origin assets, blocks connections, forms, object content and framing. Inline style is permitted for React layout values. Other headers set nosniff, no-referrer and disable camera/microphone/geolocation.
- Dialogs trap keyboard focus and make the background inert. Reduced-motion preference is respected.
- Dependencies are locked. Production dependency audit reported 0 known vulnerabilities at the time of review. That does not prove absence of vulnerabilities.

## Coverage honesty

Pure-function negative tests cover malformed input, oversized import, invalid endpoints and CSV formula escaping. The public browser flow is reviewed separately. No Strix autonomous penetration scan was performed and no OWASP compliance certification is claimed. Server authentication/authorization, database encryption and Cloudflare tenant isolation are absent rather than tested.

Host configuration and static request logs remain controlled by Vercel. Scenario content is not sent to it by the app. Users should not treat this prototype as a validated dispatch or route-safety system.
