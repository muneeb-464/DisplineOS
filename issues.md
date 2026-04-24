# App Issues & Feature Requests

---

## Issue 1 — Point Scoring Logic (Productive vs Wasted Hours)

**Problem:**
The point system does not correctly calculate scores based on duration. If a user sets 2 points for 1 hour of productive work, the score should be calculated proportionally per minute (i.e., per-minute score = points ÷ 60). For example, if a productive block is only 0.5 hours (30 minutes), the score added should be 1 point (not the full 2). The per-minute rate should be: `2 ÷ 60 = 0.0333 points/minute`, so a 30-minute block = `0.0333 × 30 = 1 point`.

**Expected Behavior:**
- Score must be calculated proportionally based on actual duration of the block.
- Formula: `score = (pointsPerHour / 60) × durationInMinutes`
- This applies to both **productive** and **wasted** hour point settings.

---

## Issue 2 — Overlapping Blocks in Planner/Log Page

**Problem:**
When adding blocks to the planner/log page, blocks are overlapping each other visually even when they represent different time slots. For example, if a 1-hour slot exists and the user adds a 30-minute block, then a 45-minute block starting before the first one ends, the blocks visually overlap instead of stacking or being rejected/adjusted.

**Expected Behavior:**
- Blocks must be fully responsive and rendered in a synchronized, non-overlapping layout.
- If a block overlaps with an existing block, either:
  - Prevent the overlap and show a warning, **or**
  - Render overlapping blocks side-by-side within the time slot.
- The planner must visually display all blocks accurately within their correct time boundaries.

---

## Issue 3 — Analytics Page: Daily Hours Chart Missing "Routine" Bar

**Problem:**
The daily hours bar chart on the Analytics page currently shows only two bars: **Productive** and **Wasted**. A third category — **Routine** — is missing from the chart.

**Expected Behavior:**
- Add a third bar **"Routine"** to the daily hours bar chart.
- The chart should display three bars per day/entry: **Productive**, **Wasted**, and **Routine**.
- Ensure the chart legend is updated to reflect all three categories with distinct colors.

---

## Issue 4 — Analytics Page: Time Breakdown Tooltip & Category UI

**Problem:**
Two sub-issues on the Analytics page time breakdown (pie chart):

**4a — Tooltip Visibility:**
- When hovering over a slice in the pie chart, the tooltip shows text (e.g., "Working on Project") in **black color on a dark/black background**, making it completely unreadable.

**4b — Category Legend Layout:**
- The category labels shown below the pie chart are not organized properly. They appear in an unstructured, unsynchronized way.

**Expected Behavior:**
- **4a:** Tooltip text must be visible — use a light/white text color or a light-colored tooltip background when in dark mode.
- **4b:** Categories should be displayed in a clean **list format** (e.g., a structured grid or vertical list with color indicators, label, and percentage/time value).

---

## Issue 5 — Theme Changer Button Hidden on Small Screens

**Problem:**
The theme toggle/changer button disappears or becomes hidden when the screen size is reduced (mobile/small screen view).

**Expected Behavior:**
- The theme changer button must remain **visible and accessible** on all screen sizes.
- Ensure it is included in the mobile navigation or header layout and does not get hidden by overflow or display rules.

---

## Issue 6 — Reflection Page: Responsiveness & Custom Date Selection

**Problem:**
Two sub-issues on the Reflection page:

**6a — Not Fully Responsive:**
- The Reflection page does not display correctly on smaller screens. Content may be cut off, overflow, or become unreadable.

**6b — Missing Date Selection & Points Display:**
- The page lacks a functional custom date selector.
- When a specific date/period is selected, the **points earned** for that period should be displayed clearly on the page.

**Expected Behavior:**
- **6a:** Make the Reflection page fully responsive for all screen sizes. Content must be clearly readable on mobile.
- **6b:** Add a date range/period selector to the Reflection page. Upon selection, display the relevant points/score for the chosen period.

---

## Issue 7 — Settings Page: Point Changes Not Saved or Applied

**Problem:**
On the Settings page, when a user changes the point values (e.g., sets 5 points for a productive day or modifies daily goals), the changes appear to update visually on the Settings page but are **not persisted or applied** elsewhere in the app. When the user navigates to the Daily Planner or Log page and adds a block, it still uses the **old/previous point values**.

**Expected Behavior:**
- Add a **"Save"** button on the Settings page for point/goal configurations.
- When the user clicks Save, the new settings must be:
  - Persisted to storage (localStorage or database).
  - Applied immediately across the entire app (Daily Planner, Log page, Analytics, etc.).
- Until the user clicks Save, changes should remain in a "pending" state and not affect other pages.
- After saving, a confirmation message should be shown (e.g., "Settings saved successfully").

---

*Document created: April 24, 2026*
*Total Issues: 7 (including sub-issues)*