---
name: batch-review
description: Review a batch of commits on this Reol fansite repo (e.g. a feature/batch-NN-* branch) for correctness, regressions, and adherence to this project's conventions. Use when asked to review recent work, a batch of fixes, or a set of commits before merge.
---

# Batch Review — !Legit (Reol fansite)

Use this skill to review a set of commits (typically a `feature/batch-*` branch vs `main`) that implements multiple bug fixes / UI changes / data changes in one pass. It encodes project-specific conventions that a generic reviewer would miss.

## Scope

Diff the current branch against `main` (`git diff main...HEAD` and `git log main..HEAD --oneline`) unless told to review a specific commit range. Review **every commit in the range**, not just the latest one.

## What to check

### 1. Correctness of each fix
For each commit, read the commit message's claimed fix and verify the diff actually does that — not just "looks plausible." If a commit claims to fix a bug, find the specific before/after behavior and confirm the new code addresses the root cause, not just a symptom.

### 2. Project-specific conventions (CLAUDE.md + memory)
- **Dark theme tokens**: UI colors should use the `bx-*` Tailwind tokens (`bx-bg`, `bx-ink`, `bx-ink2`, `bx-ink3`, `bx-line`, `bx-blue`, `bx-blueDeep`, `bx-blueLight`, `bx-yellow`) — not raw Tailwind grays/whites (`bg-white`, `text-gray-500`, etc.) which read as light-mode leftovers on this all-dark site. Flag any `bg-white`, `text-gray-*`, `border-gray-*` introduced outside of light-themed embeds that must stay light (e.g. official iframe embeds).
- **No unofficial media reproduction**: audio/video must stay official embeds or links only; photos must mask faces with emoji. Flag anything that looks like self-hosted copyrighted media.
- **Official links**: any hardcoded official social/YouTube handle must match `reol-official-links` conventions (e.g. official YouTube is `@reolch`) — flag guesses derived from oEmbed or unverified sources.
- **Gatsby SSG constraints**: this site is static-generated + GitHub Pages hosted, no SSR/server runtime. Flag any code assuming a request/response cycle, server-side session, or API route.
- **`gatsby-node.ts` data flow**: this file is the single source of truth for aggregated stats (song counts, live counts, performance counts). If a commit changes counting/aggregation logic, check whether the same logic is duplicated elsewhere (e.g. `createLiveNodes` vs `createSongStatsNodes` both independently resolve song matching) and whether both copies were updated consistently.
- **Song matching / dedup**: `src/utils/songMatcher.ts`'s `matchSongId` intentionally checks exact-match first; any change here has historically caused subtitle-variant duplicates (e.g. "楽曲名(Subtitle)" vs "楽曲名") to double-count. If a commit touches song matching/grouping, verify with a concrete before/after example from `static/data/songStats.json` or equivalent, not just code inspection.
- **Segment/MC exclusion**: setlist counts must exclude `type === "segment"` entries (MC, opening, etc.) from song counts — check any commit touching setlist counting still filters this.
- **Minimal diff philosophy**: per CLAUDE.md, changes should be scoped to the stated goal — flag unrelated refactors, added abstractions, or speculative future-proofing bundled into a fix commit.

### 3. Regenerated data artifacts
Commits often include regenerated files under `static/relive/generated/`, `static/data/*.json`, `static/og/`. For each:
- Confirm the diff is *plausibly caused by* a code change in the same commit (e.g. a matcher fix legitimately changes `trackId`/`matchSource` fields) — not an unrelated, unexplained mass rewrite.
- Be alert to `gatsby develop`/`gatsby build` incidentally refetching the Google Sheet and pulling in unrelated upstream data drift — this is expected background noise (see project memory `gatsby-develop-refetches-sheet-data`), not a regression, but flag it if it looks like it silently overwrote something the commit message doesn't mention.
- New generated files (e.g. `static/og/songs/*.png`) should be paired 1:1 with their `public/` mirror being gitignored (check `.gitignore` covers `public/*`), so only the `static/` copy should be committed.

### 4. Cross-commit consistency
Since work is often split into phase-based commits touching the same file more than once (e.g. `gatsby-node.ts`, `song.tsx`), verify the **final state** (after all commits in the range) is coherent — not just each commit in isolation. Look for: leftover dead code from an earlier phase that a later phase should have removed, duplicate handler logic that got merged into one but a stale copy remains, or state fields removed in one commit but still referenced in another.

### 5. Client-side state bugs (Redux / persistent components)
This site has a few globally-persistent components (`PersistentMainVideo`, header) that survive Gatsby client-side route changes without unmounting. Any change to their state logic should be checked for:
- Effects that re-arm on every render vs. once per mount (stale closures over scroll position / pathname).
- Redux state that should reset per-route but doesn't, or vice versa.
- `position: fixed` elements whose offset ignores the height of another fixed/sticky element (header overlap bugs).

### 6. Build verification
Confirm `npx tsc --noEmit` passes clean on the final commit in range. If it wasn't run, run it yourself before reporting.

## Output

Use `ReportFindings` if available. Otherwise report as a ranked markdown list, most severe first. For each finding: file, line (if applicable), the concrete failure scenario (not just "this could be an issue"), and which commit introduced it. If nothing survives verification, say so plainly — do not manufacture findings to look thorough.
