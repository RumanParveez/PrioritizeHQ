# PrioritizeHQ — Feature Prioritization Scorer

> A web-based prioritization tool for enterprise PMs. Score features through three frameworks using a single 5-question flow. V2 adds an impartial AI auditor that checks your scoring against your own product context.

---

## Product vision

**Problem:** Enterprise PMs maintain prioritized feature lists but can't defend their rankings objectively. Frameworks like RICE/ICE exist but require inputs PMs don't naturally think in. AI tools exist but are sycophantic — they confirm whatever the PM already believes.

**Solution:** A tool that converts PM intuition (5 simple questions per feature) into three framework scores simultaneously, with a unified consensus view. In V2, an impartial AI auditor checks each score against the PM's own product context (customer feedback, OKRs, sales data) and flags where the evidence contradicts the PM's assessment.

**Core principle — the AI auditor is direct, not diplomatic.** It says "Impact is overstated — the data shows Medium, not High" rather than "you might want to consider adjusting." It cites sources for every claim. It flags missing evidence rather than guessing. It never proposes its own ranking — only audits the PM's.

**Target user:** Enterprise Product Manager managing 10-50 features per release, reporting to stakeholders (VP Eng, Head of Sales, Head of CS) who challenge prioritization decisions.

**Design philosophy:** This is a product, not a project. Every screen should feel like it belongs in a paid SaaS tool. Think Linear's density, Notion's clarity, Vercel's polish. Information-rich, zero decoration, every pixel earns its place. A PM should look at this and think "finally, someone built what I actually need."

---

## V1 scope (no AI — ship this first)

### Core user flow

```
Home → Create Release → Add Features (5 questions each) → Dashboard → Rankings → Reports → Export
```

---

## Screens — detailed specifications

### Screen 1: Home / Release list

**Purpose:** Landing page. Shows all releases. Sets the tone for the entire product.

**Layout:** Full-width page with centered content container (max-width 1200px).

**Top section — app header:**
- Logo (left): "PrioritizeHQ" in brand font. Subtle logomark (a stacked bar icon or abstract "P" mark).
- Right side: Settings gear icon (opens settings panel), keyboard shortcut hint ("?" icon).
- Below logo: One-line tagline — "Score features. See consensus. Ship what matters." in muted text. Shown only when 0 releases exist.

**Global stats bar (shown when ≥1 release exists):**
A horizontal strip with 3-4 summary stats across all releases:
- Total features scored (across all releases)
- Releases created
- Most common consensus signal (e.g., "67% Strong consensus")
- Last active release name + date

Style: compact, monospace numbers, muted labels. Background: subtle surface color. Think a status bar, not hero metrics.

**Release grid:**
- Card grid layout: `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`, gap 16px.
- Each release card:
  - Release name (16px, semibold)
  - Target date (if set) — relative format: "in 12 days" or "3 days ago"
  - Feature count badge: "14 features"
  - Status badge: Draft (grey), In Review (amber), Finalized (green)
  - Mini consensus bar: a thin horizontal stacked bar showing % Strong (green), % Mixed (amber), % Conflict (red) across all features in the release. At-a-glance release health without opening it.
  - Bottom row: "Last edited 2h ago" in muted text
  - Hover: subtle border highlight + "Open →" appears
  - Click: navigates to release workspace

**"New release" card:**
- Always last in grid
- Dashed border, "+" icon, "New release" label
- Click opens the New Release modal

**New Release modal:**
- Clean modal overlay with backdrop blur
- Fields:
  - Release name (text input, required, placeholder: "e.g., Q3 2026 Release 2")
  - Target date (date picker, optional)
  - Release capacity (number input: "How many features can you ship?", optional, default blank)
  - Description (textarea, optional, placeholder: "What's the goal of this release?")
- "Create release" primary button, "Cancel" secondary
- On submit: creates release, navigates to workspace

**Empty state (0 releases):**
- Centered illustration (abstract, geometric — not a cartoon)
- "No releases yet" heading
- "Create your first release and start scoring features" subtext
- Primary "Create release" button
- Below: "How it works" — 3-step horizontal explainer:
  1. "Add features" → 2. "Answer 5 questions each" → 3. "See unified rankings"
  Each step is a small card with an icon and one-liner.

**Keyboard shortcuts on this screen:**
- `N` — New release
- `1-9` — Open release by position
- `?` — Show shortcut overlay

---

### Screen 2: Release workspace

**Purpose:** The primary working environment. 80% of time spent here. Must feel like a cockpit — everything visible, nothing hidden behind clicks.

**Layout:** Fixed sidebar on left (240px) + main content area. The main content area has a top tab bar for switching between workspace views.

#### Left sidebar

**Sidebar header:**
- Back arrow + "PrioritizeHQ" logo link (returns to home)
- Release name (editable inline — click to rename)
- Release status badge (Draft / In Review / Finalized)

**Release meta section:**
- Target date (editable inline)
- Capacity: "Ship up to [N] features" — editable number. If not set, shows "Set capacity" link.
- Description: truncated to 2 lines, expandable

**Feature list:**
- Section header: "Features" + count badge + "Add" button (compact)
- Scrollable list of all features in this release
- Each feature item:
  - Feature name (truncated with ellipsis if long)
  - Mini score pill: shows highest framework rank (e.g., "#2")
  - Consensus dot (green/amber/red) — 8px circle
  - Hover: shows delete (×) icon on right
  - Click: selects the feature, scrolls the main area to show its detail
  - Active state: left border accent + background highlight
- Drag-and-drop reordering (for manual override — doesn't affect scores, just display order in sidebar)
- "Add feature" button at bottom of list (secondary style)

**Sidebar footer:**
- "Export" dropdown button → Markdown / CSV / JSON / Print-ready
- "Share" button → copies URL with encoded state
- "Finalize" button → locks release (confirmation dialog first)

#### Main content area — tab bar

Horizontal tab bar at top of main content. Four tabs:

```
[ Dashboard ]  [ Rankings ]  [ Add / Edit ]  [ Reports ]
```

Active tab has bottom border accent. Tab bar is sticky (stays visible on scroll).

---

### Screen 2A: Dashboard tab

**Purpose:** At-a-glance release health. The screen a PM opens before a planning meeting.

**Layout:** Metric cards row at top, then 2-column grid of charts below.

#### Metric cards row

4 cards in a horizontal row, equal width:

1. **Total features**
   - Large number (28px, monospace, bold)
   - Label: "Features scored"
   - Sub-stat: "+3 since last session" (if applicable)

2. **Average RICE score**
   - Large number
   - Label: "Avg RICE score"
   - Sub-stat: "Median: [X]" — because averages can be skewed
   - Color-coded: green if healthy, amber if median is far from mean (skewed)

3. **Release capacity utilization**
   - Large number as fraction: "8 / 12"
   - Label: "Capacity used"
   - Progress bar underneath (thin, 4px): green up to capacity, red if over
   - If no capacity set: shows "—" with "Set capacity" link

4. **Consensus health**
   - Tiny donut chart (48px diameter) showing Strong/Mixed/Conflict split
   - Label: "Consensus health"
   - Below donut: "X% agreement"

Card style: white background, 0.5px border, border-radius 12px, padding 20px 24px. Monospace for numbers, sans-serif for labels. No shadows.

#### Charts grid (2 columns)

**Chart 1 — Score distribution (left column, full height)**

Horizontal bar chart showing all features sorted by RICE score (switchable to ICE).

- Each bar = one feature
- Bar length = score magnitude
- Bar color = consensus color (green/amber/red)
- Feature name label on left
- Score value label on right end of bar
- Capacity cutoff: dashed horizontal line after Nth feature. Features below: 40% opacity.
- Toggle top-right: "Sort by: RICE / ICE"
- Answers: "what makes the cut and what doesn't?"

**Chart 2 — Priority matrix / effort-impact quadrant (right column, top half)**

2×2 scatter plot:
- X-axis: Effort (left = easy, right = hard) — from Q4
- Y-axis: Impact (bottom = low, top = high) — from Q2
- Each dot = one feature (labeled)
- Dot color = consensus color
- Dot size = RICE score (bigger = higher)
- Quadrant labels:
  - Top-left: "Quick wins" — green tint
  - Top-right: "Big bets" — blue tint
  - Bottom-left: "Fill-ins" — grey tint
  - Bottom-right: "Money pits" — red tint
- Hover tooltip: feature name + all scores
- Answers: "am I spending effort in the right places?"

**Chart 3 — Framework agreement heatmap (right column, bottom half)**

Compact matrix showing how each framework ranked each feature:

```
Feature          RICE   ICE   MoSCoW   Δ
─────────────────────────────────────────
SSO integration   #1     #2    Must     ✓
Bulk export       #3     #7    Could    ⚠
Dark mode         #5     #4    Should   ✓
API rate limits   #2     #8    Won't    ✗
```

- Cells color-intensity coded: darker = higher priority
- Δ column: ✓ green, ⚠ amber, ✗ red
- Rows sorted by consensus (conflicts rise to top)
- Answers: "where do my frameworks disagree?"

**Chart 4 — MoSCoW breakdown (below grid, full width, compact)**

Horizontal stacked bar: Must (green) / Should (blue) / Could (amber) / Won't (grey).
- Each segment shows count
- Below: "X must-haves consume Y% of capacity" — one-line insight
- Answers: "is my release scope realistic?"

---

### Screen 2B: Rankings tab

**Purpose:** THE core table. All features, all frameworks, one view. This is what the PM screenshots for the planning meeting.

**Layout:** Full-width data table with controls above.

#### Table controls bar

- **Sort selector:** Dropdown — "Sort by: Consensus / RICE score / ICE score / MoSCoW / Date added"
- **Filter:** Multi-select — "Filter: All / Must / Should / Could / Won't" + "Strong / Mixed / Conflict"
- **Search:** Text input — filters by name (instant, debounced)
- **View toggle:** "Compact / Comfortable" — compact reduces row height
- **Capacity toggle:** Checkbox — "Show capacity cutoff"

#### Unified rankings table

Table columns (left to right):

| # | Feature | Consensus | RICE | ICE | MoSCoW | Scope | Impact | Confidence | Effort | Actions |

Column details:

1. **#** — Rank number. Top 3 have styled badges (dark circles). Rest plain.

2. **Feature** — Name. Below in muted small text: date added. Click to expand detail.

3. **Consensus** — Badge:
   - "Strong" = green pill + checkmark
   - "Mixed" = amber pill + dash
   - "Conflict" = red pill + warning
   - Hover tooltip explains: "RICE ranks this #2, ICE ranks this #7. MoSCoW: Could have. Frameworks disagree."

4. **RICE** — Score (monospace). Below: rank "#3 of 14". Color: green (top quartile), amber (middle), muted (bottom).

5. **ICE** — Same as RICE.

6. **MoSCoW** — Category badge: "Must" (green), "Should" (blue), "Could" (amber), "Won't" (grey). Warning icon if inconsistency flagged.

7. **Scope** — Q1 answer compact: "All" / "Enterprise" / "Committed" / "Internal"

8. **Impact** — Q2 answer with colored dot

9. **Confidence** — Q3 as percentage: "100%" / "80%" / "50%" / "30%"

10. **Effort** — Q4 as T-shirt: "S" / "M" / "L" / "XL" / "XXL"

11. **Actions** — Edit (pencil), Duplicate (copy), Delete (trash). Visible on hover only.

**Table behaviors:**

- **Column sorting:** Click header to sort. Click again to reverse. Arrow indicator.
- **Row hover:** Subtle background. Actions appear.
- **Row expand:** Click feature name expands inline detail (see Feature Detail below).
- **Capacity cutoff:** Colored dashed horizontal rule between Nth and (N+1)th feature. Below: 50% opacity + "Below capacity" label on left margin. PM can drag line to adjust.
- **Multi-select:** Checkboxes (hidden by default, shown via "Select" button). Bulk MoSCoW move, bulk delete, bulk export.
- **Sticky header:** Header row sticky on scroll. Fixed column widths.
- **Row animation:** Add = 200ms slide-in. Delete = 150ms collapse. Re-sort = 200ms stagger.

#### Expandable feature detail (inline)

When a row is expanded, a detail panel opens below it:

**Left section — score breakdown (60% width):**

Three columns, one per framework:

```
RICE                          ICE                         MoSCoW
─────────────────────         ─────────────────────       ─────────────────
Reach    5,000 × 0.6 = 3,000 Impact     7 + 1 = 8       Category: Should have
Impact   High (2)             Confidence 8               Reason: Strategic differentiator
Confidence 80%                Ease       7
Effort   2 mo                 ──────────                 Inconsistencies: None
──────────                    Score: 448
Score: 2,400
```

Each line shows raw input → mapping → value. Click "Edit" to go to question flow.

**Right section — quick context (40% width):**

- Score thermometer: vertical bar showing position relative to all features.
- "vs. average" comparison:
  - "RICE: 2,400 (avg: 1,800) — above average"
  - "ICE: 448 (avg: 320) — above average"
  - "MoSCoW: Should (most common: Could)"
- **V2 placeholder:** Greyed card with lock icon: "AI Audit — available in Pro. Upload product context to get evidence-based scoring audit."

---

### Screen 2C: Add / Edit tab

**Purpose:** Feature creation and scoring. Must be fast — 15 features in 5-10 minutes.

**Layout:** Split — left is the input form (50%), right is live-updating scored feature queue (50%).

#### Left side — Feature input form

**Feature name field:**
- Large text input (18px font)
- Placeholder: "What feature are you scoring?"
- Auto-focus when tab opened

**Question flow — all 5 questions visible at once (not a wizard, not accordion):**

**Q1: Customer scope**
- Label: "Who does this impact?"
- Input: Radio pills (horizontal): `[ All accounts ] [ Enterprise ] [ Committed accounts ] [ Internal ]`
- Optional sub-field: "Estimated users/accounts affected" — number input, small.

**Q2: Value delivered**
- Label: "How much does this improve their workflow?"
- Input: 5-option radio (vertical card rows, each with intensity bar):
  - "Transformative — changes how they work" (5 bars)
  - "Significant — removes a major pain point" (4 bars)
  - "Moderate — noticeable improvement" (3 bars)
  - "Minor — quality of life" (2 bars)
  - "Negligible — barely noticeable" (1 bar)
- Each option highlights on hover with intensity tint

**Q3: Confidence level**
- Label: "How sure are you this is right?"
- Input: 4-option radio pills: `[ Validated 100% ] [ Strong hunch 80% ] [ Guess 50% ] [ Speculative 30% ]`

**Q4: Build complexity**
- Label: "How hard is this to ship?"
- Input: 5-option radio pills with T-shirt sizes:
  `[ S — days ] [ M — weeks ] [ L — 1-2mo ] [ XL — quarter ] [ XXL — multi-Q ]`

**Q5: Strategic necessity**
- Label: "Why does this need to exist?"
- Input: 6-option radio (vertical list with icons):
  - "Customer commitment — promised contractually" (lock icon)
  - "Competitive table stakes — losing deals" (bolt icon)
  - "Strategic differentiator — our angle" (target icon)
  - "User-requested — nice to have" (chat icon)
  - "Speculative bet — unvalidated" (sparkles icon)
  - "Internal initiative — not customer facing" (home icon)
- Icons: monochrome SVG from lucide-react, not emoji.

**Live score preview (below questions):**
As PM fills answers, scores update real-time:
```
┌─────────────────────────────────────────┐
│  RICE: 2,400       ICE: 448            │
│  MoSCoW: Should have                   │
│  Consensus: Strong ✓                   │
└─────────────────────────────────────────┘
```
Numbers animate on change (brief count-up effect).

**Action buttons:**
- "Add feature" primary button (large)
- "Add & continue" secondary — adds and resets form for next feature
- "Clear" tertiary — resets form
- Keyboard: `Cmd+Enter` to add (shown as hint)

**Edit mode:** Form pre-populated with existing data. "Add" becomes "Save changes". "Cancel" link appears.

#### Right side — live feature queue

Compact list of all scored features, updating live:

- Each feature as compact card:
  - Feature name (bold)
  - Score pills: `RICE: 2,400` `ICE: 448` `MoSCoW: Should`
  - Consensus badge
  - Edit and Delete icons
- Sorted by RICE (default)
- New features animate in at sorted position
- Immediate feedback on how the new feature ranks

**Bulk add mode:**
- Toggle above form: "Rapid mode"
- Feature name becomes multi-line textarea (one name per line)
- Simplified 5 questions: "Apply same answers to all"
- "Add all" button for batch entry
- Use case: PM paste 10 features from Jira, same tier, then fine-tune individually

---

### Screen 2D: Reports tab

**Purpose:** Stakeholder-ready output. Must look polished enough to screenshot and paste into a slide deck.

**Layout:** Full-width, print-optimized. Report sections stacked vertically.

#### Report header

```
┌──────────────────────────────────────────────────────┐
│  PrioritizeHQ                                        │
│                                                      │
│  RELEASE PRIORITIZATION REPORT                       │
│  Release: Q3 2026 Platform Update                    │
│  Date: April 28, 2026                                │
│  Features scored: 14  |  Capacity: 8 features        │
└──────────────────────────────────────────────────────┘
```

Clean document header. Professional typography.

#### Section 1 — Executive summary (auto-generated, template-based, no AI)

Dynamic text block generated from data:

> "This release contains 14 scored features across 4 MoSCoW categories. 8 features fit within the stated capacity of 8 slots. Consensus is strong on 9 features (64%) with 3 features showing framework disagreement that may warrant discussion. The top-ranked feature by RICE is [Feature Name] (score: [X]), driven by broad customer scope and high validated confidence."

Saves 10 minutes of summary writing. Deterministic — no hallucination.

#### Section 2 — Recommended scope ("what ships" list)

Numbered feature list split at capacity line:

```
RECOMMENDED FOR THIS RELEASE (8 of 14)
═══════════════════════════════════════

 1. SSO Integration          RICE: 3,200  │  ICE: 560  │  Must     │  ✓ Strong
 2. Bulk CSV Export           RICE: 2,400  │  ICE: 448  │  Should   │  ✓ Strong
 3. API Rate Limiting         RICE: 2,100  │  ICE: 392  │  Must     │  ✓ Strong
 ...

─────────────── capacity cutoff ───────────────

 9. Dark Mode                 RICE: 980   │  ICE: 280  │  Could    │  ⚠ Mixed
10. Custom Webhooks           RICE: 870   │  ICE: 224  │  Could    │  ✓ Strong
```

Above line: full opacity, clear "ship this" framing.
Below line: muted, "defer" framing.

Warning callout if any "Must have" falls below capacity: "⚠ [Feature] is Must have but below capacity. Review capacity or re-score."

#### Section 3 — Framework comparison

Full unified table formatted for export/print. No action buttons, no hover states. Clean borders, alternating row tints.

#### Section 4 — Conflict analysis

Only features where frameworks disagree:

```
┌──────────────────────────────────────────────────────┐
│  ⚠ CONFLICT: Bulk CSV Export                         │
│                                                      │
│  RICE ranks this #3 (score: 2,400)                   │
│  ICE ranks this #7 (score: 192)                      │
│  MoSCoW: Could have                                  │
│                                                      │
│  WHY: RICE scores high due to broad reach (all       │
│  accounts). ICE scores low because confidence is     │
│  only 50% and ease is low. MoSCoW flags "Could       │
│  have" because it's user-requested, not committed.   │
│                                                      │
│  DISCUSSION PROMPT: Does the team have data to       │
│  increase confidence? If validated, this moves up.   │
│  If speculative, ICE and MoSCoW are probably right.  │
└──────────────────────────────────────────────────────┘
```

Template-generated explanations from scoring inputs. Reads like an analyst wrote it.

#### Section 5 — Visualizations

Dashboard charts formatted for print: priority matrix, score distribution, MoSCoW breakdown, consensus donut.

#### Section 6 — Appendix: raw scoring data

Complete table of every feature with all 5 question answers and all derived scores.

#### Report actions

- **Export as PDF** — browser print stylesheet. `@media print` rules. Clean page breaks.
- **Export as Markdown** — full report as `.md`. Copy or download.
- **Export as CSV** — raw data table only.
- **Export as JSON** — full release data structure.
- **Print** — `window.print()` with print stylesheet.
- **Copy report link** — URL-encoded state. Read-only shareable view.

---

## Feature detail — slide-over panel

When clicking a feature anywhere (sidebar, table, chart dot), a slide-over panel opens from the right (400px wide, full height, backdrop overlay).

**Header:**
- Feature name (large, editable inline)
- Consensus badge + MoSCoW badge
- Close (×) and "Edit" buttons

**Score summary cards:**
Three horizontal cards: RICE (score + rank + mini bar), ICE (same), MoSCoW (badge)

**Score breakdown accordion:**
Expandable sections per framework showing full derivation math.

**Input summary:**
```
Customer scope:     Enterprise segment
Value delivered:    Significant
Confidence:         Strong hunch (80%)
Build complexity:   Medium (1-2 months)
Strategic necessity: Competitive table stakes
```

**Score context:**
- Mini histogram showing all features, this one highlighted
- "vs. average" comparison stats

**Activity log (V1.1+):**
- "Score changed from X to Y on [date]"
- "Originally added on [date]"

**V2 placeholder:**
- Greyed card with lock icon: "AI Audit — available in Pro"
- Brief explanation of what it does

**Bottom actions:**
- Edit scoring → navigates to Add/Edit with feature loaded
- Duplicate → copy with "(copy)" suffix
- Delete → confirmation dialog
- Move to release → dropdown (if multiple releases exist)

---

## Design system

### Brand identity

- **Name:** PrioritizeHQ
- **Wordmark:** "Prioritize" in sans regular + "HQ" in mono bold. Different visual weight.
- **Logomark:** Three lines converging to one point (three frameworks → one decision). Works at 16px favicon.

### Typography

**Primary font (body, UI, feature names):**
Use a distinctive sans-serif. NOT Inter, Roboto, Arial, or system fonts. Choices:
- **Plus Jakarta Sans** (Google Fonts) — warm, professional, geometric
- **Outfit** (Google Fonts) — clean, modern, rounded
- Pick ONE. Load weights 400 (regular), 500 (medium), 600 (semibold).

**Mono font (scores, data, labels, framework names):**
- **JetBrains Mono** (Google Fonts) — excellent data display, legible small
- Load weights 400 and 500.

**Type scale:**
```
Page title:      24px / 600 / sans
Section heading: 18px / 600 / sans
Card title:      16px / 500 / sans
Body text:       14px / 400 / sans
Small label:     12px / 500 / sans / uppercase / letter-spacing 0.06em
Tiny label:      10px / 500 / mono / uppercase / letter-spacing 0.08em
Score large:     28px / 500 / mono
Score medium:    20px / 500 / mono
Score small:     14px / 400 / mono
```

### Color system

**Base palette:**
```
--bg-primary:     #FFFFFF     (cards, main content)
--bg-secondary:   #F7F7F5     (sidebar, secondary surfaces)
--bg-tertiary:    #EDEDED     (hover states, metric cards)
--bg-workspace:   #FAFAF9     (page background)
--bg-dark:        #09090B     (header, dark sidebar)

--text-primary:   #1A1A1A     (headings, primary content)
--text-secondary: #6B6B6B     (descriptions, labels)
--text-tertiary:  #A0A0A0     (hints, placeholders)
--text-inverse:   #F5F5F5     (text on dark backgrounds)

--border-default: rgba(0,0,0,0.08)
--border-strong:  rgba(0,0,0,0.15)
--border-accent:  rgba(0,0,0,0.25)
```

**Semantic palette:**
```
Consensus:
  --color-strong:      #16A34A  / bg: #DCFCE7
  --color-mixed:       #D97706  / bg: #FEF3C7
  --color-conflict:    #DC2626  / bg: #FEE2E2

Frameworks (subtle accents):
  --color-rice:        #3B82F6  / bg: #EFF6FF
  --color-ice:         #0EA5E9  / bg: #F0F9FF
  --color-moscow:      #8B5CF6  / bg: #F5F3FF

MoSCoW categories:
  --color-must:        #16A34A  / bg: #DCFCE7
  --color-should:      #2563EB  / bg: #DBEAFE
  --color-could:       #D97706  / bg: #FEF3C7
  --color-wont:        #71717A  / bg: #F4F4F5

Interactive:
  --color-accent:      #18181B
  --color-accent-hover:#27272A
```

### Spacing system
```
4px   — tight (icon gaps, badge padding)
8px   — compact (between related elements)
12px  — default (form fields, table cells)
16px  — comfortable (between cards)
24px  — spacious (section padding, card padding)
32px  — major (between page sections)
48px  — page (top/bottom margins)
```

### Component tokens
```
Cards:         12px radius, 0.5px border --border-default, 20px 24px padding, --bg-primary
Badges/pills:  20px radius (full pill), 4px 12px padding, 12px/500 font, no border
Buttons primary: --color-accent bg, --text-inverse color, 8px radius, 10px 20px padding, 14px/500
Buttons secondary: transparent bg, 0.5px --border-strong, --text-secondary, 8px radius
Inputs:        40px height, 0.5px --border-strong, 8px radius, 12px horizontal padding, 14px font
               Focus: border --color-accent + box-shadow 0 0 0 3px rgba(0,0,0,0.06)
Tables:        Header: 11px uppercase mono 500 --text-tertiary
               Row: 48px (comfortable) or 36px (compact)
               Hover: --bg-secondary background
               Borders: 0.5px --border-default between rows only (no vertical, no outer)
               Sticky header with bottom border
```

### Motion

Minimal and purposeful. No decoration.

```
Row sort:          200ms ease-out
Row add:           200ms ease-out (slide + fade)
Row delete:        150ms ease-out (collapse + fade)
Panel slide-over:  250ms ease-out (from right)
Panel close:       200ms ease-in
Score change:      300ms (count-up animation)
Tab switch:        150ms crossfade
Modal overlay:     200ms fade
Capacity drag:     Realtime
Chart transitions: 300ms ease-out
Tooltip show:      100ms delay, 150ms fade-in
Tooltip hide:      100ms fade-out
```

**No:** loading spinners (local ops are instant), bouncing/pulsing, page slides, parallax, scroll-triggered animations.

### Responsive breakpoints

```
Desktop (≥1024px):  full sidebar + main content
Tablet (768-1023):  sidebar collapses to icon-only (expand on hover/click)
Mobile (<768px):    sidebar hidden (hamburger), table → card layout, charts stack vertically
```

Mobile adaptations: table becomes card list, charts full-width stacked, slide-over becomes full-screen, export options become bottom sheet.

---

## Keyboard shortcuts

```
Global:
  ?             Show keyboard shortcuts overlay
  N             New release (home) / New feature (workspace)
  Cmd+Enter     Submit current form
  Escape        Close modal/panel/overlay
  Cmd+E         Export menu

Workspace:
  1             Dashboard tab
  2             Rankings tab
  3             Add/Edit tab
  4             Reports tab

Rankings table:
  J / ↓         Next feature
  K / ↑         Previous feature
  Enter         Expand/collapse selected feature
  E             Edit selected feature
  D             Duplicate selected feature
  Backspace     Delete (with confirmation)

Feature form:
  Tab           Next question
  Shift+Tab     Previous question
  1-5           Select option by number
```

---

## Empty states, loading states, edge states

### Empty states

- **Home, 0 releases:** Illustration + "Create your first release" CTA + 3-step explainer
- **Workspace, 0 features:** Illustration + "Add your first feature" CTA + "~30 seconds per feature" + sample suggestion: "Try 'SSO Integration' to see how it works"
- **Dashboard, 0 features:** Charts show dashed borders + "Add features to see your dashboard"
- **Rankings, 0 features:** Table header, no rows. "Your prioritized features will appear here."
- **Reports, 0 features:** "Nothing to report yet. Score at least 2 features."
- **Reports, 1 feature:** "Add one more. Prioritization needs comparison."
- **Conflict analysis, 0 conflicts:** Green checkmark + "No conflicts. All frameworks agree."

### Edge states

- **Capacity not set:** Show "Set capacity" inline link wherever capacity is referenced
- **All same score:** Consensus = "Strong" for all. Tied ranks. Note: "All scored identically — consider differentiating inputs."
- **Only 1 feature:** Consensus shows "—" (needs ≥2 for quartile). Hide quartile-dependent charts.
- **Name > 60 chars:** Truncate with ellipsis in table/sidebar. Full in detail panel + hover tooltip.
- **Score outlier (>5× median):** Subtle flag in detail: "This score is significantly higher than the rest. Double-check inputs."

### Data persistence

- Save to localStorage on every change (debounced 500ms)
- On load: hydrate from localStorage. If data exists, go to last-viewed release. If none, show home.
- Storage full: toast "Storage full. Export data and clear old releases."
- Settings panel: "Export all data" (JSON download) + "Import data" (JSON upload)

---

## Question design (the 5-question flow)

### Q1: Customer scope — "Who does this impact?"

| Answer | RICE Reach multiplier | ICE Impact modifier | MoSCoW signal |
|--------|----------------------|--------------------|-|
| All accounts | 1.0 (full base) | +2 | — |
| Enterprise segment | 0.6 | +1 | — |
| Specific committed accounts | 0.2 | 0 | leans Must if commitment |
| Internal / operational | 0.1 | -1 | leans Could |

Optional: estimated accounts/users (for RICE precision).

### Q2: Value delivered — "How meaningfully does this improve their workflow?"

| Answer | RICE Impact | ICE Impact |
|--------|------------|------------|
| Transformative | 3 (Massive) | 9-10 |
| Significant | 2 (High) | 7-8 |
| Moderate | 1 (Medium) | 5-6 |
| Minor | 0.5 (Low) | 3-4 |
| Negligible | 0.25 (Minimal) | 1-2 |

### Q3: Confidence — "How confident are you this is right?"

| Answer | RICE Confidence | ICE Confidence |
|--------|----------------|----------------|
| Validated (data/customer confirmation) | 100% | 9-10 |
| Strong hunch (pattern-based) | 80% | 7-8 |
| Educated guess (unvalidated) | 50% | 4-6 |
| Speculative (gut feel) | 30% | 1-3 |

### Q4: Build complexity — "How hard is this to ship?"

| Answer | RICE Effort (person-months) | ICE Ease |
|--------|----|------|
| Trivial (days, one dev) | 0.5 | 9-10 |
| Small (1-2 weeks) | 1 | 7-8 |
| Medium (1-2 months) | 2 | 5-6 |
| Large (quarter, cross-team) | 4 | 3-4 |
| Massive (multi-quarter) | 8 | 1-2 |

### Q5: Strategic necessity — "Why does this need to exist?"

| Answer | MoSCoW | Consensus weight |
|--------|--------|-----------------|
| Customer commitment (contractual) | Must | +2 |
| Competitive table stakes | Must | +1 |
| Strategic differentiator | Should | 0 |
| User-requested improvement | Could | 0 |
| Speculative bet | Could | -1 |
| Internal initiative | Won't (this release) | -1 |

---

## Score derivation logic

### RICE
```
reach = (user_input OR default_base) × Q1_scope_multiplier
impact = Q2_mapping
confidence = Q3_mapping
effort = Q4_mapping

RICE = (reach × impact × (confidence / 100)) / effort
```

### ICE
```
impact = clamp(Q2_mapping + Q1_modifier, 1, 10)
confidence = Q3_mapping
ease = Q4_mapping

ICE = impact × confidence × ease
```

### MoSCoW
```
Primary: Q5_mapping
Flag if: Q1 = "Committed accounts" AND Q5 ≠ "Customer commitment"
Flag if: Q3 = "Speculative" AND Q5 = "Must have"
```

### Consensus
```
Normalize RICE and ICE to quartile ranks (1=top, 4=bottom)
moscow_weight = Must(1), Should(2), Could(3), Won't(4)

All within 1 quartile → "Strong" (green)
Max spread = 2 → "Mixed" (amber)
Max spread ≥ 3 → "Conflict" (red)
```

---

## Tech stack

### Vite + React + TypeScript

- **Vite + React** — fast dev, fast builds, deploys anywhere (Vercel, Netlify, Cloudflare Pages, GitHub Pages)
- **TypeScript** — non-negotiable for score calculations. Type safety prevents bugs.
- **No backend V1** — all client-side. localStorage. Zero cost.
- **V2 adds thin API** — Express/Hono or Next.js API routes. Only proxies Anthropic API calls.

### Dependencies

```
Core:        react 19+, react-dom, react-router, typescript, vite
Styling:     tailwindcss 4, @tailwindcss/vite
State:       zustand, immer (middleware)
Charts:      recharts (bar, scatter, donut, stacked bar)
Icons:       lucide-react (tree-shakeable, clean, consistent)
Utilities:   nanoid, date-fns, clsx
Export:      Native Clipboard + Blob APIs

V2 (later):  @anthropic-ai/sdk, react-dropzone, pdfjs-dist, react-markdown
```

### Project structure

```
prioritize-hq/
├── public/
│   ├── favicon.svg
│   └── og-image.png
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── WorkspaceSidebar.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── KeyboardShortcuts.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── ReleaseCard.tsx
│   │   │   ├── ReleaseGrid.tsx
│   │   │   ├── NewReleaseModal.tsx
│   │   │   ├── GlobalStatsBar.tsx
│   │   │   └── EmptyHome.tsx
│   │   │
│   │   ├── workspace/
│   │   │   ├── WorkspaceLayout.tsx
│   │   │   ├── TabBar.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardView.tsx
│   │   │   │   ├── MetricCards.tsx
│   │   │   │   ├── ScoreDistributionChart.tsx
│   │   │   │   ├── PriorityMatrix.tsx
│   │   │   │   ├── FrameworkHeatmap.tsx
│   │   │   │   └── MoscowBreakdown.tsx
│   │   │   │
│   │   │   ├── rankings/
│   │   │   │   ├── RankingsView.tsx
│   │   │   │   ├── TableControls.tsx
│   │   │   │   ├── UnifiedTable.tsx
│   │   │   │   ├── FeatureRow.tsx
│   │   │   │   ├── FeatureRowExpanded.tsx
│   │   │   │   ├── CapacityCutoff.tsx
│   │   │   │   ├── ConsensusTag.tsx
│   │   │   │   └── RankBadge.tsx
│   │   │   │
│   │   │   ├── add-edit/
│   │   │   │   ├── AddEditView.tsx
│   │   │   │   ├── QuestionFlow.tsx
│   │   │   │   ├── QuestionCard.tsx
│   │   │   │   ├── LiveScorePreview.tsx
│   │   │   │   ├── FeatureQueue.tsx
│   │   │   │   └── BulkAddMode.tsx
│   │   │   │
│   │   │   └── reports/
│   │   │       ├── ReportsView.tsx
│   │   │       ├── ReportHeader.tsx
│   │   │       ├── ExecutiveSummary.tsx
│   │   │       ├── RecommendedScope.tsx
│   │   │       ├── ConflictAnalysis.tsx
│   │   │       ├── ReportCharts.tsx
│   │   │       ├── RawDataAppendix.tsx
│   │   │       └── ExportActions.tsx
│   │   │
│   │   ├── shared/
│   │   │   ├── FeatureDetailPanel.tsx
│   │   │   ├── ScoreBreakdown.tsx
│   │   │   ├── ScoreThermometer.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   └── ai/                          # V2 — stubbed in V1
│   │       ├── AuditPanel.tsx
│   │       ├── ContextUpload.tsx
│   │       ├── AuditReport.tsx
│   │       ├── ConflictReport.tsx
│   │       └── ProPlaceholder.tsx
│   │
│   ├── engine/                          # Pure TS, no React — fully testable
│   │   ├── scoring.ts
│   │   ├── consensus.ts
│   │   ├── mappings.ts
│   │   ├── report.ts                    # Template-based report generation
│   │   ├── conflicts.ts                 # Template-based conflict analysis
│   │   └── types.ts
│   │
│   ├── services/
│   │   ├── storage.ts                   # V1: localStorage. V2: API.
│   │   ├── export.ts                    # MD, CSV, JSON generators
│   │   └── ai.ts                        # Stubbed. V2: Anthropic SDK.
│   │
│   ├── store/
│   │   ├── releaseStore.ts
│   │   ├── featureStore.ts
│   │   ├── uiStore.ts                   # Active tab, selected feature, modals
│   │   └── settingsStore.ts
│   │
│   ├── hooks/
│   │   ├── useScoring.ts
│   │   ├── useConsensus.ts
│   │   ├── useExport.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useAutoSave.ts
│   │
│   └── styles/
│       ├── globals.css                  # Tailwind base + design tokens
│       └── print.css                    # Print-specific for reports
│
├── tests/
│   ├── engine/
│   │   ├── scoring.test.ts
│   │   ├── consensus.test.ts
│   │   ├── mappings.test.ts
│   │   ├── report.test.ts
│   │   └── conflicts.test.ts
│   └── components/ ...
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── PROJECT.md
└── README.md
```

### Architecture decisions

**1. Engine is pure TypeScript.**
`src/engine/` = pure functions, no React, no state. Unit-testable without DOM. Same engine runs server-side in V2.

**2. Services layer abstracts storage.**
```typescript
interface StorageService {
  saveRelease(release: Release): Promise<void>
  getRelease(id: string): Promise<Release | null>
  listReleases(): Promise<ReleaseSummary[]>
  deleteRelease(id: string): Promise<void>
}
```
V1: localStorage. V2: API client. Components never know.

**3. AI service stubbed from day 1.**
```typescript
interface AIService {
  auditFeature(feature: Feature, context: ProductContext): Promise<AuditResult | null>
  auditRelease(features: Feature[], context: ProductContext): Promise<ReleaseAudit | null>
  checkConflicts(features: Feature[], context: ProductContext): Promise<ConflictReport | null>
}
```
V1 returns null. UI checks `if (result)` to show/hide. No feature flags.

**4. Reports are template-based.**
Executive summary, conflict analysis, scope recommendations = deterministic templates + data. No AI, no hallucination. Templates are crafted to read like an analyst wrote them.

**5. URL state sharing.**
Release state encoded in URL hash (compressed JSON). Share without backend.

---

## V1 milestones

### M1: Scoring engine + types
- [ ] TypeScript interfaces in `types.ts`
- [ ] RICE, ICE, MoSCoW scoring in `scoring.ts`
- [ ] Consensus calculation in `consensus.ts`
- [ ] Question → score mappings in `mappings.ts`
- [ ] Conflict detection in `conflicts.ts`
- [ ] Report text generation in `report.ts`
- [ ] Unit tests for all engine modules
- **Exit:** `pnpm test` passes, all edge cases covered

### M2: UI shell + design system
- [ ] Vite + React + TS + Tailwind setup
- [ ] All dependencies installed
- [ ] Tailwind config with design tokens
- [ ] Google Fonts loaded
- [ ] Shared components (Modal, Toast, Tooltip, Badge, EmptyState, ConfirmDialog)
- [ ] AppHeader, router (/ → /release/:id)
- [ ] Zustand stores + localStorage persistence + auto-save
- [ ] Import/export JSON (settings panel)
- **Exit:** Create release, navigate, refresh persists. Design system consistent.

### M3: Home screen
- [ ] GlobalStatsBar, ReleaseCard (with mini consensus bar), ReleaseGrid
- [ ] NewReleaseModal, EmptyHome with 3-step explainer
- [ ] Delete release, status management
- **Exit:** Home looks production-grade. CRUD releases works.

### M4: Workspace sidebar + feature input
- [ ] WorkspaceSidebar with feature list + meta + actions
- [ ] QuestionFlow, QuestionCard, LiveScorePreview
- [ ] FeatureQueue (right panel), BulkAddMode
- [ ] Edit mode, TabBar
- [ ] Keyboard shortcuts for form
- **Exit:** 15 features added rapidly. Scoring correct. UX fast.

### M5: Dashboard
- [ ] MetricCards (4 cards)
- [ ] ScoreDistributionChart, PriorityMatrix, FrameworkHeatmap, MoscowBreakdown
- [ ] Chart interactions (tooltips, toggles)
- [ ] Empty states for all charts
- **Exit:** Dashboard visually impressive. All charts render. Tooltips work.

### M6: Rankings table
- [ ] UnifiedTable with all columns + TableControls
- [ ] FeatureRow, FeatureRowExpanded, ConsensusTag, RankBadge
- [ ] CapacityCutoff (draggable), column sorting, row expand animations
- [ ] Multi-select, compact/comfortable toggle, sticky header
- **Exit:** 50 features no perf issues. Sort/filter/expand works. Enterprise-grade look.

### M7: Feature detail panel
- [ ] FeatureDetailPanel slide-over
- [ ] Score cards, breakdown accordion, input summary
- [ ] Score thermometer, vs-average comparison
- [ ] V2 placeholder (AI audit teaser)
- [ ] Actions (edit, duplicate, delete, move)
- **Exit:** Comprehensive feature info. Smooth animation. All actions work.

### M8: Reports
- [ ] ReportHeader, ExecutiveSummary, RecommendedScope
- [ ] ConflictAnalysis (template explanations)
- [ ] ReportCharts (print-optimized), RawDataAppendix
- [ ] ExportActions (MD, CSV, JSON, Print)
- [ ] Print stylesheet, URL sharing
- **Exit:** Report polished enough for slide deck. All exports work. Print clean.

### M9: Polish + responsive
- [ ] All empty + edge states
- [ ] All keyboard shortcuts + overlay
- [ ] Toast notifications
- [ ] Responsive (tablet + mobile)
- [ ] Error boundaries, perf optimization (memo, lazy load)
- [ ] Favicon, OG tags, README with screenshots
- **Exit:** No rough edges. Responsive all devices.

### M10: Deploy
- [ ] Deploy to Vercel/Netlify
- [ ] Analytics (Plausible)
- [ ] Lighthouse 90+ all scores
- **Exit:** Live, shareable, fast.

---

## TypeScript type definitions

These are the complete type definitions for the engine. Place in `src/engine/types.ts`. Every component and store references these — they are the single source of truth.

```typescript
// ============================================================
// ENUMS — Question answer options
// ============================================================

export enum CustomerScope {
  ALL = 'all_accounts',
  ENTERPRISE = 'enterprise_segment',
  COMMITTED = 'committed_accounts',
  INTERNAL = 'internal',
}

export enum ValueDelivered {
  TRANSFORMATIVE = 'transformative',
  SIGNIFICANT = 'significant',
  MODERATE = 'moderate',
  MINOR = 'minor',
  NEGLIGIBLE = 'negligible',
}

export enum ConfidenceLevel {
  VALIDATED = 'validated',
  STRONG_HUNCH = 'strong_hunch',
  EDUCATED_GUESS = 'educated_guess',
  SPECULATIVE = 'speculative',
}

export enum BuildComplexity {
  TRIVIAL = 'trivial',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  MASSIVE = 'massive',
}

export enum StrategicNecessity {
  CUSTOMER_COMMITMENT = 'customer_commitment',
  COMPETITIVE_STAKES = 'competitive_stakes',
  STRATEGIC_DIFFERENTIATOR = 'strategic_differentiator',
  USER_REQUESTED = 'user_requested',
  SPECULATIVE_BET = 'speculative_bet',
  INTERNAL_INITIATIVE = 'internal_initiative',
}

export enum MoscowCategory {
  MUST = 'must_have',
  SHOULD = 'should_have',
  COULD = 'could_have',
  WONT = 'wont_have',
}

export enum ConsensusSignal {
  STRONG = 'strong',
  MIXED = 'mixed',
  CONFLICT = 'conflict',
}

export enum ReleaseStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  FINALIZED = 'finalized',
}

// ============================================================
// CORE DATA MODELS
// ============================================================

export interface QuestionAnswers {
  customerScope: CustomerScope
  estimatedAccounts?: number        // optional, improves RICE reach precision
  valueDelivered: ValueDelivered
  confidence: ConfidenceLevel
  buildComplexity: BuildComplexity
  strategicNecessity: StrategicNecessity
}

export interface RICEScore {
  reach: number                     // derived: accounts × scope multiplier
  impact: number                    // 0.25 | 0.5 | 1 | 2 | 3
  confidence: number                // 30 | 50 | 80 | 100
  effort: number                    // 0.5 | 1 | 2 | 4 | 8
  total: number                     // (reach × impact × confidence%) / effort
  rank: number                      // 1-indexed rank within release
  quartile: 1 | 2 | 3 | 4          // for consensus calculation
}

export interface ICEScore {
  impact: number                    // 1-10 (Q2 mapping + Q1 modifier, clamped)
  confidence: number                // 1-10
  ease: number                      // 1-10
  total: number                     // impact × confidence × ease
  rank: number
  quartile: 1 | 2 | 3 | 4
}

export interface MoscowResult {
  category: MoscowCategory
  reason: StrategicNecessity        // which Q5 answer drove this
  inconsistencies: MoscowInconsistency[]
  weight: 1 | 2 | 3 | 4            // Must=1, Should=2, Could=3, Won't=4
}

export interface MoscowInconsistency {
  type: 'scope_vs_necessity' | 'confidence_vs_necessity'
  description: string               // human-readable explanation
  // e.g., "Marked as committed accounts but not flagged as customer commitment"
}

export interface Scores {
  rice: RICEScore
  ice: ICEScore
  moscow: MoscowResult
  consensus: ConsensusResult
}

export interface ConsensusResult {
  signal: ConsensusSignal
  riceQuartile: 1 | 2 | 3 | 4
  iceQuartile: 1 | 2 | 3 | 4
  moscowWeight: 1 | 2 | 3 | 4
  maxSpread: number                 // max difference between quartiles
  explanation: string               // human-readable tooltip text
  // e.g., "RICE ranks this #2, ICE ranks this #7. Frameworks disagree on priority."
}

export interface Feature {
  id: string                        // nanoid
  name: string
  answers: QuestionAnswers
  scores: Scores
  createdAt: string                 // ISO 8601
  updatedAt: string                 // ISO 8601
  manualOrder?: number              // for sidebar drag-and-drop reorder
}

export interface Release {
  id: string                        // nanoid
  name: string
  description?: string
  targetDate?: string               // ISO 8601 date (no time)
  capacity?: number                 // max features to ship
  status: ReleaseStatus
  features: Feature[]
  createdAt: string
  updatedAt: string
}

export interface ReleaseSummary {
  id: string
  name: string
  description?: string
  targetDate?: string
  capacity?: number
  status: ReleaseStatus
  featureCount: number
  consensusBreakdown: {
    strong: number
    mixed: number
    conflict: number
  }
  createdAt: string
  updatedAt: string
}

// ============================================================
// REPORT TYPES
// ============================================================

export interface ReportData {
  release: Release
  executiveSummary: string
  recommendedScope: {
    included: Feature[]             // features within capacity
    deferred: Feature[]             // features below capacity
    mustHaveBelowCapacity: Feature[] // warning: Must haves that didn't make the cut
  }
  conflictAnalysis: ConflictCard[]
  statistics: ReleaseStatistics
}

export interface ConflictCard {
  feature: Feature
  riceRank: number
  iceRank: number
  moscowCategory: MoscowCategory
  explanation: string               // template-generated explanation of WHY
  discussionPrompt: string          // template-generated question for the team
}

export interface ReleaseStatistics {
  totalFeatures: number
  avgRiceScore: number
  medianRiceScore: number
  avgIceScore: number
  medianIceScore: number
  moscowBreakdown: Record<MoscowCategory, number>
  consensusBreakdown: Record<ConsensusSignal, number>
  capacityUtilization?: {
    used: number
    total: number
    percentage: number
  }
  topFeatureByRice: Feature | null
  topFeatureByIce: Feature | null
  scoreDistributionSkew: 'normal' | 'top_heavy' | 'bottom_heavy'
}

// ============================================================
// CHART DATA TYPES
// ============================================================

export interface ScoreDistributionItem {
  featureId: string
  featureName: string
  score: number                     // RICE or ICE depending on toggle
  consensus: ConsensusSignal
  isAboveCapacity: boolean
}

export interface PriorityMatrixDot {
  featureId: string
  featureName: string
  effort: number                    // x-axis (1-10, derived from Q4)
  impact: number                    // y-axis (1-10, derived from Q2)
  riceScore: number                 // dot size
  consensus: ConsensusSignal        // dot color
  quadrant: 'quick_wins' | 'big_bets' | 'fill_ins' | 'money_pits'
}

export interface HeatmapRow {
  featureId: string
  featureName: string
  riceRank: number
  iceRank: number
  moscowCategory: MoscowCategory
  agreement: ConsensusSignal
}

// ============================================================
// EXPORT TYPES
// ============================================================

export type ExportFormat = 'markdown' | 'csv' | 'json'

export interface ExportOptions {
  format: ExportFormat
  includeRawInputs: boolean         // include question answers or just scores
  includeReport: boolean            // include executive summary + conflict analysis
}

// ============================================================
// V2 AI TYPES (stubbed in V1, implemented in V2)
// ============================================================

export interface ProductContext {
  id: string
  name: string
  documents: ContextDocument[]
  createdAt: string
  updatedAt: string
}

export interface ContextDocument {
  id: string
  name: string
  category: ContextCategory
  content: string                   // extracted text
  originalFileName: string
  mimeType: string
  uploadedAt: string
}

export type ContextCategory =
  | 'customer_feedback'
  | 'strategic_docs'
  | 'roadmap'
  | 'sales_data'
  | 'past_outcomes'
  | 'other'

export interface QuestionVerdict {
  question: 'customer_scope' | 'value_delivered' | 'confidence' | 'build_complexity' | 'strategic_necessity'
  userAnswer: string
  verdict: 'supported' | 'overstated' | 'understated' | 'no_evidence'
  reasoning: string                 // 1-2 sentences
  suggestedAnswer?: string          // if overstated/understated, what should it be
  citations: Citation[]
}

export interface Citation {
  documentId: string
  documentName: string
  excerpt: string                   // short quoted passage
  location?: string                 // page number, row number, etc.
}

export interface AuditResult {
  featureId: string
  verdicts: QuestionVerdict[]
  overallAssessment: string         // summary paragraph
  currentScore: number              // the PM's RICE score
  adjustedScore: number             // AI's estimated RICE score
  scoreDelta: number                // difference
  rankImpact: string                // "May drop from #3 to #5"
  confidence: 'high' | 'medium' | 'low'
  dataPointCount: number            // how many supporting data points found
}

export interface ReleaseAudit {
  releaseId: string
  featureAudits: AuditResult[]
  strategicAlignment: AlignmentCheck[]
  overallAssessment: string
  auditedAt: string
}

export interface AlignmentCheck {
  featureId: string
  featureName: string
  alignedOKRs: { okr: string; citation: Citation }[]
  customerEvidence: { summary: string; mentionCount: number; citation: Citation }[]
  revenueSignal: { summary: string; citation: Citation } | null
  roadmapConflicts: { conflict: string; citation: Citation }[]
}

export interface ConflictReport {
  releaseId: string
  duplicateCoverage: {
    features: [string, string]      // feature ID pair
    sharedPain: string
    citation: Citation
  }[]
  scoringInconsistencies: {
    featureA: string
    featureB: string
    inconsistency: string
    citation: Citation
  }[]
  unsupportedMustHaves: {
    featureId: string
    featureName: string
    reason: string
  }[]
  missingCoverage: {
    okr: string
    citation: Citation
  }[]
}

// ============================================================
// UI STATE TYPES
// ============================================================

export type WorkspaceTab = 'dashboard' | 'rankings' | 'add-edit' | 'reports'

export type SortField = 'consensus' | 'rice' | 'ice' | 'moscow' | 'date_added' | 'name'
export type SortDirection = 'asc' | 'desc'

export interface TableFilters {
  moscow: MoscowCategory[]          // empty = show all
  consensus: ConsensusSignal[]      // empty = show all
  search: string                    // feature name search
}

export type TableDensity = 'compact' | 'comfortable'

export interface UserSettings {
  defaultCapacity: number | null
  defaultReachBase: number          // default account count for RICE (e.g., 1000)
  tableDensity: TableDensity
  showCapacityCutoff: boolean
  lastViewedReleaseId: string | null
}
```

---

## Zustand store schemas

### releaseStore

```typescript
interface ReleaseStore {
  releases: Release[]
  
  // Actions
  createRelease: (data: { name: string; description?: string; targetDate?: string; capacity?: number }) => Release
  updateRelease: (id: string, updates: Partial<Omit<Release, 'id' | 'createdAt' | 'features'>>) => void
  deleteRelease: (id: string) => void
  duplicateRelease: (id: string) => Release
  
  // Computed (via selectors, not stored)
  getRelease: (id: string) => Release | undefined
  getReleaseSummaries: () => ReleaseSummary[]
  getGlobalStats: () => { totalFeatures: number; releaseCount: number; avgConsensusStrong: number }
}
```

**Persistence:** The entire `releases` array is serialized to localStorage under key `prioritize-hq:releases`. Debounced 500ms via `useAutoSave` hook. Hydrated on app init.

### featureStore

```typescript
interface FeatureStore {
  // Actions (all operate within a specific release)
  addFeature: (releaseId: string, name: string, answers: QuestionAnswers) => Feature
  updateFeature: (releaseId: string, featureId: string, updates: { name?: string; answers?: QuestionAnswers }) => void
  deleteFeature: (releaseId: string, featureId: string) => void
  duplicateFeature: (releaseId: string, featureId: string) => Feature
  moveFeature: (fromReleaseId: string, toReleaseId: string, featureId: string) => void
  reorderFeature: (releaseId: string, featureId: string, newOrder: number) => void
  bulkAddFeatures: (releaseId: string, names: string[], sharedAnswers: QuestionAnswers) => Feature[]
  bulkDeleteFeatures: (releaseId: string, featureIds: string[]) => void
  bulkUpdateMoscow: (releaseId: string, featureIds: string[], necessity: StrategicNecessity) => void
  
  // Scoring is derived, not stored — computed via useScoring hook
  // Features are stored inside Release objects in releaseStore
}
```

**Note:** Features are nested inside Release objects in `releaseStore`. The `featureStore` is a convenience layer that modifies the parent release. This avoids sync issues between two separate stores.

### uiStore

```typescript
interface UIStore {
  // Workspace state
  activeTab: WorkspaceTab
  setActiveTab: (tab: WorkspaceTab) => void
  
  // Feature selection
  selectedFeatureId: string | null
  setSelectedFeature: (id: string | null) => void
  expandedFeatureId: string | null  // in rankings table
  setExpandedFeature: (id: string | null) => void
  
  // Detail panel
  detailPanelFeatureId: string | null
  openDetailPanel: (featureId: string) => void
  closeDetailPanel: () => void
  
  // Table state
  sortField: SortField
  sortDirection: SortDirection
  setSorting: (field: SortField, direction?: SortDirection) => void
  filters: TableFilters
  setFilters: (filters: Partial<TableFilters>) => void
  tableDensity: TableDensity
  setTableDensity: (density: TableDensity) => void
  showCapacityCutoff: boolean
  setShowCapacityCutoff: (show: boolean) => void
  
  // Multi-select
  selectedFeatureIds: string[]
  toggleFeatureSelection: (id: string) => void
  selectAllFeatures: () => void
  clearSelection: () => void
  isSelectMode: boolean
  setSelectMode: (on: boolean) => void
  
  // Modals
  activeModal: 'new-release' | 'confirm-delete' | 'keyboard-shortcuts' | 'settings' | 'export' | null
  modalData: unknown                // context data for the modal (e.g., feature to delete)
  openModal: (modal: string, data?: unknown) => void
  closeModal: () => void
  
  // Edit mode
  editingFeatureId: string | null   // feature being edited in Add/Edit tab
  setEditingFeature: (id: string | null) => void
  
  // Bulk add mode
  isBulkAddMode: boolean
  setBulkAddMode: (on: boolean) => void
  
  // Dashboard chart toggle
  distributionChartSort: 'rice' | 'ice'
  setDistributionChartSort: (sort: 'rice' | 'ice') => void
}
```

**Persistence:** Only `tableDensity`, `showCapacityCutoff`, and `distributionChartSort` are persisted. All other UI state resets on page load.

### settingsStore

```typescript
interface SettingsStore {
  defaultCapacity: number | null
  defaultReachBase: number          // default: 1000
  lastViewedReleaseId: string | null
  
  setDefaultCapacity: (n: number | null) => void
  setDefaultReachBase: (n: number) => void
  setLastViewedRelease: (id: string | null) => void
}
```

**Persistence:** Entire store persisted to localStorage under key `prioritize-hq:settings`.

---

## Report template strings

These templates live in `src/engine/report.ts`. They are pure functions that take `ReleaseStatistics` and `Feature[]` and return strings. No AI, no randomness, fully deterministic.

### Executive summary template

```typescript
function generateExecutiveSummary(stats: ReleaseStatistics, release: Release): string {
  const parts: string[] = []
  
  // Opening line
  parts.push(
    `This release contains ${stats.totalFeatures} scored features across ` +
    `${Object.values(stats.moscowBreakdown).filter(v => v > 0).length} MoSCoW categories.`
  )
  
  // Capacity line (only if capacity is set)
  if (stats.capacityUtilization) {
    parts.push(
      `${stats.capacityUtilization.used} features fit within the stated capacity of ` +
      `${stats.capacityUtilization.total} engineering slots ` +
      `(${stats.capacityUtilization.percentage}% utilization).`
    )
  }
  
  // Consensus line
  const strongPct = Math.round((stats.consensusBreakdown.strong / stats.totalFeatures) * 100)
  const conflictCount = stats.consensusBreakdown.conflict
  if (conflictCount > 0) {
    parts.push(
      `Consensus is strong on ${stats.consensusBreakdown.strong} features (${strongPct}%) ` +
      `with ${conflictCount} feature${conflictCount > 1 ? 's' : ''} showing framework ` +
      `disagreement that may warrant discussion.`
    )
  } else {
    parts.push(
      `All three frameworks are in agreement across all features — ` +
      `${strongPct}% strong consensus. No conflicts detected.`
    )
  }
  
  // Top feature line
  if (stats.topFeatureByRice) {
    parts.push(
      `The top-ranked feature by RICE is "${stats.topFeatureByRice.name}" ` +
      `(score: ${stats.topFeatureByRice.scores.rice.total.toLocaleString()}), ` +
      `driven by ${describeTopDrivers(stats.topFeatureByRice)}.`
    )
  }
  
  // Skew warning (if scores are heavily clustered)
  if (stats.scoreDistributionSkew === 'top_heavy') {
    parts.push(
      `Note: Scores are clustered at the top of the range. ` +
      `Consider whether impact or reach estimates are uniformly optimistic.`
    )
  } else if (stats.scoreDistributionSkew === 'bottom_heavy') {
    parts.push(
      `Note: Most features score in the lower range. ` +
      `This release may lack a clear high-impact anchor feature.`
    )
  }
  
  return parts.join(' ')
}

function describeTopDrivers(feature: Feature): string {
  const drivers: string[] = []
  if (feature.answers.customerScope === CustomerScope.ALL) {
    drivers.push('broad customer scope')
  }
  if (feature.answers.confidence === ConfidenceLevel.VALIDATED) {
    drivers.push('high validated confidence')
  }
  if (feature.answers.valueDelivered === ValueDelivered.TRANSFORMATIVE) {
    drivers.push('transformative impact')
  }
  if (feature.answers.buildComplexity === BuildComplexity.TRIVIAL ||
      feature.answers.buildComplexity === BuildComplexity.SMALL) {
    drivers.push('low build effort')
  }
  return drivers.length > 0 ? drivers.join(' and ') : 'balanced scoring across all dimensions'
}
```

### Conflict analysis template

```typescript
function generateConflictExplanation(card: ConflictCard): { explanation: string; discussionPrompt: string } {
  const { feature, riceRank, iceRank, moscowCategory } = card
  const answers = feature.answers
  
  // Build explanation from the actual scoring inputs
  const reasons: string[] = []
  
  // RICE vs ICE disagreement
  if (Math.abs(riceRank - iceRank) >= 3) {
    if (riceRank < iceRank) {
      // RICE ranks higher than ICE
      if (answers.customerScope === CustomerScope.ALL || answers.customerScope === CustomerScope.ENTERPRISE) {
        reasons.push(`RICE scores high because of broad reach (${scopeLabel(answers.customerScope)}).`)
      }
      if (answers.confidence === ConfidenceLevel.EDUCATED_GUESS || answers.confidence === ConfidenceLevel.SPECULATIVE) {
        reasons.push(`ICE scores low because confidence is only ${confidenceLabel(answers.confidence)}.`)
      }
      if (answers.buildComplexity === BuildComplexity.LARGE || answers.buildComplexity === BuildComplexity.MASSIVE) {
        reasons.push(`ICE penalizes the high build complexity (${complexityLabel(answers.buildComplexity)}).`)
      }
    } else {
      // ICE ranks higher than RICE
      if (answers.buildComplexity === BuildComplexity.TRIVIAL || answers.buildComplexity === BuildComplexity.SMALL) {
        reasons.push(`ICE scores high because ease of implementation is high (${complexityLabel(answers.buildComplexity)}).`)
      }
      if (answers.customerScope === CustomerScope.COMMITTED || answers.customerScope === CustomerScope.INTERNAL) {
        reasons.push(`RICE scores low because reach is limited (${scopeLabel(answers.customerScope)}).`)
      }
    }
  }
  
  // MoSCoW vs numeric frameworks
  if (moscowCategory === MoscowCategory.MUST && (riceRank > 5 || iceRank > 5)) {
    reasons.push(`MoSCoW flags this as "Must have" but numeric frameworks rank it lower, suggesting the commitment may not align with effort or reach.`)
  }
  if (moscowCategory === MoscowCategory.COULD && (riceRank <= 3 || iceRank <= 3)) {
    reasons.push(`Numeric frameworks rank this highly, but MoSCoW categorizes it as "Could have" — it may be under-prioritized strategically.`)
  }
  
  const explanation = reasons.length > 0
    ? reasons.join(' ')
    : `RICE and ICE disagree on the relative priority of this feature. Review the individual scoring dimensions to identify the source of disagreement.`
  
  // Generate discussion prompt
  let discussionPrompt: string
  if (answers.confidence === ConfidenceLevel.SPECULATIVE || answers.confidence === ConfidenceLevel.EDUCATED_GUESS) {
    discussionPrompt = `Does the team have data to increase confidence? If validated, this feature moves up in ICE. If confidence remains low, ICE and MoSCoW rankings are probably more accurate than RICE.`
  } else if (moscowCategory === MoscowCategory.MUST && riceRank > 5) {
    discussionPrompt = `This is marked as a customer commitment but doesn't score well on reach or impact. Is the commitment still active? If not, recategorize. If yes, it ships regardless of score — but track the opportunity cost.`
  } else if (answers.buildComplexity === BuildComplexity.MASSIVE) {
    discussionPrompt = `High complexity is suppressing scores. Can this be broken into smaller deliverables? A phased approach might score the first phase much higher.`
  } else {
    discussionPrompt = `The frameworks disagree because they weight different factors. Discuss with stakeholders which dimension matters most for this specific feature: reach (RICE), ease of delivery (ICE), or strategic obligation (MoSCoW).`
  }
  
  return { explanation, discussionPrompt }
}
```

---

## Settings panel specification

Accessible via gear icon in the app header. Opens as a modal overlay.

**Sections:**

### General
- **Default reach base:** Number input. "Default number of users/accounts for RICE calculation when no estimate is provided." Default: 1000.
- **Default capacity:** Number input. "Pre-fill capacity for new releases." Default: blank.
- **Table density:** Toggle — Compact / Comfortable. Persisted.

### Data management
- **Export all data:** Button → downloads `prioritize-hq-backup-YYYY-MM-DD.json` containing all releases, features, and settings.
- **Import data:** File upload → accepts `.json` file. Shows confirmation dialog: "This will replace all existing data. Are you sure?" with preview of what's being imported (release count, feature count).
- **Clear all data:** Danger button (red text, confirmation required). Wipes localStorage completely. Shows: "This cannot be undone. Export your data first."

### About
- Version number (from package.json)
- "Built by @RumanParveez" with GitHub link
- "Powered by RICE, ICE, and MoSCoW frameworks"
- Keyboard shortcuts link (opens shortcut overlay)

---

## Error handling strategy

### Client-side errors

**localStorage failures:**
```typescript
try {
  localStorage.setItem(key, JSON.stringify(data))
} catch (e) {
  if (e instanceof DOMException && e.name === 'QuotaExceededError') {
    showToast('Storage full. Export your data and clear old releases.', 'warning')
  } else {
    showToast('Failed to save. Your changes may not persist.', 'error')
    console.error('Storage error:', e)
  }
}
```

**Data corruption:**
On hydration, validate stored data against TypeScript interfaces. If validation fails:
1. Attempt to salvage valid releases (skip corrupted ones)
2. Show toast: "Some data could not be loaded. [X] releases recovered."
3. Log full error to console for debugging

**Import validation:**
When importing JSON:
1. Check for required top-level keys (`releases`, `settings`)
2. Validate each release has required fields
3. Validate each feature has valid `answers` with valid enum values
4. Reject the import entirely if structure is invalid (don't partially import)
5. Show specific error: "Invalid import file: [reason]"

**URL hash decoding:**
When loading a shared URL:
1. Try to decode and decompress the hash
2. If malformed: show toast "Invalid share link. Showing your local data instead."
3. If valid: show the shared release in read-only mode (no editing allowed on shared data)

### Error boundaries

Wrap each major section in a React Error Boundary:
- Dashboard charts (if one chart fails, others still render)
- Rankings table
- Feature detail panel
- Reports tab

Fallback UI: "Something went wrong in this section. [Reload] or [Report issue]"

---

## Testing strategy

### Unit tests (engine — highest priority)

**What to test:**
- Every scoring function with every valid input combination
- Edge cases: zero values, extreme values, single feature, 100 features
- Consensus calculation with tied scores
- Consensus with only 1, 2, 3, 4 features (quartile edge cases)
- MoSCoW inconsistency detection (all flag conditions)
- Report template generation (every template branch)
- Conflict analysis templates (every explanation path)
- Mapping functions (every enum value maps correctly)

**Test framework:** Vitest (built into Vite, fast, TypeScript-native)

**Example test structure:**
```typescript
describe('scoring/rice', () => {
  it('calculates correctly with default inputs', () => {
    const answers: QuestionAnswers = {
      customerScope: CustomerScope.ALL,
      valueDelivered: ValueDelivered.SIGNIFICANT,
      confidence: ConfidenceLevel.STRONG_HUNCH,
      buildComplexity: BuildComplexity.MEDIUM,
      strategicNecessity: StrategicNecessity.STRATEGIC_DIFFERENTIATOR,
    }
    const result = calculateRICE(answers, 1000)
    expect(result.reach).toBe(1000)          // 1000 × 1.0
    expect(result.impact).toBe(2)            // Significant = High = 2
    expect(result.confidence).toBe(80)       // Strong hunch = 80%
    expect(result.effort).toBe(2)            // Medium = 2 person-months
    expect(result.total).toBe(800)           // (1000 × 2 × 0.8) / 2
  })

  it('handles zero effort gracefully', () => {
    // effort should never be 0, but if it is, return 0 not Infinity
    // ...
  })

  it('applies scope multiplier correctly for enterprise segment', () => {
    // reach = 1000 × 0.6 = 600
    // ...
  })
})

describe('consensus', () => {
  it('returns Strong when all frameworks agree within 1 quartile', () => { /* ... */ })
  it('returns Mixed when max spread is 2 quartiles', () => { /* ... */ })
  it('returns Conflict when max spread is 3+ quartiles', () => { /* ... */ })
  it('handles single feature by returning Strong', () => { /* ... */ })
  it('handles two features correctly (only 2 quartiles possible)', () => { /* ... */ })
})
```

**Coverage target:** 100% on `src/engine/`. This is the foundation — if the math is wrong, the product is useless.

### Component tests (UI — secondary priority)

**What to test:**
- QuestionFlow: selecting answers updates state correctly
- UnifiedTable: sorting, filtering, expanding
- ConsensusTag: renders correct variant for each signal
- ExportActions: generates correct markdown/CSV format
- Modal: opens, closes, handles escape key
- FeatureDetailPanel: slide-over opens, displays correct data

**Test framework:** Vitest + @testing-library/react

**Coverage target:** Key interactions only. Not pixel-perfect rendering tests.

### Integration tests (optional, V1.1)

- Full flow: create release → add 5 features → verify rankings → export
- Data persistence: add data → refresh page → verify data restored
- Import/export: export → clear → import → verify data matches

---

## Analytics events

Using Plausible Analytics (privacy-respecting, no cookies, GDPR compliant).

**Page views (automatic):**
- `/` — Home
- `/release/:id` — Workspace (tab tracked as custom property)

**Custom events (manual):**
```
release_created        — when a new release is created
feature_added          — when a feature is scored (count only, no content)
feature_edited         — when a feature's scores are updated
feature_deleted        — when a feature is removed
bulk_features_added    — when bulk add mode is used (count property)
tab_switched           — which tab (dashboard/rankings/add-edit/reports)
export_triggered       — which format (markdown/csv/json/print)
share_link_copied      — when share URL is copied
capacity_set           — when capacity is configured
shortcut_used          — which shortcut key
detail_panel_opened    — when feature detail panel is opened
conflict_viewed        — when a conflict card is expanded in reports
```

**Never tracked:** Feature names, descriptions, scores, question answers, release names, or any user content. Only event counts and generic properties (format type, tab name).

---

## Sample data for development

Include a `src/data/sampleRelease.ts` file with a pre-built release containing 10 features. Used for:
- Development (skip manual data entry while building UI)
- Demo mode (show to stakeholders)
- Screenshots (for README and marketing)

```typescript
export const sampleRelease: Release = {
  id: 'sample-release-001',
  name: 'Q3 2026 Platform Update',
  description: 'Core platform improvements focused on enterprise adoption and developer experience.',
  targetDate: '2026-09-30',
  capacity: 7,
  status: ReleaseStatus.DRAFT,
  features: [
    {
      id: 'feat-001',
      name: 'SSO / SAML Integration',
      answers: {
        customerScope: CustomerScope.ENTERPRISE,
        estimatedAccounts: 340,
        valueDelivered: ValueDelivered.TRANSFORMATIVE,
        confidence: ConfidenceLevel.VALIDATED,
        buildComplexity: BuildComplexity.MEDIUM,
        strategicNecessity: StrategicNecessity.COMPETITIVE_STAKES,
      },
      // scores derived at runtime
    },
    {
      id: 'feat-002',
      name: 'Bulk CSV Export',
      answers: {
        customerScope: CustomerScope.ALL,
        valueDelivered: ValueDelivered.SIGNIFICANT,
        confidence: ConfidenceLevel.EDUCATED_GUESS,
        buildComplexity: BuildComplexity.SMALL,
        strategicNecessity: StrategicNecessity.USER_REQUESTED,
      },
    },
    {
      id: 'feat-003',
      name: 'API Rate Limiting Dashboard',
      answers: {
        customerScope: CustomerScope.ENTERPRISE,
        valueDelivered: ValueDelivered.SIGNIFICANT,
        confidence: ConfidenceLevel.STRONG_HUNCH,
        buildComplexity: BuildComplexity.LARGE,
        strategicNecessity: StrategicNecessity.STRATEGIC_DIFFERENTIATOR,
      },
    },
    {
      id: 'feat-004',
      name: 'Dark Mode',
      answers: {
        customerScope: CustomerScope.ALL,
        valueDelivered: ValueDelivered.MINOR,
        confidence: ConfidenceLevel.VALIDATED,
        buildComplexity: BuildComplexity.SMALL,
        strategicNecessity: StrategicNecessity.USER_REQUESTED,
      },
    },
    {
      id: 'feat-005',
      name: 'Custom Webhook Endpoints',
      answers: {
        customerScope: CustomerScope.COMMITTED,
        estimatedAccounts: 3,
        valueDelivered: ValueDelivered.TRANSFORMATIVE,
        confidence: ConfidenceLevel.VALIDATED,
        buildComplexity: BuildComplexity.MEDIUM,
        strategicNecessity: StrategicNecessity.CUSTOMER_COMMITMENT,
      },
    },
    {
      id: 'feat-006',
      name: 'Onboarding Checklist Wizard',
      answers: {
        customerScope: CustomerScope.ALL,
        valueDelivered: ValueDelivered.MODERATE,
        confidence: ConfidenceLevel.STRONG_HUNCH,
        buildComplexity: BuildComplexity.SMALL,
        strategicNecessity: StrategicNecessity.STRATEGIC_DIFFERENTIATOR,
      },
    },
    {
      id: 'feat-007',
      name: 'Audit Log Viewer',
      answers: {
        customerScope: CustomerScope.ENTERPRISE,
        valueDelivered: ValueDelivered.SIGNIFICANT,
        confidence: ConfidenceLevel.STRONG_HUNCH,
        buildComplexity: BuildComplexity.MEDIUM,
        strategicNecessity: StrategicNecessity.COMPETITIVE_STAKES,
      },
    },
    {
      id: 'feat-008',
      name: 'AI-Powered Search',
      answers: {
        customerScope: CustomerScope.ALL,
        valueDelivered: ValueDelivered.TRANSFORMATIVE,
        confidence: ConfidenceLevel.SPECULATIVE,
        buildComplexity: BuildComplexity.MASSIVE,
        strategicNecessity: StrategicNecessity.SPECULATIVE_BET,
      },
    },
    {
      id: 'feat-009',
      name: 'Mobile Responsive Redesign',
      answers: {
        customerScope: CustomerScope.ALL,
        valueDelivered: ValueDelivered.MODERATE,
        confidence: ConfidenceLevel.STRONG_HUNCH,
        buildComplexity: BuildComplexity.LARGE,
        strategicNecessity: StrategicNecessity.USER_REQUESTED,
      },
    },
    {
      id: 'feat-010',
      name: 'Internal Admin Panel Revamp',
      answers: {
        customerScope: CustomerScope.INTERNAL,
        valueDelivered: ValueDelivered.SIGNIFICANT,
        confidence: ConfidenceLevel.VALIDATED,
        buildComplexity: BuildComplexity.MEDIUM,
        strategicNecessity: StrategicNecessity.INTERNAL_INITIATIVE,
      },
    },
  ],
  createdAt: '2026-04-15T10:00:00Z',
  updatedAt: '2026-04-28T14:30:00Z',
}
```

**Usage in dev:** In the settings panel, add a "Load sample data" button (dev only or always available as a demo). Loads the sample release into the store. Useful for first-time users who want to explore the tool before entering real data.

---

## V2 roadmap — complete specification

### V2.0: AI auditor (core)

#### Context management screen

New top-level route: `/context`

Accessible from the app header (new nav item: "Product Context" with a document icon).

**Layout:** Two-column. Left: uploaded document list. Right: document preview.

**Upload area:**
- Drag-and-drop zone at top of left column
- Accepts: PDF, CSV, TXT, MD files. Max 10MB per file, max 50 files total.
- Each uploaded file shows:
  - File name
  - File size
  - Category dropdown (customer_feedback / strategic_docs / roadmap / sales_data / past_outcomes / other)
  - Upload date
  - Delete button
  - Processing indicator (if text extraction is in progress)

**Text extraction (client-side):**
- PDF: use `pdfjs-dist` to extract text. No server round-trip.
- CSV: parse with native JS. Display as structured data.
- TXT/MD: read as-is.
- Show character count per document.
- Show total context size: "42,000 characters across 8 documents"

**Category guidance:**
When a PM selects a category, show a one-line tip:
- Customer feedback: "Support tickets, call notes, NPS comments, survey responses"
- Strategic docs: "OKRs, annual plan, North Star metric, strategy memos"
- Roadmap: "Planned features, deprecation notices, tech debt list"
- Sales data: "Deal blockers, churn reasons, expansion notes, pipeline stages"
- Past outcomes: "Retros, metric impact reports, post-mortems"
- Other: "Anything else the AI should know about your product"

**Privacy notice (always visible at bottom of context screen):**
```
Your documents stay on your device. They are sent to the AI only during
an active audit request and are not stored on any server. Nothing trains
any model. You can delete all context at any time.
```

#### AI service implementation

**API architecture:**
- V2.0: Direct Anthropic API calls from a thin backend (Express/Hono).
- Backend's only job: proxy API calls with the Anthropic API key.
- Request flow: Browser → Backend proxy → Anthropic API → Backend → Browser
- The API key never touches the browser.

**Model:** Claude Sonnet (fast, cost-effective for structured analysis). Upgrade path to Opus for high-stakes audits.

**Prompt design principles:**
1. Separate prompts per job (auditor, alignment, conflicts). Never combine into one mega-prompt.
2. System prompt establishes the "impartial auditor" persona once.
3. User message contains the structured data (feature, scores, context).
4. Response format is enforced via structured output instructions (JSON).
5. Citations are mandatory — every claim must reference a specific passage.

**System prompt (shared across all three jobs):**
```
You are an impartial product prioritization auditor. Your job is to check
whether a Product Manager's feature scoring is supported by the evidence
in their product context documents.

Rules:
1. Be direct, not diplomatic. Say "Impact is overstated" not "you might
   want to consider adjusting."
2. Every claim must cite a specific passage from the provided documents.
   If you cannot find supporting evidence, say "No evidence found" —
   never guess or infer.
3. You audit the PM's scores. You never propose your own ranking.
4. If evidence is insufficient to evaluate a dimension, explicitly state
   what's missing: "Cannot audit reach — no customer feedback documents
   provided."
5. Distinguish between "evidence contradicts the score" (flag) and
   "no evidence found" (note). Absence of evidence is not evidence of
   absence.
6. Be calibrated in your confidence. If you found 8 supporting data
   points, say "High confidence." If you found 1 tangential mention,
   say "Low confidence."
```

**Job 1 prompt — Score auditor:**
```
Audit this feature's prioritization scoring against the product context.

FEATURE: {feature.name}

PM'S SCORING:
- Customer scope: {answer} → RICE Reach: {score}
- Value delivered: {answer} → RICE Impact: {score}
- Confidence: {answer} → RICE Confidence: {score}
- Build complexity: {answer} → RICE Effort: {score}
- Strategic necessity: {answer} → MoSCoW: {category}
- RICE total: {total} (rank #{rank} of {count})
- ICE total: {total} (rank #{rank})

PRODUCT CONTEXT:
{documents, concatenated with category headers}

For each of the 5 scoring dimensions, respond with:
{
  "question": "customer_scope" | "value_delivered" | ...,
  "verdict": "supported" | "overstated" | "understated" | "no_evidence",
  "reasoning": "1-2 sentence explanation",
  "suggested_answer": "only if overstated/understated",
  "citations": [{"document": "filename", "excerpt": "quoted passage", "location": "p12"}]
}

Then provide:
{
  "overall_assessment": "summary paragraph",
  "adjusted_rice_score": number,
  "score_delta": number,
  "rank_impact": "May drop from #3 to #5",
  "confidence": "high" | "medium" | "low",
  "data_point_count": number
}
```

**Job 2 prompt — Strategic alignment:**
```
For each feature in this release, check strategic alignment against
the product context.

FEATURES: {list of features with names and MoSCoW categories}

PRODUCT CONTEXT: {documents}

For each feature, find:
1. Which OKRs does this advance? (cite the OKR document)
2. How many customer evidence points support this? (cite feedback docs)
3. Is there revenue signal? (cite sales data)
4. Does it conflict with any planned roadmap item? (cite roadmap docs)

Respond as JSON array with one object per feature.
```

**Job 3 prompt — Conflict detection:**
```
Analyze the complete feature set for cross-feature conflicts and
inconsistencies.

FEATURES: {all features with scores}

PRODUCT CONTEXT: {documents}

Find:
1. Duplicate coverage: features solving the same problem
2. Scoring inconsistencies: Feature A ranked higher on reach than B,
   but B has more customer mentions
3. Unsupported must-haves: "Must have" features with zero customer
   evidence
4. Missing coverage: OKRs with no features addressing them

Respond as structured JSON with citations for each finding.
```

**Rate limiting and cost management:**
- Per-feature audit: ~2K input tokens + ~500 output tokens ≈ $0.01-0.02 per audit
- Release audit (10 features): ~$0.15-0.30
- Show estimated cost before running: "This audit will process ~25K tokens (~$0.20)"
- Implement client-side caching: if feature scores haven't changed since last audit, skip re-auditing
- Daily cap: configurable max API spend (default $5/day)

#### AI audit UI details

**Audit trigger buttons:**
- Per-feature: "Audit" button appears on each feature card in the rankings table and in the detail panel. Icon: magnifying glass.
- Per-release: "Audit all" button in the reports tab and sidebar footer. Runs all three jobs sequentially.

**Loading state during audit:**
- Skeleton loader replacing the audit panel content
- Progress indicator: "Auditing feature 3 of 10..."
- Cancel button to abort mid-audit

**Audit result display (per feature):**

In the feature detail panel, a new section appears below "Score context":

```
┌─────────────────────────────────────────────────────────┐
│  AI AUDIT                                    Re-audit ↻ │
│  Audited 2 min ago  •  Confidence: Medium (4 data pts)  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CUSTOMER SCOPE                          ▲ Overstated   │
│  You said: All accounts                                 │
│  Evidence: 4 mentions found, all from enterprise        │
│  accounts. No SMB or free-tier mentions.                │
│  → Suggest: Enterprise segment                          │
│  ┊ "...three enterprise clients raised this in QBRs"    │
│  ┊ Source: Q3_customer_calls.pdf, p.12                  │
│                                                         │
│  VALUE DELIVERED                          ✓ Supported   │
│  You said: Significant — removes a major pain point     │
│  Evidence: 3 of 4 mentions describe the current         │
│  workflow as "painful" or "extremely manual."            │
│  ┊ "Exporting takes 45 minutes per report"              │
│  ┊ Source: support_tickets.csv, row 89                  │
│                                                         │
│  CONFIDENCE                               ✓ Supported   │
│  You said: Strong hunch (80%)                           │
│  Evidence: Consistent with 4 independent customer       │
│  mentions across 2 document sources.                    │
│                                                         │
│  BUILD COMPLEXITY                    ⊘ No evidence      │
│  You said: Medium (1-2 months)                          │
│  Cannot audit — no engineering estimates or technical    │
│  documentation in product context.                      │
│  → Upload: technical specs, engineering estimates        │
│                                                         │
│  STRATEGIC NECESSITY                      ▲ Overstated   │
│  You said: Competitive table stakes                     │
│  Evidence: No competitive mentions found in context.    │
│  Feature appears user-requested, not competitive.       │
│  → Suggest: User-requested improvement                  │
│  ┊ Source: Searched all docs — 0 competitor mentions    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  OVERALL                                                │
│  RICE score likely overstated. Adjusted estimate: ~160  │
│  (currently 240). Rank may drop from #3 to #5.          │
│  Audit confidence: Medium (4 data points from 2 docs)   │
│                                                         │
│  [ Accept suggestions ]  [ Dismiss ]  [ Re-audit ]      │
└─────────────────────────────────────────────────────────┘
```

**Verdict icons and colors:**
- ✓ Supported — green text, checkmark icon
- ▲ Overstated — amber text, up-arrow icon (score too high)
- ▼ Understated — blue text, down-arrow icon (score too low)
- ⊘ No evidence — grey text, empty circle icon

**"Accept suggestions" button:**
When clicked, updates the feature's question answers to the AI's suggested values. Scores recalculate automatically. Shows a toast: "Scoring updated based on AI audit. Undo?" with 10-second undo window.

**"Dismiss" button:**
Keeps the PM's original scores. The audit result stays visible but greyed out with a "Dismissed" label. The PM can re-audit later if they upload more context.

#### Release-level audit report

In the Reports tab, a new section appears between "Conflict Analysis" and "Appendix":

**Strategic alignment matrix:**
```
Feature              OKRs        Customers   Revenue   Roadmap
─────────────────────────────────────────────────────────────
SSO Integration     Aligned(2)  12 mentions  3 deals   No conflict
Bulk CSV Export     None found  4 mentions   0 deals   No conflict
AI Search           Aligned(1)  0 mentions   0 deals   ⚠ Conflicts with Q4 deprecation
```

**Cross-feature conflicts section:**
```
DUPLICATE COVERAGE
• "Bulk CSV Export" and "Custom Webhook Endpoints" both address data
  extraction needs. Consider if one subsumes the other.
  Source: support_tickets.csv (rows 45, 67, 89)

SCORING INCONSISTENCY
• "Dark Mode" is ranked #6 by RICE but has 23 customer mentions —
  more than any other feature. Reach may be understated.
  Source: nps_comments.csv (23 mentions)

UNSUPPORTED MUST-HAVE
• "Custom Webhooks" is "Must have" but only 3 accounts requested it.
  Verify that the customer commitment is still active.

MISSING OKR COVERAGE
• OKR: "Reduce time-to-value below 24 hours" — no features in this
  release directly address this objective.
  Source: Q3_OKRs.pdf, p.2
```

### V2.1: Release audit (detailed)

- Export the complete audit report as PDF (including AI findings, citations, charts)
- Audit diff: compare two audit runs side-by-side to see how scores changed after adding context
- Audit history: log of all audits with timestamps, useful for tracking how priorities evolved

### V2.2: Collaboration (detailed)

**Backend stack:**
- Hosting: Vercel (Next.js) or Railway (Express/Hono)
- Database: PostgreSQL (Supabase or Neon — serverless, free tier)
- Auth: Clerk or NextAuth (email + Google SSO)
- File storage: Cloudflare R2 (for context documents)

**Team features:**
- Invite by email → creates team workspace
- Shared releases visible to all team members
- Role-based permissions: Owner (full control), Editor (can score), Viewer (read-only)
- Comment threads on individual features (like Linear's comment system)
- @mentions in comments
- Activity feed: "Sarah changed SSO Integration from Should to Must"
- Audit history: "AI audit run on April 28 — 3 scores adjusted"

**Pricing tiers (future):**
- Free: 3 releases, 20 features per release, no AI, no collaboration
- Pro ($15/user/mo): Unlimited releases/features, AI auditor, 1 team workspace
- Enterprise ($30/user/mo): Multiple workspaces, SSO, audit export, priority support

### V2.3: Integrations (detailed)

**Jira import:**
- OAuth2 connection to Jira Cloud
- Import flow: Select project → Select board/sprint → Select issues → Import as features
- Mapping: Jira issue summary → feature name. Other fields (priority, story points) pre-fill question answers as suggestions.
- Sync: one-way (Jira → PrioritizeHQ). Changes don't write back to Jira.
- Link back: each imported feature shows "Imported from JIRA-1234" with a link

**Linear import:**
- Same flow as Jira. Linear's API is cleaner, so this is likely easier to build.
- Map Linear priority (Urgent/High/Medium/Low/None) to Q5 answers as suggestions.

**Notion import:**
- Import from a Notion database (table or board view)
- Map Notion properties to question answers
- Requires Notion integration token

**Slack integration:**
- "Share to Slack" button in the reports tab
- Posts a formatted summary to a selected channel:
  - Release name, feature count, top 5 features, consensus health
  - Link back to PrioritizeHQ report
- Optional: Slack bot that notifies when an audit completes or a release is finalized

---

## Non-functional requirements

- **Performance:** <16ms score recalculation. 50+ features no jank. Charts <300ms render. Lighthouse performance 90+.
- **Accessibility:** WCAG 2.1 AA. Full keyboard navigation (all interactive elements reachable via Tab). ARIA labels on all buttons, icons, badges. Screen reader friendly tables (proper `<th>` scope, `role` attributes). Color + icon + text label for all status indicators (never color alone). Focus rings on all interactive elements (2px solid, offset 2px). Skip-to-content link. Reduced motion support (`prefers-reduced-motion` media query disables all animations).
- **Browsers:** Latest 2 versions of Chrome, Firefox, Safari, Edge. No IE11 support.
- **Bundle size:** Target <200KB initial JS (gzipped). Code-split: workspace route lazy-loaded. Recharts lazy-loaded only when dashboard/reports tabs are active. Tree-shake lucide icons.
- **Offline:** V1 works fully offline after first load (all client-side, localStorage). Service worker for asset caching (V1.1). Add to Home Screen / PWA manifest (V1.1).
- **Privacy:** No telemetry on user content (feature names, scores, descriptions, release names). Analytics tracks only page views and generic event counts (see Analytics Events section). No cookies. No third-party trackers. V2 context documents sent to AI API only during active audit — never stored server-side.
- **Print:** Reports tab has a dedicated print stylesheet. `@media print` hides: navigation, sidebar, interactive buttons, tooltips, animations. Ensures: clean page breaks between report sections, proper margins (2cm), charts render as static images, fonts embed correctly, black-and-white friendly (all status indicators have text labels in addition to color).
- **SEO / social sharing:** Open Graph meta tags: `og:title` ("PrioritizeHQ — Feature Prioritization Scorer"), `og:description` ("Score features through RICE, ICE, and MoSCoW. See where your frameworks agree and disagree."), `og:image` (1200×630 preview image showing a sample dashboard). Twitter card: `summary_large_image`. Canonical URL. Clean URL structure with no hash fragments for primary navigation.
- **Security (V2):** API key stored server-side only (env variable). HTTPS enforced. No PII stored in analytics. Content Security Policy headers. Rate limiting on API proxy (100 req/hour per user).
- **Internationalization:** V1 is English only. All user-facing strings are extracted to a constants file (not hardcoded in components) to enable future i18n. Date formatting uses `date-fns` locale support. Number formatting uses `Intl.NumberFormat`.

---

## README specification

The README.md is the first thing a visitor sees on GitHub. It must sell the product AND guide contributors.

### Structure

```markdown
# PrioritizeHQ

> Score features through RICE, ICE, and MoSCoW — see where your
> frameworks agree and disagree.

[screenshot of dashboard — full width, high quality]

## What is this?

One paragraph explaining the problem and solution. Link to live demo.

## Features

- Score features using 5 simple questions
- Three frameworks calculated simultaneously (RICE, ICE, MoSCoW)
- Consensus signal shows where frameworks agree or conflict
- Priority matrix, score distribution, framework heatmap
- Auto-generated executive summary and conflict analysis
- Export as Markdown, CSV, JSON, or print-ready PDF
- Fully offline — all data stays in your browser
- Keyboard shortcuts for power users

## Screenshots

[Dashboard screenshot]
[Rankings table screenshot]
[Add feature screenshot with question flow]
[Report screenshot]
[Mobile view screenshot]

## Quick start

    git clone https://github.com/RumanParveez/prioritize-hq.git
    cd prioritize-hq
    pnpm install
    pnpm dev

Open http://localhost:5173

## Tech stack

React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand + Recharts

## How the scoring works

Brief explanation of the 5 questions, how they map to frameworks,
and how consensus is calculated. Link to PROJECT.md for full details.

## Roadmap

- [x] V1: Core prioritization tool
- [ ] V2: AI-powered scoring audit (Anthropic Claude)
- [ ] V2.1: Team collaboration
- [ ] V2.2: Jira/Linear/Notion integrations

## Contributing

Link to CONTRIBUTING.md (standard: fork, branch, PR, review).

## License

MIT
```

### Required screenshots (for README and OG image)

Take these screenshots with the sample data loaded:

1. **Dashboard** — full width, all 4 metric cards + all charts visible. This is the hero image.
2. **Rankings table** — 10+ features, sorted by RICE, capacity cutoff visible, one row expanded.
3. **Add feature** — question flow with a feature partially filled in, live score preview showing.
4. **Report** — executive summary + recommended scope list visible.
5. **Mobile** — rankings in card layout on a phone-width viewport.
6. **OG image** — 1200×630, branded. "PrioritizeHQ" logo + a cropped dashboard screenshot + tagline.

---

## Deployment configuration

### Vercel (recommended for V1)

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### GitHub Pages (alternative)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Set `base` in `vite.config.ts` to the repo name if deploying to `username.github.io/repo-name/`.

### Environment variables

```
# V1 — none required (fully client-side)

# V2 — required for AI features
ANTHROPIC_API_KEY=sk-ant-...       # server-side only, never in browser
PLAUSIBLE_DOMAIN=prioritizehq.com  # for analytics
```

---

## Development workflow

### Getting started

```bash
git clone https://github.com/RumanParveez/prioritize-hq.git
cd prioritize-hq
pnpm install
pnpm dev           # http://localhost:5173
pnpm test          # run unit tests
pnpm test:watch    # run tests in watch mode
pnpm build         # production build
pnpm preview       # preview production build locally
pnpm lint          # eslint + typescript checks
```

### Branch strategy

- `main` — production. Deployed on every push.
- `dev` — integration branch. PRs merge here first.
- Feature branches: `feat/dashboard-charts`, `feat/rankings-table`, etc.
- Milestone branches: `milestone/m1-engine`, `milestone/m2-shell`, etc.

### Commit convention

```
feat: add score distribution chart
fix: correct RICE calculation for zero effort edge case
style: update consensus badge colors
refactor: extract scoring logic to pure functions
test: add consensus edge case tests
docs: update README with screenshots
chore: upgrade dependencies
```

### Code quality

- **ESLint:** `@typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y`
- **Prettier:** format on save. Tab width 2. Single quotes. Trailing commas.
- **TypeScript:** `strict: true`. No `any` types in engine code. `any` allowed sparingly in UI code with `// eslint-disable` comment and justification.
- **Vitest:** run on pre-commit (via `lint-staged` + `husky`). CI blocks merge if tests fail.

---


## Mapping tables (mappings.ts) — complete lookup tables

Exact lookup tables for converting question answers to framework inputs. Implement as `Record<EnumType, number>` constants.

```typescript
// Q1 → RICE reach multiplier
export const SCOPE_REACH_MULTIPLIER: Record<CustomerScope, number> = {
  all: 1.0,
  enterprise: 0.6,
  committed: 0.2,
  internal: 0.1,
};

// Q1 → ICE impact modifier (added to Q2-derived impact)
export const SCOPE_ICE_MODIFIER: Record<CustomerScope, number> = {
  all: 2,
  enterprise: 1,
  committed: 0,
  internal: -1,
};

// Q2 → RICE impact
export const VALUE_RICE_IMPACT: Record<ValueDelivered, number> = {
  transformative: 3,
  significant: 2,
  moderate: 1,
  minor: 0.5,
  negligible: 0.25,
};

// Q2 → ICE impact (base, before Q1 modifier)
export const VALUE_ICE_IMPACT: Record<ValueDelivered, number> = {
  transformative: 10,
  significant: 8,
  moderate: 6,
  minor: 4,
  negligible: 2,
};

// Q3 → RICE confidence (percentage)
export const CONFIDENCE_RICE: Record<ConfidenceLevel, number> = {
  validated: 100,
  strong_hunch: 80,
  educated_guess: 50,
  speculative: 30,
};

// Q3 → ICE confidence (1-10)
export const CONFIDENCE_ICE: Record<ConfidenceLevel, number> = {
  validated: 10,
  strong_hunch: 8,
  educated_guess: 5,
  speculative: 2,
};

// Q4 → RICE effort (person-months)
export const COMPLEXITY_RICE_EFFORT: Record<BuildComplexity, number> = {
  trivial: 0.5,
  small: 1,
  medium: 2,
  large: 4,
  massive: 8,
};

// Q4 → ICE ease (1-10)
export const COMPLEXITY_ICE_EASE: Record<BuildComplexity, number> = {
  trivial: 10,
  small: 8,
  medium: 6,
  large: 4,
  massive: 2,
};

// Q5 → MoSCoW category
export const NECESSITY_MOSCOW: Record<StrategicNecessity, MoscowCategory> = {
  customer_commitment: MoscowCategory.Must,
  competitive_table_stakes: MoscowCategory.Must,
  strategic_differentiator: MoscowCategory.Should,
  user_requested: MoscowCategory.Could,
  speculative_bet: MoscowCategory.Could,
  internal_initiative: MoscowCategory.Wont,
};

// Q5 → Consensus weight modifier
export const NECESSITY_CONSENSUS_WEIGHT: Record<StrategicNecessity, number> = {
  customer_commitment: 2,
  competitive_table_stakes: 1,
  strategic_differentiator: 0,
  user_requested: 0,
  speculative_bet: -1,
  internal_initiative: -1,
};

// MoSCoW → quartile-equivalent weight
export const MOSCOW_QUARTILE_WEIGHT: Record<MoscowCategory, 1 | 2 | 3 | 4> = {
  must: 1,
  should: 2,
  could: 3,
  wont: 4,
};

// Display labels for all enums
export const SCOPE_LABELS: Record<CustomerScope, string> = {
  all: 'All accounts', enterprise: 'Enterprise', committed: 'Committed', internal: 'Internal',
};
export const VALUE_LABELS: Record<ValueDelivered, string> = {
  transformative: 'Transformative', significant: 'Significant', moderate: 'Moderate', minor: 'Minor', negligible: 'Negligible',
};
export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  validated: 'Validated (100%)', strong_hunch: 'Strong hunch (80%)', educated_guess: 'Guess (50%)', speculative: 'Speculative (30%)',
};
export const COMPLEXITY_LABELS: Record<BuildComplexity, string> = {
  trivial: 'S — days', small: 'M — weeks', medium: 'L — 1-2mo', large: 'XL — quarter', massive: 'XXL — multi-Q',
};
export const COMPLEXITY_TSHIRT: Record<BuildComplexity, string> = {
  trivial: 'S', small: 'M', medium: 'L', large: 'XL', massive: 'XXL',
};
export const NECESSITY_LABELS: Record<StrategicNecessity, string> = {
  customer_commitment: 'Customer commitment', competitive_table_stakes: 'Competitive table stakes',
  strategic_differentiator: 'Strategic differentiator', user_requested: 'User-requested',
  speculative_bet: 'Speculative bet', internal_initiative: 'Internal initiative',
};
export const NECESSITY_ICONS: Record<StrategicNecessity, string> = {
  customer_commitment: 'Lock', competitive_table_stakes: 'Zap', strategic_differentiator: 'Target',
  user_requested: 'MessageSquare', speculative_bet: 'Sparkles', internal_initiative: 'Home',
};
export const MOSCOW_LABELS: Record<MoscowCategory, string> = {
  must: 'Must have', should: 'Should have', could: 'Could have', wont: "Won't have",
};
export const CONSENSUS_LABELS: Record<ConsensusLevel, string> = {
  strong: 'Strong', mixed: 'Mixed', conflict: 'Conflict',
};
```

---

## localStorage schema — keys and persistence

```
Key: 'prioritize-hq-releases'
Value: JSON string of Release[]

Key: 'prioritize-hq-settings'
Value: JSON string of AppSettings

Key: 'prioritize-hq-ui'
Value: JSON string of partial UIState (only: activeTab, sortKey, sortDirection, viewDensity, showCapacityCutoff)
```

Auto-save: debounce 500ms after any store mutation. Use zustand `persist` middleware with `partialize` to exclude transient state (modals, selection mode, rapid mode).

---

## Toast notification catalog

Toasts appear bottom-right, auto-dismiss after 3 seconds, max 3 stacked.

```
Action                          Message                                          Type
────────────────────────────────────────────────────────────────────────────────────────
Feature added                   "Feature added: {name}"                          success
Feature updated                 "Feature updated"                                 success
Feature deleted                 "Feature removed"                                 neutral
Feature duplicated              "Feature duplicated"                              success
Release created                 "Release created: {name}"                        success
Release deleted                 "Release deleted"                                 neutral
Release finalized               "Release finalized and locked"                   success
Markdown copied                 "Markdown copied to clipboard"                   success
CSV downloaded                  "CSV downloaded"                                  success
JSON exported                   "JSON exported"                                   success
Report link copied              "Report link copied"                             success
Data imported                   "Data imported successfully"                      success
Data cleared                    "All data cleared"                               warning
Storage full                    "Storage full. Export and clear old releases."    error
Import failed                   "Import failed: invalid file"                    error
Clipboard denied                "Couldn't copy. Try again."                      error
URL too long                    "Release too large for URL. Use JSON export."    warning
```

Toast types → colors: success = green left border, warning = amber, error = red, neutral = grey.

---

## Export format specifications (export.ts)

### Markdown export

```markdown
# Release: {releaseName}
**Date:** {date} | **Features:** {count} | **Capacity:** {capacity}

## Prioritized Features

| # | Feature | RICE | ICE | MoSCoW | Consensus | Scope | Impact | Confidence | Effort |
|---|---------|------|-----|--------|-----------|-------|--------|------------|--------|
| 1 | SSO Integration | 3,200 | 560 | Must | Strong | All | Transformative | 100% | M |

---
*Generated by PrioritizeHQ — github.com/RumanParveez/prioritize-hq*
```

### CSV export

```csv
Rank,Feature,RICE Score,RICE Rank,ICE Score,ICE Rank,MoSCoW,Consensus,Customer Scope,Value,Confidence,Complexity,Strategy,Created
1,SSO Integration,3200,1,560,1,Must,Strong,All accounts,Transformative,100%,M - weeks,Customer commitment,2026-04-28
```

### JSON export

Full `Release` object wrapped in:

```json
{
  "version": "1.0.0",
  "exportedAt": "2026-04-28T10:30:00Z",
  "releases": [ ... ]
}
```

---

## URL state encoding specification

For shareable links:

```
https://prioritize-hq.example.com/#/share/{base64url-encoded-json}
```

**Encoding:**
1. Serialize release as minimal JSON (strip `scores` — derivable from inputs, strip timestamps)
2. Base64-encode with `btoa()`
3. If >8KB, use `CompressionStream` (gzip) first
4. Append as URL hash

**Decoding:**
1. Extract hash, base64-decode (or decompress+decode)
2. Parse JSON
3. Recompute all derived scores from inputs
4. Render as **read-only view**: blue banner "Viewing a shared release. Import to edit." + "Import" button. No edit/delete/add buttons visible. Export buttons remain.

**If URL >16KB:** toast "Release too large for URL. Use JSON export." (~40+ features)

---

## Print stylesheet specification (print.css)

```css
@media print {
  /* Hide interactive elements */
  .app-header, .workspace-sidebar, .tab-bar, .table-controls,
  .export-actions, .toast-container, .detail-panel-overlay,
  .btn-add, .btn-delete, .btn-edit, .keyboard-shortcuts-overlay,
  .settings-panel, .share-banner, [data-no-print] { display: none !important; }

  /* Reset layout */
  body { background: white; padding: 0; margin: 0; }
  .workspace-layout { display: block; }
  .main-content { margin: 0; padding: 20px; max-width: 100%; }

  /* Typography — all black */
  * { color: #000 !important; }
  .score-display { font-size: 14px; }

  /* Tables */
  table { border-collapse: collapse; width: 100%; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th { background: #f0f0f0 !important; border-bottom: 2px solid #000; }
  td, th { border: 0.5px solid #ccc; padding: 6px 8px; font-size: 11px; }

  /* Charts */
  .recharts-responsive-container { page-break-inside: avoid; }

  /* Page breaks */
  .report-section { page-break-before: auto; page-break-inside: avoid; }
  .report-header { page-break-after: avoid; }
  .conflict-card { page-break-inside: avoid; }

  /* Capacity cutoff */
  .capacity-cutoff { border-top: 2px dashed #000; }
  .below-capacity { opacity: 0.5; }

  /* Badges — border instead of color fill */
  .consensus-badge, .moscow-badge {
    border: 1px solid #666; background: transparent !important;
  }

  @page { margin: 1.5cm; }
}
```

---

## Drag-and-drop specifications

### Sidebar feature reorder
- Use HTML5 drag-and-drop API (no library)
- Drag start: `dragging` class (opacity 0.5, slight scale 0.98)
- Drop indicator: blue 2px horizontal line between features
- On drop: update `sortOrder`. Only affects sidebar order — NOT framework scores/ranks
- Constraint: within same release only

### Capacity cutoff drag (Rankings table)
- The cutoff line: full-width dashed border between two rows
- Drag handle: grip icon (⋮⋮) centered on line
- Drag: line moves between adjacent rows. Opacity updates in real-time (50% below line)
- Drop: updates `release.capacity` to new position
- Constraint: can't go above row #1 or below last row

---

## Chart interaction specifications

### Score distribution bar chart (Dashboard)
- Hover bar: bar brightens, tooltip: "Feature: {name} | RICE: {score} | ICE: {ice} | {moscow}"
- Click bar: opens FeatureDetailPanel
- Framework toggle (RICE/ICE): bars re-sort with 300ms animation

### Priority matrix scatter (Dashboard)
- Hover dot: grows 1.5×, tooltip: feature name + 3 scores + consensus
- Click dot: opens FeatureDetailPanel
- Quadrant labels: static, always visible, 10% opacity background tints

### Framework heatmap (Dashboard)
- Hover row: highlight entire row
- Click row: opens FeatureDetailPanel
- Cell color: rank #1 = darkest framework color, last rank = lightest
- Δ column icons: hover tooltip shows full consensus explanation

### MoSCoW breakdown bar (Dashboard)
- Hover segment: 2px gap separation, tooltip: "{count} features | {percent}% of total"
- Click segment: switches to Rankings tab with that MoSCoW filter applied

---

## Accessibility specifications

### ARIA roles and labels
```
AppHeader:         role="banner"
WorkspaceSidebar:  role="navigation", aria-label="Release navigation"
TabBar:            role="tablist", each tab: role="tab", aria-selected
Tab panels:        role="tabpanel", aria-labelledby={tab-id}
UnifiedTable:      native <table>, sortable headers with aria-sort
FeatureDetailPanel: role="dialog", aria-modal="true", aria-labelledby={name}
Modal:             role="dialog", aria-modal="true", focus trap
Toast:             role="status", aria-live="polite"
ConsensusTag:      aria-label="Consensus: Strong — all frameworks agree"
RankBadge:         aria-label="Ranked number 1 of 14"
CapacityCutoff:    aria-label="Capacity cutoff. Features below this line will not ship."
```

### Focus management
- Modal/panel open → focus first focusable element inside
- Modal/panel close → return focus to trigger element
- Tab switch → focus moves to tab panel content
- Feature delete → focus next feature (or previous if last)
- Escape → closes topmost overlay

### Screen reader announcements (aria-live)
- Feature added: "Feature {name} added. Ranked {#} of {total}."
- Score recalculated: "Scores updated."
- Sort changed: "Table sorted by {column}, {direction}."
- Filter applied: "Showing {count} of {total} features."

### Color independence
Every status using color MUST also have: an icon (✓/⚠/✗), a text label ("Strong"/"Mixed"/"Conflict"), and WCAG AA contrast (4.5:1 text, 3:1 large text/icons).

---

## Open Graph and meta tags

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>PrioritizeHQ — Feature Prioritization Scorer</title>
<meta name="description" content="Score features through RICE, ICE, and MoSCoW frameworks in one flow. See where they agree, find conflicts, ship what matters." />

<meta property="og:title" content="PrioritizeHQ — Feature Prioritization Scorer" />
<meta property="og:description" content="Score features through three frameworks. See consensus. Ship what matters." />
<meta property="og:image" content="/og-image.png" />
<meta property="og:type" content="website" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="PrioritizeHQ" />
<meta name="twitter:description" content="Feature prioritization with RICE, ICE, and MoSCoW — unified." />
<meta name="twitter:image" content="/og-image.png" />

<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

`og-image.png`: 1200×630px screenshot of the Rankings table with sample data.

---

## README.md template

```markdown
# PrioritizeHQ

> Score features through RICE, ICE, and MoSCoW frameworks in one flow. See where they agree. Ship what matters.

## What is this?

PrioritizeHQ is a prioritization tool for enterprise PMs who need to defend feature rankings. Answer 5 intuitive questions per feature, get three framework scores simultaneously, plus a consensus signal showing where frameworks agree and disagree.

## Features

- **5-question scoring** — PM language in, framework scores out
- **Unified rankings** — RICE, ICE, MoSCoW side by side
- **Consensus detection** — Strong/Mixed/Conflict signals
- **Capacity planning** — set slots, see the cutoff line
- **Dashboard** — impact/effort matrix, score distribution, MoSCoW breakdown
- **Auto-generated reports** — exec summary, conflict analysis, scope recommendations
- **Export** — Markdown, CSV, JSON, print PDF
- **Shareable links** — read-only stakeholder view
- **100% client-side** — no account, no server, no data leaves your browser
- **Keyboard-first** — full shortcuts for power users

## Quick start

Visit [prioritize-hq.example.com](https://prioritize-hq.example.com)

## Self-host

```bash
git clone https://github.com/RumanParveez/prioritize-hq.git
cd prioritize-hq
pnpm install
pnpm dev        # localhost:5173
pnpm build      # production → dist/
```

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Zustand · Recharts · Lucide Icons. No backend.

## How scoring works

| Question | → RICE | → ICE | → MoSCoW |
|----------|--------|-------|----------|
| Customer scope | Reach multiplier | Impact modifier | — |
| Value delivered | Impact (0.25-3) | Impact (1-10) | — |
| Confidence | Confidence % | Confidence (1-10) | — |
| Build complexity | Effort (months) | Ease (1-10) | — |
| Strategic necessity | — | — | Category |

**Consensus** = where all three frameworks land in the same quartile.

## Roadmap

- [x] V1: Three-framework scoring + consensus
- [ ] V2: AI auditor — evidence-based scoring audit
- [ ] V2.1: Release-level audit + strategic alignment
- [ ] V2.2: Team collaboration
- [ ] V2.3: Jira / Linear / Notion integrations

## License

MIT

## Author

[@RumanParveez](https://github.com/RumanParveez)
```

---

## Error handling patterns

```
Scenario                         Handling
──────────────────────────────────────────────────────────────────
localStorage write fails          Toast: "Couldn't save. Storage may be full."
localStorage read fails/corrupt   Fall back to empty state. Toast: "Data couldn't be loaded."
JSON import parse error           Toast: "Import failed: file is not valid PrioritizeHQ data."
JSON import schema mismatch       Toast: "Import failed: data format not recognized."
Clipboard API denied              Toast: "Clipboard denied. Select and copy manually."
URL hash decode fails             Redirect to home. Toast: "Shared link may be invalid."
Score returns NaN/Infinity        Clamp to 0. Log to console. Never show NaN in UI.
Feature name empty on submit      Shake input + red border. Focus input. No toast.
Capacity ≤ 0                      Reject. Keep previous value. Inline validation.
```

**React error boundaries:** Wrap Dashboard, Rankings, Reports, AddEdit each in an error boundary. On crash: "Something went wrong" + "Reload" button + "Report issue" link. Other sections remain functional.
