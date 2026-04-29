# PrioritizeHQ — User Guide

> **Score features. See consensus. Ship what matters.**
>
> PrioritizeHQ is a feature prioritization tool for product managers. It scores features using three industry frameworks — RICE, ICE, and MoSCoW — answers five plain-language questions, and shows you where the frameworks agree (and where they don't).

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Home Screen](#2-home-screen)
3. [Creating a Release](#3-creating-a-release)
4. [The Workspace](#4-the-workspace)
5. [Sidebar — Release Overview](#5-sidebar--release-overview)
6. [Add / Edit Tab — Scoring Features](#6-add--edit-tab--scoring-features)
7. [Understanding the Scores](#7-understanding-the-scores)
8. [Dashboard Tab — Visual Overview](#8-dashboard-tab--visual-overview)
9. [Rankings Tab — Compare & Decide](#9-rankings-tab--compare--decide)
10. [Reports Tab — Stakeholder-Ready Output](#10-reports-tab--stakeholder-ready-output)
11. [Exporting Your Work](#11-exporting-your-work)
12. [Sharing a Release](#12-sharing-a-release)
13. [Finalizing a Release](#13-finalizing-a-release)
14. [Keyboard Shortcuts](#14-keyboard-shortcuts)
15. [Tips & Best Practices](#15-tips--best-practices)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Getting Started

### First Launch

When you open PrioritizeHQ for the first time, three demo releases are loaded automatically so you can explore every feature immediately:

| Release | Status | Features | Purpose |
|---------|--------|----------|---------|
| Q3 2026 Launch | Draft | 8 | Full-featured demo with capacity cutoff and conflicts |
| Mobile App v2 | In Review | 6 | Mid-review release for exploring rankings |
| Internal Tools Sprint | Finalized | 4 | Shows the locked/read-only finalized state |

Your data is saved in your browser's local storage automatically. There is no login or server — everything stays on your machine.

### Data Persistence

All changes are saved to `localStorage` instantly. If you clear your browser data, your releases will be lost. Use the **Export** feature to back up important releases (see [Exporting Your Work](#11-exporting-your-work)).

---

## 2. Home Screen

The home screen is your dashboard of all releases.

### What You See

- **Header**: PrioritizeHQ logo, settings icon, and help icon (`?` opens keyboard shortcuts)
- **Stats bar** (when you have releases): total features scored, release count, dominant consensus signal, and last active release
- **Release cards**: a grid of all your releases, each showing:
  - Release name (hover to see "Open →")
  - Target date (relative, e.g. "in 5 months")
  - Feature count pill
  - Status badge: **Draft** (gray), **In Review** (amber), **Finalized** (green ✓)
  - Consensus bar: a stacked horizontal bar showing the proportion of Strong (green), Mixed (amber), and Conflict (red) features
  - Last edited timestamp
- **"+ New release" card**: dashed-border card to create a new release

### Navigation

- **Click any release card** to open it in the full workspace view
- **Press `1`–`9`** to quickly open a release by its position in the grid
- **Press `N`** to open the New Release dialog

---

## 3. Creating a Release

Click the **"+ New release"** card or press **`N`** to open the creation dialog.

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| **Release name** | Yes | A descriptive name (e.g. "Q3 2026 Launch", "Mobile v2") |
| **Target date** | No | When you plan to ship. Shown as relative time on cards |
| **Capacity** | No | How many features fit in this release. Enables the capacity cutoff line in Rankings and Reports |
| **Description** | No | Optional notes about goals, constraints, or context |

### Quick Tips

- You can always edit these fields later from the sidebar
- Capacity is especially useful — set it to see which features make the cut and which get deferred
- Press **Escape** or click the backdrop to cancel

---

## 4. The Workspace

When you open a release, you enter the **workspace** — a two-panel layout:

- **Left sidebar** (240px): release info, feature list, actions
- **Main area**: four tabs — Dashboard, Rankings, Add/Edit, Reports

The tab bar sits at the top of the main area. Click any tab or use **Enter**/**Space** when focused on a tab button.

Each tab is wrapped in an **error boundary** — if something goes wrong, you'll see a friendly error message with a "Reload" button instead of a blank screen.

---

## 5. Sidebar — Release Overview

The sidebar gives you a constant view of the release and its features.

### Release Info

- **Release name**: click to edit inline (Enter or click away to save)
- **Status badge**: shows current status with icon
- **Target date**: click to set or change
- **Capacity**: click to set (shows as "{n} points")
- **Description**: shown truncated to 2 lines; click to expand

> **Note**: When a release is **Finalized**, all editing is disabled. The name, date, capacity, and features become read-only.

### Feature List

All features in the release are listed with:
- **Colored dot**: green (Strong consensus), amber (Mixed), red (Conflict)
- **Feature name** (truncated if long)
- **RICE rank pill** (e.g. "#1", "#2")
- **Delete button** (✕): appears on hover, removes the feature

**Click any feature** to jump to the Add/Edit tab with that feature loaded for editing.

### Drag-and-Drop Reordering

You can **drag features** in the sidebar to reorder them. This updates the sort order without affecting scores or ranks.

- **Drag**: grab a feature row and move it up or down
- **Drop indicator**: a blue line shows where the feature will land
- **Disabled**: drag-and-drop is turned off for Finalized releases

### Footer Actions

| Button | What it does |
|--------|-------------|
| **Export ▾** | Dropdown: Markdown, CSV, JSON, Print |
| **Share** | Generates a share link and copies it to clipboard |
| **Finalize** | Opens confirmation dialog to lock the release |

---

## 6. Add / Edit Tab — Scoring Features

This is where you score features. The left panel has the form; the right panel shows the feature queue.

### Adding a Feature

1. **Type a feature name** in the input field (e.g. "AI-powered search")
2. **Answer five questions** about the feature (see below)
3. **Watch the live preview** — RICE, ICE, and MoSCoW scores update in real-time as you answer
4. Click **"Add feature"** or press **Cmd/Ctrl + Enter**

### The Five Questions

#### Q1: "Who does this impact?"
Choose the customer scope:

| Option | Meaning | RICE Reach |
|--------|---------|-----------|
| All accounts | Every user | 10,000 |
| Enterprise | Large/paying accounts | 5,000 |
| Committed accounts | Existing engaged users | 2,000 |
| Internal | Team-only | 500 |

#### Q2: "How much does this improve their workflow?"
Choose the value level (shown with intensity bars):

| Option | Description | Bars |
|--------|------------|------|
| Transformative | Changes how they work | █████ |
| Significant | Removes a major pain point | ████░ |
| Moderate | Noticeable improvement | ███░░ |
| Minor | Quality of life | ██░░░ |
| Negligible | Barely noticeable | █░░░░ |

#### Q3: "How sure are you this is right?"
Choose your confidence level:

| Option | Meaning |
|--------|---------|
| Validated 100% | Backed by data, research, or commitments |
| Strong hunch 80% | Good signals but not proven |
| Guess 50% | Intuition-based |
| Speculative 30% | Unvalidated bet |

#### Q4: "How hard is this to ship?"
Choose build complexity (t-shirt sizing):

| Size | Timeframe |
|------|-----------|
| S | Days |
| M | Weeks |
| L | 1–2 months |
| XL | A quarter |
| XXL | Multi-quarter |

#### Q5: "Why does this need to exist?"
Choose the strategic necessity (shown with icons):

| Option | Description | Icon |
|--------|------------|------|
| Customer commitment | Promised contractually | 🔒 |
| Competitive table stakes | Losing deals without it | ⚡ |
| Strategic differentiator | Your unique angle | 🎯 |
| User-requested | Nice to have | 💬 |
| Speculative bet | Unvalidated | ✨ |
| Internal initiative | Not customer facing | 🏠 |

### Live Score Preview

As you answer, the right side of the form shows animated score previews:
- **RICE score** (number animates up/down)
- **ICE score** (number animates up/down)
- **MoSCoW category** (color-coded: Must = green, Should = blue, Could = amber, Won't = gray)

### Rapid Mode

Toggle **"Rapid mode"** to score multiple features at once:
- The name field becomes a multi-line textarea
- Type **one feature name per line**
- All features get the same scoring answers
- Great for batch-adding features from a backlog

### Editing a Feature

- Click a feature in the **sidebar** or **feature queue** to load it into the form
- Modify any answers
- Click **"Save changes"** or press **Cmd/Ctrl + Enter**
- Click **"Cancel"** or **"Clear"** to discard changes

### Feature Queue (Right Panel)

The right panel shows all features sorted by RICE score (highest first). Each card displays:
- Feature name
- RICE score, ICE score, MoSCoW badge, and consensus indicator
- Edit (pencil) and Delete (trash) buttons

New features slide in with a smooth animation.

### Validation

If you try to add a feature with an **empty name**, the input field will shake and turn red. No toast — just fix the name and try again.

---

## 7. Understanding the Scores

PrioritizeHQ calculates three framework scores from your five answers.

### RICE Score

**RICE** = (Reach × Impact × Confidence) ÷ Effort

| Factor | Source | Values |
|--------|--------|--------|
| Reach | Customer scope | all = 10,000 · enterprise = 5,000 · committed = 2,000 · internal = 500 |
| Impact | Value delivered | transformative = 3 · significant = 2 · moderate = 1 · minor = 0.5 · negligible = 0.25 |
| Confidence | Confidence level | validated = 1.0 · strong hunch = 0.8 · guess = 0.5 · speculative = 0.3 |
| Effort | Build complexity | S = 0.25mo · M = 0.5mo · L = 2mo · XL = 3mo · XXL = 6mo |

**Example**: "AI-powered search" with All accounts (10,000) × Transformative (3) × Validated (1.0) ÷ L (2) = **15,000**

### ICE Score

**ICE** = Impact × Confidence × Ease

| Factor | Source | Values |
|--------|--------|--------|
| Impact | Value + scope modifier | Base: transformative=10, significant=8, moderate=6, minor=4, negligible=2. Modifier: all=+1, enterprise=0, committed=-1, internal=-2. Clamped to 1–10 |
| Confidence | Confidence level | validated=10, strong hunch=8, guess=5, speculative=3 |
| Ease | Build complexity (inverted) | S=10, M=8, L=5, XL=3, XXL=1 |

### MoSCoW Category

MoSCoW is determined by your answer to **Q5 (Strategic necessity)**:

| Necessity | Category |
|-----------|----------|
| Customer commitment | **Must** |
| Competitive table stakes | **Must** |
| Strategic differentiator | **Should** |
| User-requested | **Could** |
| Speculative bet | **Won't** (if speculative confidence) or **Could** (otherwise) |
| Internal initiative | **Won't** |

### Consensus Signal

After all features are scored, PrioritizeHQ compares the three framework rankings:

| Signal | Meaning | When |
|--------|---------|------|
| **Strong** ✓ | All frameworks agree | RICE quartile = ICE quartile = MoSCoW quartile |
| **Mixed** ⚠ | Partial agreement | Not Strong and not Conflict |
| **Conflict** ✗ | Frameworks disagree | RICE says top half but ICE says bottom half (or vice versa), or Must-have ranked low by both RICE and ICE |

> **Why Consensus matters**: A feature with Strong consensus is a safe bet. A Conflict feature signals that the team needs to discuss — one framework loves it, another doesn't. This is where prioritization discussions become most valuable.

---

## 8. Dashboard Tab — Visual Overview

The Dashboard gives you a bird's-eye view of all scored features.

### Metric Cards (Top Row)

| Card | Shows |
|------|-------|
| **Features scored** | Total count |
| **Avg RICE score** | Average with median comparison (flagged if median deviates >30%) |
| **Capacity used** | Progress bar against capacity (green under, red over) |
| **Consensus health** | Mini donut chart + agreement percentage |

### Charts

#### Score Distribution (Bar Chart)
- Horizontal bars showing each feature's score
- Toggle between **RICE** and **ICE** views
- Bars colored by consensus (green/amber/red)
- Capacity cutoff reference line shown if set
- **Click any bar** to open the Feature Detail Panel

#### Priority Matrix (Scatter Plot)
- X-axis: Easy → Hard (build complexity)
- Y-axis: Impact (low → high)
- Bubble size = RICE score
- Color = consensus signal
- Quadrant labels help interpretation:
  - **Quick wins** ↖ (easy + high impact)
  - **Big bets** ↗ (hard + high impact)
  - **Fill-ins** ↙ (easy + low impact)
  - **Money pits** ↘ (hard + low impact)
- **Click any dot** to see details

#### Framework Heatmap (Table)
Shows RICE rank, ICE rank, MoSCoW, and Consensus for each feature. Sorted by consensus (Conflicts shown first). Click any row for details.

#### MoSCoW Breakdown (Stacked Bar)
Visual split of Must/Should/Could/Won't with counts. Includes capacity insight text (e.g. "3 must-haves consume 60% of capacity").

### Feature Detail Panel

Click any chart element to open a **slide-in panel** from the right showing:
- Feature name, consensus badge, MoSCoW badge
- Three score summary cards (RICE, ICE, MoSCoW with ranks)
- Full score derivation math (expandable accordion)
- Input summary table
- Mini histogram of all features' scores with the current one highlighted
- Footer actions: **Edit scoring**, **Duplicate**, **Delete**
- Press **Escape** to close

---

## 9. Rankings Tab — Compare & Decide

The Rankings tab is a sortable, filterable table of all features. This is where you make the final call.

### Controls Bar

| Control | What it does |
|---------|-------------|
| **Sort dropdown** | Sort by Consensus, RICE, ICE, MoSCoW, Date added, Name, Scope, Impact, Confidence, Effort |
| **Filter pills** | Multi-select: All, Must, Should, Could, Won't, Strong, Mixed, Conflict |
| **Search** | Filters by feature name (debounced 300ms) |
| **Compact / Comfortable** | Toggle row density |
| **Capacity cutoff** | Checkbox to show/hide the cutoff line |
| **Select** | Enter bulk mode for multi-delete |

### Table Columns

Click any column header to sort. Click again to reverse direction. An arrow indicator shows current sort.

| Column | Content |
|--------|---------|
| **#** | Rank number (top 3 get special circular badges) |
| **Feature** | Name + date added. Click to expand inline details |
| **Consensus** | Colored pill with tooltip explaining why |
| **RICE** | Score + rank position with quartile color |
| **ICE** | Score + rank position with quartile color |
| **MoSCoW** | Color-coded bordered pill |
| **Scope** | Customer scope label |
| **Impact** | Colored dot + label |
| **Confidence** | Percentage |
| **Effort** | T-shirt size (S/M/L/XL/XXL) |
| **Actions** | Edit, Duplicate, Delete (visible on hover) |

### Capacity Cutoff

When capacity is set and the cutoff checkbox is on:
- A **dashed red line** appears between the features that fit and those that don't
- Features below the line are shown at **50% opacity**
- The line has a **⋮⋮ drag handle** — drag it up or down to adjust capacity in real-time

### Inline Feature Detail

Click a feature name to expand an inline detail panel showing:
- RICE derivation (formula + values)
- ICE derivation (formula + values)
- MoSCoW category + strategic necessity
- Rank visualization (thermometer bars for RICE and ICE positions)

### Bulk Operations

1. Click **"Select"** to enter selection mode
2. Check features you want to act on
3. Click **"Delete {n}"** to remove selected features

---

## 10. Reports Tab — Stakeholder-Ready Output

The Reports tab generates a **comprehensive, print-ready report** that you can share with stakeholders.

### Report Sections

#### 1. Executive Summary
An auto-generated paragraph covering: total features, MoSCoW category distribution, capacity fit, consensus health percentage, conflict count, and the top-ranked feature.

#### 2. Recommended Scope
A ranked table with capacity cutoff line. Features below capacity shown at 50% opacity with "defer" label.

> ⚠ **Warning banner**: If any Must-have features fall below the capacity cutoff, a prominent warning is displayed.

#### 3. Framework Comparison
Full comparison table with RICE score, RICE rank, ICE score, ICE rank, MoSCoW, and Consensus for every feature. Alternating row backgrounds for readability.

#### 4. Conflict Analysis
For each feature with **Conflict** consensus:
- Score citations (RICE rank, ICE rank, MoSCoW)
- Plain-language explanation of why frameworks disagree
- **Discussion prompt** to guide team conversations

#### 5. Visualizations
- RICE score distribution bar chart (colored by consensus)
- Consensus health donut chart
- MoSCoW breakdown stacked bar with counts

#### 6. Appendix — Full Data
Complete data table with all five input answers and all scores for every feature.

---

## 11. Exporting Your Work

### From the Reports Tab

| Format | Button | What You Get |
|--------|--------|-------------|
| **PDF** | Export PDF | Opens print dialog (browser print → save as PDF). Print CSS hides sidebar, tabs, and action buttons |
| **Markdown** | Export Markdown | Downloads `prioritize-hq-{name}.md` with the full report in Markdown format |
| **CSV** | Export CSV | Downloads `prioritize-hq-{name}.csv` with one row per feature and all scores |
| **JSON** | Export JSON | Downloads `prioritize-hq-{name}.json` with the complete release data structure |

### From the Sidebar

The **Export ▾** dropdown in the sidebar footer offers the same formats.

### Tips for PDF Export

For best results when exporting PDF:
1. Click **Export PDF** (this triggers `Ctrl+P` / print dialog)
2. Set destination to **"Save as PDF"**
3. Set margins to **"None"** or **"Minimum"**
4. The print stylesheet automatically hides the sidebar, tab bar, and action buttons

---

## 12. Sharing a Release

### Sending a Share Link

1. Open the release you want to share
2. Click the **"Share"** button in the sidebar footer
3. A link is **copied to your clipboard** automatically
4. Send the link to your teammate via chat, email, etc.

The share link embeds the entire release data in the URL (base64-encoded). No server needed.

### Receiving a Shared Release

1. Open the shared link in your browser
2. A modal appears: **"Shared release detected"**
3. Click **"Import release"** to add it as a new release in your workspace
4. Or click **"Dismiss"** to ignore

> **Note**: Imported releases are independent copies. Changes you make won't affect the sender's version.

---

## 13. Finalizing a Release

When your prioritization is complete:

1. Click **"Finalize"** in the sidebar footer
2. A confirmation dialog appears: *"Finalize this release? This will lock scores and mark the release as complete."*
3. Click **"Finalize"** to confirm, or **"Cancel"** / press **Escape** to abort

### What Happens When Finalized

- Status changes to **"✓ Finalized"** (green badge)
- **All editing is disabled**: release name, date, capacity, and descriptions become read-only
- **Feature scoring is locked**: the Add/Edit tab form won't save changes
- **Feature list is locked**: no adding, deleting, or reordering features
- **Export and Share still work**: you can still generate reports and share links
- **Dashboard and Rankings still work**: all viewing and analysis features remain available

> **Tip**: Finalize a release when the team has agreed on the prioritization. This creates a snapshot that won't accidentally get changed.

---

## 14. Keyboard Shortcuts

Press **`?`** anywhere to see all shortcuts in an overlay.

| Key | Where | Action |
|-----|-------|--------|
| `N` | Home screen | Open New Release dialog |
| `1`–`9` | Home screen | Open release by grid position |
| `?` | Anywhere | Toggle keyboard shortcuts overlay |
| `Escape` | Anywhere | Close the topmost modal, panel, or overlay |
| `Cmd/Ctrl + Enter` | Add/Edit tab | Submit the current feature |
| `Enter` or `Space` | Tab bar | Activate the focused tab |
| `Tab` / `Shift+Tab` | Inside modals | Cycle focus within the modal (focus trap) |

---

## 15. Tips & Best Practices

### Scoring Tips

1. **Score consistently**: Use the same mental model for all features. "Transformative" should mean the same thing for feature #1 and feature #20.

2. **Be honest about confidence**: It's tempting to mark everything as "Validated." If you don't have user research or data backing it, choose "Guess" or "Speculative." The scoring math rewards honesty.

3. **Use Rapid Mode for backlogs**: If you have 20+ features to add, use Rapid Mode to batch-add names, then go back and adjust individual scores.

4. **Pay attention to Conflicts**: Conflict features are the most interesting ones in your list. They're where RICE says "do it" but ICE or MoSCoW says "wait" (or vice versa). These deserve team discussion.

### Workflow Tips

5. **Set capacity early**: Even a rough estimate helps. The capacity cutoff line in Rankings and Reports immediately shows you what fits and what doesn't.

6. **Use the Priority Matrix**: The scatter plot on the Dashboard is the fastest way to spot quick wins (top-left quadrant) and money pits (bottom-right).

7. **Share before finalizing**: Use the Share button to send the report to stakeholders. Get feedback, adjust scores, then Finalize.

8. **Export regularly**: Since data lives in `localStorage`, export a JSON backup before clearing browser data.

9. **One release per planning cycle**: Create a fresh release for each sprint, quarter, or launch. Keep historical releases for reference.

### Reading the Report

10. **Start with the Executive Summary**: It gives you the 30-second overview.

11. **Check the Conflict Analysis**: This section tells you exactly where frameworks disagree and suggests discussion questions.

12. **Share the PDF with executives**: The Reports tab is designed to be presentation-ready. Export PDF for stakeholder reviews.

---

## 16. Troubleshooting

### "My data disappeared"

Your data is stored in browser `localStorage`. It can be lost if:
- You cleared browser data / cookies
- You're using a private/incognito window
- A different browser or device

**Prevention**: Export your releases as JSON regularly.

### "Storage may be full" error

If you see this toast, your browser's localStorage is approaching its limit (~5MB). Try:
- Deleting old releases you no longer need
- Exporting and then deleting large releases
- Clearing other site data in your browser

### "Import failed" error

The imported file must be valid PrioritizeHQ JSON (a release object with a `name` field and `features` array). Check that:
- The file wasn't corrupted during transfer
- It's a `.json` file exported from PrioritizeHQ
- The shared link wasn't truncated

### "Clipboard denied" error

Some browsers restrict clipboard access. If you see this:
- Try clicking "Share" again (some browsers prompt for permission)
- Manually copy the URL from the address bar
- Use the Export feature instead

### Scores seem wrong

All scores are deterministic — same inputs always give the same outputs. If a score looks unexpected:
- Check the **inline derivation** in Rankings (click a feature name) to see the exact math
- Remember that RICE divides by effort (so "XXL" effort dramatically reduces RICE)
- ICE applies a scope modifier to impact (internal scope penalizes ICE impact by -2)

---

*PrioritizeHQ — Built for PMs who ship.*
