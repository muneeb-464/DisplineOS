const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const DayData = require("../models/DayData");
const UserSettings = require("../models/UserSettings");

router.use(authMiddleware);

// Issue #5: validate date param is YYYY-MM-DD before touching the DB
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function validateDate(req, res, next) {
  if (!DATE_RE.test(req.params.date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }
  next();
}

// GET /api/data — bulk load all user data (for Zustand initial sync)
router.get("/data", async (req, res) => {
  try {
    const allDayData = await DayData.find({ userId: req.user.id });
    const blocks = allDayData.flatMap((d) => d.blocks);
    const namaz = allDayData.flatMap((d) => d.namaz);
    const reflections = allDayData.flatMap((d) => d.reflections);
    const startedDays = [...new Set(allDayData.flatMap((d) => d.startedDays))];
    res.json({ blocks, namaz, reflections, startedDays });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/data — bulk save all user data (debounced Zustand sync)
router.post("/data", async (req, res) => {
  try {
    const { blocks = [], namaz = [], reflections = [], startedDays = [] } = req.body;
    const userId = req.user.id;

    const dates = [...new Set([
      ...blocks.map((b) => b.date),
      ...namaz.map((n) => n.date),
      ...reflections.map((r) => r.date),
      ...startedDays,
    ].filter(Boolean))];

    // Issue #6: cap dates to prevent write-amplification DoS
    if (dates.length > 90) {
      return res.status(400).json({ error: "Too many dates in a single sync" });
    }

    // Issue #5: reject any date that isn't YYYY-MM-DD
    if (dates.some((d) => !DATE_RE.test(d))) {
      return res.status(400).json({ error: "Invalid date format in payload" });
    }

    await Promise.all(
      dates.map((date) =>
        DayData.findOneAndUpdate(
          { userId, date },
          {
            blocks: blocks.filter((b) => b.date === date),
            namaz: namaz.filter((n) => n.date === date),
            reflections: reflections.filter((r) => r.date === date),
            startedDays,
          },
          { upsert: true, new: true }
        )
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/data/:date — single day data
router.get("/data/:date", validateDate, async (req, res) => {
  try {
    const doc = await DayData.findOne({ userId: req.user.id, date: req.params.date });
    res.json(doc
      ? { blocks: doc.blocks, namaz: doc.namaz, reflections: doc.reflections, startedDays: doc.startedDays }
      : { blocks: [], namaz: [], reflections: [], startedDays: [] }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/data/:date — save single day data
router.post("/data/:date", validateDate, async (req, res) => {
  try {
    const { blocks, namaz, reflections, startedDays } = req.body;
    const doc = await DayData.findOneAndUpdate(
      { userId: req.user.id, date: req.params.date },
      { blocks, namaz, reflections, startedDays },
      { upsert: true, new: true }
    );
    // Issue #10: return only app data, not internal MongoDB fields
    res.json({
      blocks: doc.blocks,
      namaz: doc.namaz,
      reflections: doc.reflections,
      startedDays: doc.startedDays,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/settings — get user settings + categories + templates
router.get("/settings", async (req, res) => {
  try {
    const doc = await UserSettings.findOne({ userId: req.user.id });
    res.json(doc?.settings || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/settings — save user settings + categories + templates
router.post("/settings", async (req, res) => {
  try {
    const { scoringSettings, categories, templates } = req.body;

    if (
      (scoringSettings !== undefined && typeof scoringSettings !== "object") ||
      (categories !== undefined && !Array.isArray(categories)) ||
      (templates !== undefined && !Array.isArray(templates))
    ) {
      return res.status(400).json({ error: "Invalid settings shape" });
    }
    if (categories && categories.length > 100) {
      return res.status(400).json({ error: "Too many categories" });
    }
    if (templates && templates.length > 50) {
      return res.status(400).json({ error: "Too many templates" });
    }

    const doc = await UserSettings.findOneAndUpdate(
      { userId: req.user.id },
      { settings: { scoringSettings, categories, templates } },
      { upsert: true, new: true }
    );
    res.json(doc.settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
