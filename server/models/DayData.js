const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  subCategoryId: { type: String, required: true },
  startMin: { type: Number, required: true, min: 0, max: 1439 },
  endMin: { type: Number, required: true, min: 0, max: 1440 },
  kind: { type: String, required: true, enum: ["planned", "logged"] },
  note: { type: String, maxlength: 500 },
}, { _id: false });

const namazSchema = new mongoose.Schema({
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  prayer: { type: String, required: true, enum: ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"] },
  completed: { type: Boolean, required: true },
}, { _id: false });

const reflectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  wentWell: { type: String, maxlength: 2000 },
  wasted: { type: String, maxlength: 2000 },
  tomorrow: { type: String, maxlength: 2000 },
  score: { type: Number },
  productiveHours: { type: Number, min: 0 },
  namazCompleted: { type: Number, min: 0, max: 5 },
  createdAt: { type: String },
}, { _id: false });

const dayDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  blocks: { type: [blockSchema], default: [] },
  namaz: { type: [namazSchema], default: [] },
  reflections: { type: [reflectionSchema], default: [] },
  startedDays: { type: [String], default: [] },
});

dayDataSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DayData", dayDataSchema);
