# Opossum Foot — website demo (literal clone of build hj)

This package is the Opossum Foot app itself — a verbatim copy of the
production tree at **build hj (2026-11-19hj)** — fenced for the public
website. (First built from build hi on 2026-11-19; re-based onto hj
the same night after hj shipped — see "Verification".) It replaces the hand-assembled v1 demo (kept untouched at
`~/workspace/possum-foot-demo-v1/`), which Tanner ruled against on
2026-11-19: too many invented divergences. The rule for this package:
**the demo IS the app.** Every screen, control, list, picker, and flow
is the app's own code. If a behavior differs from the app and is not on
the fencing list below, it is a bug, not a design choice.

## Layout

- `index.html` — the landing page (v1's pitch structure and copy,
  lightly adapted — see "Forced copy adaptations"). Frames the app.
- `app.html` — the app's `index.html`, with two edits: the manifest
  link removed, and `js/demo-fence.js` loaded first.
- `js/demo-fence.js` — the fence. Seed, memory-only storage, in-memory
  IndexedDB, privacy fetch stubs, banner seeding, notch frame-fit.
- `js/app.js` — the app's code with the fenced edits below; every edit
  is commented `DEMO-CLONE FENCING` (9 markers; `grep` finds them all).
- Everything else (`css/`, `js/*`, `vendor/`, `assets/`) is byte-identical
  to production build hj. There is deliberately **no `sw.js`, no
  `manifest.json`, and no `data/`** in this package.

## The fencing (the ONLY deliberate departures from the app)

1. **Seed.** The demo opens on the v1 sample world, in the app's own
   store schema: the "Prairie County Sample Line" — 6 sets (Creek
   Crossing, Two-Track Crossing, Fence Line, Old Barn Corner, Willow
   Bend, North Gate) and 2 catches (Raccoon, Mink), on anonymous
   west-central Kansas ground. Dates are relative to the visitor's
   today, so the sample never goes stale. The county banner reads
   Prairie County: the demo's geocoder stub always resolves there and
   the fence makes the same `setCountyBanner` call the app makes on a
   GPS fix.
2. **No persistence.** State lives in page memory only. The fence
   replaces `localStorage`/`sessionStorage` with in-memory stores and
   IndexedDB with an in-memory fake (license photos and voice memos
   work during the visit and vanish with the page). No cookies. The
   service-worker registration and the GitHub-Pages self-update
   machinery (update banner, forced reload, version polling) are
   removed from the clone's `app.js`. The app's own "Erase everything"
   returns the sample world instead of a blank install. A visible
   **Reset the demo** button under the frame reloads the app, which
   restores the seed exactly.
3. **Visitor cap.** At most **3 visitor-added sets** (the 6 seed sets
   never count; deleting frees a slot; Reset zeroes it). Every set-
   creation path checks one counter: the New Set form, JSON import,
   line transfer, line clone, and pin import. At the cap the add flow
   stops with exactly: *"That's three sets of your own — the demo
   stops there. The full app carries your whole line."*
4. **Sponsors, no outbound links.** Pine Hollow and Kansas Trapline
   appear exactly as the app carries them (banner, product lists, bio
   sheets), but `url`/`urlLabel` are stripped from the demo's data
   copy itself, so the bio sheet's "Visit Website" button never
   renders. (Two kinds of links remain because the app itself carries
   them and they are not sponsor links: the forage/sign reference
   links in the app's catalog data, and the state-agency "Sources"
   links in Seasons rules. Map tiles and weather attribution are the
   services' own.)
5. **Find-me.** The app's crosshair works as the app's does, wired to
   visitor-initiated browser geolocation (never on load): a tap flies
   to the visitor with the app's own location marker and follow
   behavior; sets can be made and dragged there. Denial shows the
   app's own toasts and the visitor stays on the sample line. The
   landing page's About card states the privacy line: location stays
   in the visitor's browser, never sent, never stored — and the fence
   makes that true (see 6).
6. **Privacy fetch stubs.** The app's three outside services would
   otherwise send coordinates off-device: reverse geocoding
   (BigDataCloud/Nominatim), Open-Meteo weather, and the National
   Weather Service. In the demo all three are answered locally by the
   fence — geocoding always resolves to the fictional Prairie County,
   Kansas, and weather is fixed sample data (also seeded into the
   app's weather caches, so the chip and sheet paint with the app's
   own cached-weather behavior and zero network). A visitor's real
   coordinates are never transmitted. Map tiles load as images, as in
   the app.
7. **Page scroll, no furniture.** The landing page scrolls like an
   ordinary web page and **nothing floats over the map** — no shield,
   no "Done — scroll the page" pill (struck by Tanner by name). The
   mechanism is sizing alone: the phone frame is always shorter than
   the viewport (desktop: `min(830px, 118vw, 100vh − 40px)`; phones:
   `100vh − 130px`, min 520px), so page surface above/below the frame
   is always grabbable and the pitch, About card, Reset, and footer
   are reachable by ordinary scrolling.

## Forced copy adaptations (landing page)

V1's copy is kept verbatim except where the clone makes it false:

- About bullet "Seasons and Route are guided previews" — **removed**;
  in the clone they are the app's real screens.
- Step 3 "peek at the Seasons and Route previews" — now "Work the
  other tabs … the app's real screens."
- Lede now states plainly that this is the real app running in the
  browser. Everything else is v1's wording untouched, except the pin
  callout and step 1, whose copy Tanner replaced on 2026-11-19.
  Callout now: *"There's a faster way in. Tap the blue-and-white
  locate tab and a pin drops instantly at your GPS location — right
  where you're standing."* Closing line: *"That's the way the app
  works on your own ground, too. The app is coming soon — coming
  very soon."* (the coming-soon sentence is Tanner's 2026-11-19
  addition to the closing line). Step 1 now: "Drop the signature pin" /
  "Pick the signature Opossum Foot pin to drop a location on the
  map, then drag it exactly where you want it before you save. Up
  to three sets of your own in the demo."

## Verification

Verified side-by-side against the production app (same seed world
injected into both) at 390×844 plus desktop, after the hj re-base:
**Chromium 103/103 checks passed, 0 failed** — everything the hi
run covered (boot/map/banner/chip, control placement, Show pill,
set detail and sponsor bio open/close, the full add-set flow with
mouse and touch pin drags, edit-save landing, Log a Catch, check-in,
Seasons/Route/History/Totals, find-me granted and denied, the 3-set
cap with the exact message, Reset, landing-page scroll with zero
overlay elements, no-persistence proof) **plus hj's new picking
flow observed identically on both apps** (Pick sets rename, direct
entry with no prompt, per-status Select all, Select all shown +
Clear in the pick sheet, Actions split with the dim/inert bar
button) and hj's License Wallet predicate (trip/marker photos
excluded, licenses admitted).

**WebKit ran this time: 89 checks, 87 passed.** The only two
failures are the find-me-granted pair under emulated geolocation —
and a parity probe shows the production baseline behaves
*identically* under the same emulation (the app's converging-fix
acquire does not accept the bench's perfectly static fix stream in
WebKit; in Chromium it does). That is a bench limitation, not a
package difference: the clone's locate code is the app's own,
byte-identical. The fence's WebKit state was fully primary
(storage shadowed, IndexedDB faked — no fallback paths needed, no
IndexedDB errors). Full results and screenshots:
`~/workspace/goals/trap-set-catch-log-app/hidden_files/demo-clone-verification-2026-11-19/hj-rebase/`
(see RESULTS-HJ.md there; RESULTS.md in the parent folder documents
the original hi run).

Re-base mechanics, for the next one: the clone's `js/app.js` diffs
against production hj in **exactly 9 hunks — the 9 fencing edits**;
`app.html` diffs against production `index.html` in exactly the 2
documented edits; every other shared file is byte-identical. hj
forced **no functional fencing adaptation** — the fence script is
unchanged but for its header build stamp, and the cap still guards
the same five set-creation paths (recounted under hj).

**Not deployed.** This package waits for Tanner's review; the parent
agent shows him first. Lefty is not contacted from here.
