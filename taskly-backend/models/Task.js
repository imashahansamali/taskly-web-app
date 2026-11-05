const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 5000 },
    category: { type: String, default: "Personal", maxlength: 80 },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    dueDate: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    archived: { type: Boolean, default: false },
    subtasks: [
      {
        title: { type: String, required: true, maxlength: 200 },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);
module.exports = mongoose.model("Task", taskSchema);
