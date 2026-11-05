const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    bio: { type: String, default: "", maxlength: 500 },
    timezone: { type: String, default: "Asia/Colombo" },
    settings: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      weekStarts: {
        type: String,
        enum: ["monday", "sunday"],
        default: "monday",
      },
      reminders: { type: Boolean, default: true },
    },
    resetHash: String,
    resetExpires: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true },
);
module.exports = mongoose.model("User", schema);
