const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, maxlength: 100 },
  type: { type: String, required: true, enum: ["productive", "routine", "wasted"] },
  pointsPerHour: { type: Number, required: true, min: 0, max: 1000 },
  isDeepWork: { type: Boolean },
  icon: { type: String, maxlength: 50 },
}, { _id: false });

const templateBlockSchema = new mongoose.Schema({
  subCategoryId: { type: String, required: true },
  startMin: { type: Number, required: true, min: 0, max: 1439 },
  endMin: { type: Number, required: true, min: 0, max: 1440 },
  note: { type: String, maxlength: 500 },
}, { _id: false });

const templateSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, maxlength: 100 },
  blocks: { type: [templateBlockSchema], default: [] },
}, { _id: false });

const scoringSettingsSchema = new mongoose.Schema({
  productiveRate: { type: Number, min: 0, max: 1000 },
  wastedRate: { type: Number, min: 0, max: 1000 },
  namazBonus: { type: Number, min: 0, max: 1000 },
  namazPenalty: { type: Number, min: 0, max: 1000 },
  dailyTargetPenalty: { type: Number, min: 0, max: 1000 },
  deepWorkMultiplier: { type: Number, min: 1, max: 10 },
  targetProductiveHours: { type: Number, min: 0, max: 24 },
  streakMinHours: { type: Number, min: 0, max: 24 },
  prayerReminders: { type: Object },
  userName: { type: String, maxlength: 100 },
  rank: { type: String, maxlength: 100 },
}, { _id: false });

const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
  settings: {
    scoringSettings: { type: scoringSettingsSchema },
    categories: { type: [categorySchema], default: [] },
    templates: { type: [templateSchema], default: [] },
  },
});

module.exports = mongoose.model("UserSettings", userSettingsSchema);
