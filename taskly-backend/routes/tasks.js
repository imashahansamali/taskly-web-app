const router = require("express").Router();
const mongoose = require("mongoose");
const Task = require("../models/Task");
router.use(require("../middleware/auth"));
const fields = [
  "title",
  "description",
  "category",
  "priority",
  "status",
  "dueDate",
  "completed",
  "archived",
  "subtasks",
];
function clean(body) {
  const data = Object.fromEntries(
    fields.filter((k) => Object.hasOwn(body, k)).map((k) => [k, body[k]]),
  );
  if ("title" in data && (typeof data.title !== "string" || !data.title.trim()))
    throw new Error("A task title is required.");
  if ("dueDate" in data) data.dueDate = data.dueDate || null;
  for (const k of ["completed", "archived"])
    if (k in data && typeof data[k] !== "boolean")
      throw new Error("Invalid task state.");
  if ("status" in data) data.completed = data.status === "done";
  else if ("completed" in data) data.status = data.completed ? "done" : "todo";
  if ("completed" in data)
    data.completedAt = data.completed ? new Date() : null;
  if ("subtasks" in data) {
    if (!Array.isArray(data.subtasks) || data.subtasks.length > 100)
      throw new Error("Use at most 100 subtasks.");
    data.subtasks = data.subtasks.map((s) => ({
      title: s.title,
      completed: s.completed === true,
    }));
  }
  return data;
}
router.get("/", async (req, res, next) => {
  try {
    res.json(await Task.find({ user: req.userId }).sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});
router.post("/", async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.title)
      return res.status(400).json({ message: "A task title is required." });
    res.status(201).json(await Task.create({ ...data, user: req.userId }));
  } catch (e) {
    next(e);
  }
});
router.param("id", (req, res, next, id) =>
  mongoose.isValidObjectId(id)
    ? next()
    : res.status(400).json({ message: "Invalid task ID." }),
);
router.put("/:id", async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: clean(req.body) },
      { new: true, runValidators: true },
    );
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (e) {
    next(e);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted." });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
