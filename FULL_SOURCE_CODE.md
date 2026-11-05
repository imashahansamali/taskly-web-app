# Taskly — full file codes

Complete code for every application/configuration file. Replace the whole file at the shown path.

# Files to replace and add

Paths are relative to TaskNest/. Keep the original as a backup.

## REPLACE these existing files

- `taskly-backend/middleware/auth.js`
- `taskly-backend/models/Task.js`
- `taskly-backend/models/User.js`
- `taskly-backend/package-lock.json`
- `taskly-backend/package.json`
- `taskly-backend/routes/auth.js`
- `taskly-backend/routes/tasks.js`
- `taskly-backend/server.js`
- `taskly-frontend/README.md`
- `taskly-frontend/index.html`
- `taskly-frontend/src/App.jsx`
- `taskly-frontend/src/api.js`
- `taskly-frontend/src/index.css`

## ADD these new files

- `.gitignore`
- `README.md`
- `VERIFICATION.md`
- `taskly-backend/.env.example`
- `taskly-backend/tests/api.test.js`
- `taskly-frontend/.env.example`
- `taskly-frontend/src/components/AuthLayout.jsx`
- `taskly-frontend/src/components/Layout.jsx`
- `taskly-frontend/src/components/TaskRow.jsx`
- `taskly-frontend/src/lib/tasks.js`
- `taskly-frontend/src/pages/Auth.jsx`
- `taskly-frontend/src/pages/Workspace.jsx`

## REMOVE obsolete pages after App.jsx is replaced

- `taskly-frontend/src/pages/Login.jsx`
- `taskly-frontend/src/pages/Register.jsx`
- `taskly-frontend/src/pages/Tasks.jsx`

`Login.jsx` and `Register.jsx` are replaced by `Auth.jsx`. `Tasks.jsx` is replaced by `Workspace.jsx` and the shared components.
Keep your real backend `.env` local. Do not include node_modules or .env when sharing.
No separate npm install is needed for every page: run it once in each frontend/backend folder.


## Run the project

# Taskly — Figma website implementation

This updates the uploaded TaskNest React/Vite + Express/MongoDB project. It uses the navy sidebar, Manrope typeface, white cards, mint highlights and teal actions from the Taskly Figma design. Existing accounts and tasks use the same MongoDB collections.

## Start on Windows (VS Code)

1. Extract the new ZIP into a **new folder**. Keep your original folder as a backup.
2. Open `TaskNest` in VS Code.
3. In `taskly-backend`, copy `.env.example` to a new file named `.env`.
4. Set `MONGO_URI` to your own MongoDB Atlas URI (including `/taskly`, or your existing database name). Set `JWT_SECRET` to a long random secret. Keep `PORT=5000` and `FRONTEND_URL=http://localhost:5173`.
5. Start the backend in Terminal 1:

```powershell
cd taskly-backend
npm install
npm run dev
```

6. Open a **second terminal** at the `TaskNest` root and start the frontend:

```powershell
cd taskly-frontend
npm install
npm run dev
```

7. Open **http://localhost:5173**. Keep both terminals running. Register a new account or sign in with an existing account from the same database.

If port 5173 is occupied, stop the older frontend. If you deliberately choose another port, also change `FRONTEND_URL` in backend `.env` and restart the backend.

Frontend `.env` is optional for the default local setup. Copy `taskly-frontend/.env.example` to `.env` to set `VITE_API_URL` for a different backend. Restart Vite after changes.

Your original ZIP contained `.env`. It is deliberately excluded from this updated ZIP. Do not upload secrets to GitHub. If a real password or token was shared publicly, rotate it. Never copy `node_modules` from Windows into a Linux runtime; reinstall dependencies on the target machine.

## Pages and real behavior

| Route | Function |
|---|---|
| `/login`, `/register` | Real JWT sign-in and registration; Remember me controls persistent vs tab session |
| `/forgot-password` | Request expiring one-use reset link via SMTP |
| `/reset-password?token=...` | Reset password and invalidate old tokens |
| `/` | Dashboard with counts from your own tasks |
| `/tasks`, `/today`, `/completed`, `/search` | Search and priority/status filtering; complete/reopen |
| `/tasks/new`, `/tasks/:id/edit` | Title, description, category, due date, priority, status and subtasks |
| `/tasks/:id` | Details, subtask completion, archive, reopen, edit and delete confirmation |
| `/board` | Kanban drag/drop plus accessible status dropdowns; persisted changes |
| `/calendar` | Actual month navigation and tasks by due date; Monday/Sunday preference |
| `/analytics` | Real completion totals, last 7 days chart, completion rate and streak |
| `/notifications` | In-app overdue/today/tomorrow reminders derived from saved tasks |
| `/archive` | Archived tasks and restoration |
| `/profile` | Persisted name, bio and time zone; sign-in email read-only |
| `/settings` | Persisted light/dark appearance, calendar week start and in-app reminders |
| `/help` | Expandable help answers |

Figma's Created/Updated/Deleted/Completed frames become live success messages, and its delete screen becomes a confirmation dialog. These are UI states, not separate URLs. The app starts with your actual data, not the sample tasks/numbers from Figma. Creating a new account starts empty.

## Optional password recovery email

Fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM` in backend `.env` using your email provider's SMTP credentials. Use `SMTP_SECURE=true` for implicit TLS such as port 465; use `false` for STARTTLS on 587. Restart backend. Reset links point to `FRONTEND_URL` and expire in 30 minutes. No reset token is shown in the browser/API response. Without SMTP the recovery page explains that email configuration is required.

Notifications are **in-app** only. Scheduled email reminders and browser push are not implemented. Time zone is saved as profile metadata; calendar dates and chart day grouping use the device's local time zone. Google Fonts supplies Manrope; system fonts are the offline fallback.

## Existing data

The original Task and User collection names are unchanged. New fields have defaults. Existing `completed` values remain authoritative. Old completed tasks without `completedAt` count toward totals but cannot be assigned to a historical chart day. Profile email changes are intentionally not provided without an email verification flow.

## Checks

```powershell
# In taskly-frontend
npm run build
npm run lint
# In taskly-backend
npm test
```

See `VERIFICATION.md` for checks run and their limits. See `FILE_CHANGES.md` for every file to replace/add. See `FULL_SOURCE_CODE.md` for complete, copyable code grouped by file path.


## File contents

### .gitignore

```text
node_modules/
dist/
.env
.env.*
!.env.example
*.log
.DS_Store
```

### taskly-backend/.env.example

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskly
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
# Optional: required only for sending password recovery email
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

### taskly-backend/middleware/auth.js

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");
module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ");
    if (token?.[0] !== "Bearer" || !token[1])
      return res.status(401).json({ message: "Please sign in again." });
    const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (
      !user ||
      (user.passwordChangedAt &&
        decoded.iat * 1000 < user.passwordChangedAt.getTime())
    )
      return res
        .status(401)
        .json({ message: "Session expired. Please sign in again." });
    req.userId = user._id;
    req.account = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Session expired. Please sign in again." });
  }
};
```

### taskly-backend/models/Task.js

```javascript
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
```

### taskly-backend/models/User.js

```javascript
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
```

### taskly-backend/package.json

```json
{
  "name": "taskly-backend",
  "version": "1.0.0",
  "description": "Taskly - Task Manager API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node --test"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.1",
    "nodemailer": "^6.10.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

### taskly-backend/routes/auth.js

```javascript
const router = require("express").Router();
const bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken"),
  crypto = require("crypto");
const User = require("../models/User"),
  auth = require("../middleware/auth");
const safe = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  bio: u.bio || "",
  timezone: u.timezone || "Asia/Colombo",
  settings: u.settings,
});
const token = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const emailOf = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
router.post("/register", async (req, res, next) => {
  try {
    const { name, password } = req.body,
      email = emailOf(req.body.email);
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    )
      return res
        .status(400)
        .json({
          message:
            "Enter a name, valid email and password of 8–128 characters.",
        });
    if (await User.exists({ email }))
      return res.status(409).json({ message: "Email is already registered." });
    const u = await User.create({
      name: name.trim(),
      email,
      password: await bcrypt.hash(password, 12),
    });
    res.status(201).json({ token: token(u._id), user: safe(u) });
  } catch (e) {
    next(e);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const u = await User.findOne({ email: emailOf(req.body.email) });
    if (
      !u ||
      typeof req.body.password !== "string" ||
      !(await bcrypt.compare(req.body.password, u.password))
    )
      return res.status(401).json({ message: "Invalid email or password." });
    res.json({ token: token(u._id), user: safe(u) });
  } catch (e) {
    next(e);
  }
});
router.get("/me", auth, (req, res) => res.json(safe(req.account)));
router.put("/me", auth, async (req, res, next) => {
  try {
    const u = req.account;
    for (const key of ["name", "bio", "timezone"])
      if (Object.hasOwn(req.body, key)) {
        if (typeof req.body[key] !== "string")
          return res.status(400).json({ message: "Invalid profile details." });
        u[key] = req.body[key].trim();
      }
    if (!u.name) return res.status(400).json({ message: "Name is required." });
    try {
      new Intl.DateTimeFormat("en", { timeZone: u.timezone });
    } catch {
      return res.status(400).json({ message: "Enter a valid time zone." });
    }
    if (req.body.settings) {
      const s = req.body.settings;
      if (s.theme) u.settings.theme = s.theme;
      if (s.weekStarts) u.settings.weekStarts = s.weekStarts;
      if (typeof s.reminders === "boolean") u.settings.reminders = s.reminders;
    }
    await u.save();
    res.json(safe(u));
  } catch (e) {
    next(e);
  }
});
router.post("/forgot-password", async (req, res, next) => {
  try {
    if (!process.env.SMTP_HOST)
      return res
        .status(503)
        .json({
          message:
            "Password recovery needs SMTP configuration. Ask the administrator to configure email.",
        });
    const u = await User.findOne({ email: emailOf(req.body.email) });
    if (u) {
      const raw = crypto.randomBytes(32).toString("hex");
      u.resetHash = crypto.createHash("sha256").update(raw).digest("hex");
      u.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
      await u.save();
      const nodemailer = require("nodemailer");
      const mail = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
      await mail.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: u.email,
        subject: "Reset your Taskly password",
        text: `Reset your password within 30 minutes: ${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${raw}`,
      });
    }
    res.json({
      message: "If that email is registered, a reset link will arrive shortly.",
    });
  } catch (e) {
    next(e);
  }
});
router.post("/reset-password", async (req, res, next) => {
  try {
    const { password, token: raw } = req.body;
    if (
      typeof raw !== "string" ||
      !raw ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    )
      return res
        .status(400)
        .json({
          message:
            "A reset token and password of 8–128 characters are required.",
        });
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    const passwordHash = await bcrypt.hash(password, 12);
    const u = await User.findOneAndUpdate(
      { resetHash: hash, resetExpires: { $gt: new Date() } },
      {
        $set: { password: passwordHash, passwordChangedAt: new Date() },
        $unset: { resetHash: 1, resetExpires: 1 },
      },
      { new: true },
    );
    if (!u)
      return res
        .status(400)
        .json({ message: "This reset link is invalid or expired." });
    res.json({ message: "Password updated. Please sign in." });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
```

### taskly-backend/routes/tasks.js

```javascript
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
```

### taskly-backend/server.js

```javascript
require("dotenv").config();
const express = require("express"),
  mongoose = require("mongoose"),
  cors = require("cors");
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
// Small bounded, process-local throttle for authentication endpoints.
const attempts = new Map();
app.use("/api/auth", (req, res, next) => {
  if (req.method !== "POST") return next();
  const now = Date.now(),
    key = req.ip;
  let a = attempts.get(key);
  if (!a || a.until < now) a = { count: 0, until: now + 15 * 60 * 1000 };
  a.count++;
  attempts.set(key, a);
  if (attempts.size > 5000)
    for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  if (a.count > 50)
    return res
      .status(429)
      .json({ message: "Too many attempts. Try again in 15 minutes." });
  next();
});
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use((err, _req, res, _next) => {
  const invalid =
    err.name === "ValidationError" ||
    err.name === "CastError" ||
    err.message?.includes("task") ||
    err.message?.includes("subtask");
  res
    .status(err.code === 11000 ? 409 : invalid ? 400 : 500)
    .json({
      message:
        err.code === 11000
          ? "Email is already in use."
          : invalid
            ? err.message
            : "Could not process the request. Please retry.",
    });
});
async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET)
    throw new Error("Set MONGO_URI and JWT_SECRET in taskly-backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(process.env.PORT || 5000, () =>
    console.log("Taskly API ready on port " + (process.env.PORT || 5000)),
  );
}
if (require.main === module)
  start().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
module.exports = app;
```

### taskly-backend/tests/api.test.js

```javascript
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
process.env.JWT_SECRET = "test-only-secret";
const jwt = require("jsonwebtoken");
const User = require("../models/User"),
  Task = require("../models/Task");
// Exercise HTTP routing, real JWT validation and update filtering without Atlas.
const own = "507f1f77bcf86cd799439011",
  other = "507f191e810c19729de860ea";
const taskId = "507f1f77bcf86cd799439012";
let lastUpdate, server, base;
User.findById = async (id) =>
  id === own
    ? { _id: own, name: "Test", email: "test@example.com", settings: {} }
    : null;
Task.find = (filter) => ({
  sort: async () =>
    filter.user.toString() === own
      ? [{ _id: taskId, title: "Private task" }]
      : [],
});
Task.findOneAndUpdate = async (filter, update) => {
  lastUpdate = { filter, update };
  return filter.user.toString() === own && filter._id === taskId
    ? { _id: taskId, ...update.$set }
    : null;
};
Task.findOneAndDelete = async (filter) =>
  filter.user.toString() === own && filter._id === taskId
    ? { _id: taskId }
    : null;
const app = require("../server");
const headers = {
  Authorization: "Bearer " + jwt.sign({ id: own }, process.env.JWT_SECRET),
  "Content-Type": "application/json",
};
before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = "http://127.0.0.1:" + server.address().port;
});
after(() => new Promise((r) => server.close(r)));
test("requires sign-in for task data", async () =>
  assert.equal((await fetch(base + "/api/tasks")).status, 401));
test("loads only the signed-in user tasks", async () => {
  const r = await fetch(base + "/api/tasks", { headers });
  assert.equal(r.status, 200);
  assert.equal((await r.json())[0].title, "Private task");
});
test("ignores owner and Mongo operator injection on update", async () => {
  const r = await fetch(base + "/api/tasks/" + taskId, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      title: "Updated",
      user: other,
      $unset: { user: 1 },
    }),
  });
  assert.equal(r.status, 200);
  assert.equal(lastUpdate.filter.user.toString(), own);
  assert.deepEqual(lastUpdate.update, { $set: { title: "Updated" } });
});
test("status done sets completion timestamp", async () => {
  const r = await fetch(base + "/api/tasks/" + taskId, {
    method: "PUT",
    headers,
    body: JSON.stringify({ status: "done" }),
  });
  assert.equal(r.status, 200);
  assert.equal(lastUpdate.update.$set.completed, true);
  assert.ok(lastUpdate.update.$set.completedAt instanceof Date);
});
test("cannot update a task outside the account scope", async () =>
  assert.equal(
    (
      await fetch(base + "/api/tasks/" + other, {
        method: "PUT",
        headers,
        body: JSON.stringify({ title: "No" }),
      })
    ).status,
    404,
  ));
test("rejects blank titles and malformed identifiers", async () => {
  assert.equal(
    (
      await fetch(base + "/api/tasks/" + taskId, {
        method: "PUT",
        headers,
        body: JSON.stringify({ title: " " }),
      })
    ).status,
    400,
  );
  assert.equal(
    (await fetch(base + "/api/tasks/invalid", { method: "DELETE", headers }))
      .status,
    400,
  );
});
test("model defaults preserve existing task completion", () => {
  const t = new Task({ user: own, title: "Old task", completed: true });
  assert.equal(t.completed, true);
  assert.equal(t.archived, false);
  assert.deepEqual(t.subtasks, []);
});
```

### taskly-frontend/.env.example

```text
VITE_API_URL=http://localhost:5000/api
```

### taskly-frontend/eslint.config.js

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
```

### taskly-frontend/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Taskly — Your personal workspace</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### taskly-frontend/package.json

```json
{
  "name": "taskly-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.21.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "react-router-dom": "^7.18.5"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "eslint": "^10.14.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.7",
    "globals": "^17.13.0",
    "vite": "^8.3.6"
  }
}
```

### taskly-frontend/src/App.jsx

```jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import api, { messageOf } from "./api";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import {
  TaskList,
  TaskForm,
  TaskDetails,
  Board,
  Calendar,
  Analytics,
  Notifications,
  Help,
  Account,
} from "./pages/Workspace";
import { normalizeTask } from "./lib/tasks";
function SignedIn() {
  const [tasks, setTasks] = useState([]),
    [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    Promise.all([api.get("/tasks"), api.get("/auth/me")])
      .then(([t, u]) => {
        if (active) {
          setTasks(t.data.map(normalizeTask));
          setUser(u.data);
          localStorage.setItem("user", JSON.stringify(u.data));
        }
      })
      .catch((e) => {
        if (active) {
          if (e.response?.status === 401) {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            navigate("/login", { replace: true });
          } else setError(messageOf(e));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);
  useEffect(() => {
    document.documentElement.dataset.theme = user?.settings?.theme || "light";
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [user?.settings?.theme]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }
  async function save(id, data) {
    setBusy(true);
    setError("");
    try {
      const r = id
        ? await api.put("/tasks/" + id, data)
        : await api.post("/tasks", data);
      setTasks((previous) =>
        id
          ? previous.map((t) => (t._id === id ? normalizeTask(r.data) : t))
          : [normalizeTask(r.data), ...previous],
      );
      setNotice(
        id ? "Task updated successfully." : "Task created successfully.",
      );
      return true;
    } catch (e) {
      if (e.response?.status === 401) logout();
      else setError(messageOf(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await api.delete("/tasks/" + deleting._id);
      setTasks((previous) => previous.filter((t) => t._id !== deleting._id));
      setDeleting(null);
      setNotice("Task deleted.");
      navigate("/tasks");
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  async function saveAccount(data) {
    setBusy(true);
    setError("");
    try {
      const r = await api.put("/auth/me", data);
      setUser(r.data);
      localStorage.setItem("user", JSON.stringify(r.data));
      setNotice("Changes saved.");
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <div className="loading-screen" role="status">
        Starting Taskly…
      </div>
    );
  if (!user)
    return (
      <div className="loading-screen">
        <div className="panel">
          <h2>Could not load your workspace</h2>
          <p className="error">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>{" "}
          <button className="secondary" onClick={logout}>
            Sign in again
          </button>
        </div>
      </div>
    );
  const props = { tasks, user, onUpdate: save, onDelete: setDeleting, busy };
  return (
    <>
      {error && (
        <div className="global-message error" role="alert">
          {error}
          <button className="text-button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          ✓ {notice}
        </div>
      )}
      <Routes>
        <Route element={<Layout user={user} logout={logout} />}>
          <Route index element={<TaskList {...props} mode="overview" />} />
          <Route path="tasks" element={<TaskList {...props} />} />
          <Route path="today" element={<TaskList {...props} mode="today" />} />
          <Route
            path="completed"
            element={<TaskList {...props} mode="completed" />}
          />
          <Route
            path="archive"
            element={<TaskList {...props} mode="archive" />}
          />
          <Route
            path="search"
            element={<TaskList {...props} mode="search" />}
          />
          <Route
            path="tasks/new"
            element={
              <TaskForm key="new" tasks={tasks} onSave={save} busy={busy} />
            }
          />
          <Route
            path="tasks/:id/edit"
            element={
              <TaskForm key="edit" tasks={tasks} onSave={save} busy={busy} />
            }
          />
          <Route path="tasks/:id" element={<TaskDetails {...props} />} />
          <Route path="board" element={<Board {...props} />} />
          <Route
            path="calendar"
            element={<Calendar tasks={tasks} settings={user.settings} />}
          />
          <Route path="analytics" element={<Analytics tasks={tasks} />} />
          <Route
            path="notifications"
            element={<Notifications tasks={tasks} settings={user.settings} />}
          />
          <Route
            path="profile"
            element={
              <Account
                key={"profile" + user.id}
                user={user}
                onSave={saveAccount}
                busy={busy}
              />
            }
          />
          <Route
            path="settings"
            element={
              <Account
                key={"settings" + user.id}
                user={user}
                settingsPage
                onSave={saveAccount}
                busy={busy}
              />
            }
          />
          <Route path="help" element={<Help />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {deleting && (
        <DeleteDialog
          task={deleting}
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </>
  );
}
function DeleteDialog({ task, busy, onCancel, onConfirm }) {
  useEffect(() => {
    function key(e) {
      if (e.key === "Escape" && !busy) onCancel();
      if (e.key === "Tab") {
        const buttons = [
          ...document.querySelectorAll(".modal button:not(:disabled)"),
        ];
        if (!buttons.length) return;
        const first = buttons[0],
          last = buttons.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    const previous = document.activeElement;
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      if (previous?.isConnected) previous.focus();
    };
  }, [busy, onCancel]);
  return (
    <div className="modal-backdrop">
      <section
        className="modal panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-heading"
      >
        <h2 id="delete-heading">Delete this task?</h2>
        <p className="muted">
          “{task.title}” will be permanently removed. This action cannot be
          undone.
        </p>
        <div className="actions">
          <button
            autoFocus
            className="secondary"
            disabled={busy}
            onClick={onCancel}
          >
            Keep task
          </button>
          <button className="danger" disabled={busy} onClick={onConfirm}>
            {busy ? "Deleting…" : "Delete task"}
          </button>
        </div>
      </section>
    </div>
  );
}
export default function App() {
  const signed =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return (
    <Routes>
      <Route path="login" element={<Auth key="login" />} />
      <Route
        path="register"
        element={<Auth key="register" mode="register" />}
      />
      <Route
        path="forgot-password"
        element={<Auth key="forgot" mode="forgot" />}
      />
      <Route
        path="reset-password"
        element={<Auth key="reset" mode="reset" />}
      />
      <Route
        path="/*"
        element={signed ? <SignedIn /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
```

### taskly-frontend/src/api.js

```javascript
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const messageOf = (e) =>
  e.response?.data?.message ||
  "Could not connect to the server. Check the backend and retry.";
export default api;
```

### taskly-frontend/src/components/AuthLayout.jsx

```jsx
import { Link } from "react-router-dom";
export default function AuthLayout({ children, register = false }) {
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Link className="brand" to="/login">
          ✓ taskly
        </Link>
        <h1>
          {register ? (
            <>
              Make room for
              <br />
              your best work.
            </>
          ) : (
            <>
              Less clutter.
              <br />
              More clarity.
            </>
          )}
        </h1>
        <p>
          A calm place to plan your day, organize your tasks, and celebrate
          every small win.
        </p>
        <section className="focus-card">
          <small>YOUR DAILY MOMENTUM</small>
          <h2>One task at a time.</h2>
          <div>
            ✓ Plan the week
            <br />✓ Finish your first milestone
            <br />○ Make time for what matters
          </div>
        </section>
        <small className="tagline">Your plans. Your pace. Your space.</small>
      </aside>
      <main className="auth-main">
        <div className="auth-form">{children}</div>
      </main>
    </div>
  );
}
```

### taskly-frontend/src/components/Layout.jsx

```jsx
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useState } from "react";
const nav = [
  ["/", "Overview"],
  ["/tasks", "All tasks"],
  ["/today", "Today"],
  ["/completed", "Completed"],
  ["/board", "Task board"],
  ["/calendar", "Calendar"],
  ["/analytics", "Analytics"],
  ["/notifications", "Notifications"],
  ["/archive", "Archive"],
  ["/profile", "Profile"],
  ["/settings", "Settings"],
  ["/help", "Help center"],
];
export default function Layout({ user, logout }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title =
    nav.find(([path]) => path === location.pathname)?.[1] || "Tasks";
  return (
    <div className="app-shell">
      <button
        className="mobile-menu secondary"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ☰ Menu
      </button>
      <aside className={"sidebar " + (open ? "is-open" : "")}>
        <Link className="brand" to="/">
          ✓ taskly
        </Link>
        <div className="nav-caption">PERSONAL WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/" || path === "/tasks"}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="logout" onClick={logout}>
          Log out
        </button>
      </aside>
      {open && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <main className="workspace">
        <header className="topbar">
          <span>Personal workspace / {title}</span>
          <Link className="avatar" to="/profile" title={user.name}>
            {user.name
              ?.split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("") || "U"}
          </Link>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
```

### taskly-frontend/src/components/TaskRow.jsx

```jsx
import { Link } from "react-router-dom";
import { dueLabel, statusOf } from "../lib/tasks";
export default function TaskRow({ task, onUpdate, onDelete, busy }) {
  return (
    <article className={"task-row " + (task.completed ? "is-done" : "")}>
      <input
        aria-label={
          "Mark " + task.title + (task.completed ? " incomplete" : " complete")
        }
        type="checkbox"
        checked={task.completed}
        disabled={busy}
        onChange={() => onUpdate(task._id, { completed: !task.completed })}
      />
      <div className="task-copy">
        <Link className="task-title" to={"/tasks/" + task._id}>
          {task.title}
        </Link>
        <small>
          {task.category || "Personal"}
          {statusOf(task) === "in-progress" ? " · In progress" : ""}
        </small>
      </div>
      <span className="due">{dueLabel(task)}</span>
      <span className={"badge " + (task.completed ? "done" : task.priority)}>
        {task.completed ? "Completed" : task.priority}
      </span>
      <div className="row-actions">
        {task.archived ? (
          <button
            className="text-button"
            disabled={busy}
            onClick={() => onUpdate(task._id, { archived: false })}
          >
            Restore
          </button>
        ) : (
          <>
            <Link to={"/tasks/" + task._id + "/edit"}>Edit</Link>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => onUpdate(task._id, { archived: true })}
            >
              Archive
            </button>
          </>
        )}
        <button
          className="text-button danger-text"
          onClick={() => onDelete(task)}
          disabled={busy}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
```

### taskly-frontend/src/index.css

```css
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap");
:root {
  font-family: "Manrope", system-ui, sans-serif;
  color: #172d3a;
  background: #f5f7f8;
  font-synthesis: none;
  --bg: #f5f7f8;
  --surface: #fff;
  --ink: #172d3a;
  --muted: #687985;
  --navy: #172d3a;
  --teal: #147d73;
  --mint: #c6f0d7;
  --border: #e2e8eb;
  --input: #f5f7f8;
  line-height: 1.5;
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #111f28;
  --surface: #1c303c;
  --ink: #eef5f7;
  --muted: #b5c5cf;
  --input: #243d4b;
  --border: #38505f;
  --mint: #284f40;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
}
a {
  color: var(--teal);
  text-decoration: none;
}
button,
input,
select,
textarea {
  font: inherit;
}
button,
.button {
  border: 0;
  border-radius: 9px;
  padding: 12px 18px;
  cursor: pointer;
  background: var(--teal);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  min-height: 46px;
  gap: 8px;
}
button:hover,
.button:hover {
  filter: brightness(0.94);
}
button:disabled {
  opacity: 0.6;
  cursor: wait;
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
summary:focus-visible {
  outline: 3px solid #47b8aa;
  outline-offset: 3px;
}
.primary {
  background: var(--navy);
  color: #fff;
}
.secondary {
  background: var(--input);
  color: var(--ink);
}
.danger {
  background: #b74646;
  color: #fff;
}
.danger-text {
  color: #b74646 !important;
}
.full {
  width: 100%;
}
input:not([type="checkbox"]),
select,
textarea {
  width: 100%;
  min-height: 48px;
  background: var(--input);
  color: var(--ink);
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 13px 18px;
  font-size: 14px;
}
input::placeholder,
textarea::placeholder {
  color: var(--muted);
}
select {
  text-transform: capitalize;
}
textarea {
  resize: vertical;
}
input[type="checkbox"] {
  accent-color: var(--teal);
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
}
label {
  display: flex;
  flex-direction: column;
  gap: 9px;
  font-size: 13px;
  font-weight: 700;
}
fieldset {
  border: 1px solid var(--border);
  border-radius: 10px;
  margin: 0;
  padding: 16px;
}
legend {
  font-size: 13px;
  font-weight: 700;
}
h1,
h2,
h3,
p {
  margin: 0;
}
h1 {
  font-size: 32px;
  line-height: 1.35;
  letter-spacing: -0.8px;
}
h2 {
  font-size: 22px;
  letter-spacing: -0.4px;
}
h3 {
  font-size: 16px;
}
hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 24px 0;
}
.muted {
  color: var(--muted);
}
.small {
  font-size: 12px;
}
.eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--teal);
  font-weight: 800;
  letter-spacing: 0.5px;
}
.brand {
  font-size: 29px;
  color: white;
  font-weight: 800;
  letter-spacing: -1px;
}
.check-label {
  flex-direction: row;
  align-items: center;
  font-weight: 400;
}
.error,
.success {
  padding: 14px 18px;
  border-radius: 9px;
  font-size: 14px;
}
.error {
  background: #fce9e9;
  color: #9e3030;
}
.success {
  background: #d8f2e3;
  color: #245c40;
}
.auth-layout {
  display: grid;
  grid-template-columns: 46% 54%;
  min-height: 100vh;
  background: #fff;
  color: #172d3a;
}
.auth-story {
  background: #172d3a;
  padding: 64px 11%;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.auth-story h1 {
  font-size: clamp(40px, 4vw, 58px);
  line-height: 1.35;
  letter-spacing: -1.5px;
  margin-top: 8px;
}
.auth-story > p {
  font-size: 18px;
  color: #bdd0da;
  max-width: 490px;
}
.focus-card {
  background: #294552;
  padding: 28px;
  border-radius: 20px;
  max-width: 510px;
}
.focus-card small {
  font-size: 10px;
  color: #c6f0d7;
}
.focus-card h2 {
  font-size: 26px;
  margin: 16px 0;
}
.focus-card div {
  font-size: 17px;
}
.tagline {
  font-size: 12px;
  color: #bdd0da;
}
.auth-main {
  padding: 80px 12%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-form {
  width: 100%;
  max-width: 480px;
}
.auth-form > p {
  margin: 12px 0 26px;
  font-size: 14px;
}
.auth-form form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.auth-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  gap: 12px;
}
.auth-options a {
  color: #687985;
}
.auth-switch {
  font-weight: 700;
  font-size: 14px !important;
  margin-top: 24px !important;
}
.auth-form .error,
.auth-form .success {
  margin-bottom: 20px;
}
.auth-form input {
  background: #f5f7f8;
  color: #172d3a;
}
.auth-form input::placeholder {
  color: #687985;
}
.app-shell {
  min-height: 100vh;
}
.sidebar {
  width: 240px;
  background: #172d3a;
  color: #fff;
  position: fixed;
  inset: 0 auto 0 0;
  padding: 28px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  z-index: 30;
}
.sidebar .brand {
  margin-bottom: 2px;
}
.nav-caption {
  font-size: 10px;
  color: #a8bbc6;
}
.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sidebar nav a {
  color: #fff;
  padding: 12px 14px;
  border-radius: 7px;
  font-size: 13px;
  min-height: 43px;
}
.sidebar nav a.active {
  background: #304f5f;
  color: #c6f0d7;
  font-weight: 700;
}
.sidebar nav a:hover {
  background: #294552;
}
.logout {
  margin-top: 12px;
  background: #304f5f;
  color: white;
  justify-content: flex-start;
}
.workspace {
  margin-left: 240px;
  padding: 32px 48px 48px;
  max-width: 1800px;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 32px;
  min-height: 42px;
}
.avatar {
  font-weight: 800;
  color: var(--ink);
  padding: 8px;
}
.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}
.page-heading p {
  font-size: 15px;
  margin-top: 16px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 28px 0;
}
.stat-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 116px;
}
.stat-card span {
  font-size: 13px;
  color: var(--muted);
}
.stat-card strong {
  font-size: 30px;
}
.stat-card.mint {
  background: var(--mint);
}
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0;
}
.toolbar {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-bottom: 26px;
  flex-wrap: wrap;
}
.toolbar .search {
  flex: 1;
  min-width: 180px;
  background: transparent;
  padding-left: 0;
}
.toolbar select {
  width: auto;
  min-width: 130px;
  background: transparent;
}
.filter-tabs {
  display: flex;
  gap: 4px;
}
.filter-tabs button {
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  padding: 8px;
  min-height: 38px;
}
.filter-tabs button.selected {
  color: var(--teal);
  background: var(--surface);
}
.task-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.task-row {
  background: var(--surface);
  border-radius: 10px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 84px;
}
.task-copy {
  flex: 1;
  min-width: 100px;
}
.task-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ink);
  display: block;
  overflow-wrap: anywhere;
}
.task-copy small {
  display: block;
  font-size: 12px;
  color: var(--muted);
  margin-top: 5px;
}
.due {
  font-size: 13px;
  color: var(--muted);
  min-width: 94px;
}
.badge {
  font-size: 12px;
  text-transform: capitalize;
  min-width: 65px;
  font-weight: 700;
}
.badge.high {
  color: #b74646;
}
.badge.low,
.badge.done {
  color: var(--teal);
}
.badge.medium {
  color: #99711e;
}
.row-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
}
.row-actions a,
.text-button {
  color: var(--muted);
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 12px;
  min-height: 32px;
  font-weight: 500;
}
.is-done .task-title {
  color: var(--muted);
}
.task-list + .small {
  margin-top: 16px;
}
.panel {
  background: var(--surface);
  padding: 28px;
  border-radius: 14px;
  margin-bottom: 20px;
}
.task-form {
  max-width: 760px;
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.task-form h1 {
  font-size: 30px;
}
.task-form > p {
  margin-top: -12px;
  font-size: 14px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.back-link {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 24px;
}
.subtask {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
}
.subtask span {
  flex: 1;
}
.inline-form {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
.inline-form input {
  flex: 1;
  min-width: 0;
}
.detail-panel {
  max-width: 1104px;
}
.detail-panel h1 {
  margin: 20px 0;
}
.description {
  color: var(--muted);
  white-space: pre-wrap;
  line-height: 1.8;
}
.detail-meta {
  display: flex;
  gap: 50px;
  padding: 28px 0;
  font-size: 13px;
  text-transform: capitalize;
}
.detail-meta strong {
  display: block;
  font-size: 15px;
  margin-top: 8px;
}
.detail-panel .actions {
  margin-top: 28px;
}
.detail-panel h2 {
  font-size: 19px;
  margin: 14px 0;
}
.empty-state {
  text-align: center;
  padding: 52px 24px;
  background: var(--surface);
  border-radius: 14px;
}
.empty-symbol {
  background: var(--mint);
  border-radius: 50%;
  width: 55px;
  height: 55px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  font-size: 24px;
}
.empty-state p {
  margin: 10px 0 24px;
  font-size: 14px;
}
.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.board-column {
  background: color-mix(in srgb, var(--bg), #7896a5 12%);
  border-radius: 12px;
  padding: 24px;
  min-height: 550px;
}
.board-column h3 {
  margin-bottom: 22px;
}
.board-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: grab;
}
.board-card select {
  font-size: 12px;
  padding: 8px;
  min-height: 38px;
}
.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.calendar {
  padding: 16px;
  overflow-x: auto;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(110px, 1fr));
  gap: 8px;
  min-width: 780px;
}
.weekdays {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  margin-bottom: 12px;
}
.calendar-cell {
  min-height: 110px;
  padding: 12px;
  background: var(--bg);
  border-radius: 10px;
  font-size: 13px;
}
.calendar-cell.outside {
  opacity: 0.45;
}
.calendar-cell.today {
  background: var(--mint);
}
.calendar-cell a {
  display: block;
  font-size: 11px;
  background: var(--surface);
  padding: 6px;
  border-radius: 5px;
  margin-top: 8px;
  overflow-wrap: anywhere;
}
.calendar-cell .finished {
  text-decoration: line-through;
}
.chart {
  height: 280px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 20px;
  margin: 30px 0;
}
.chart-column {
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 14px;
  font-size: 12px;
}
.chart-bar {
  background: var(--teal);
  width: min(64px, 100%);
  border-radius: 8px;
}
.chart-column span {
  color: var(--muted);
}
.notification {
  display: block;
  color: var(--ink);
}
.notification p {
  margin-top: 12px;
}
.account-form {
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
}
.account-form button {
  align-self: flex-start;
}
.faq summary {
  font-weight: 700;
  cursor: pointer;
}
.faq p {
  margin-top: 16px;
}
.toast {
  position: fixed;
  bottom: 26px;
  right: 26px;
  background: #c6f0d7;
  color: #172d3a;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 30px #0002;
  z-index: 80;
}
.global-message {
  position: fixed;
  top: 16px;
  left: calc(240px + 32px);
  right: 32px;
  z-index: 80;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
.loading-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: #07151f88;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 24px;
}
.modal {
  width: min(560px, 100%);
  box-shadow: 0 24px 90px #0003;
  padding: 36px;
  margin: 0;
}
.modal p {
  margin: 20px 0 28px;
  overflow-wrap: anywhere;
}
.mobile-menu,
.nav-backdrop {
  display: none;
}
@media (min-width: 1600px) {
  .workspace {
    padding-right: 6%;
    padding-left: 6%;
  }
}
@media (max-width: 1150px) {
  .workspace {
    padding: 28px;
  }
  .task-row {
    flex-wrap: wrap;
  }
  .row-actions {
    margin-left: auto;
  }
  .board-column {
    padding: 16px;
  }
  .board-card {
    padding: 18px;
  }
  .toolbar .search {
    flex-basis: 100%;
  }
  .auth-main {
    padding: 50px 10%;
  }
  .auth-story {
    padding: 50px 9%;
  }
  .auth-story h1 {
    font-size: 42px;
  }
}
@media (max-width: 800px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.2s;
  }
  .sidebar.is-open {
    transform: translateX(0);
  }
  .workspace {
    margin-left: 0;
    padding: 76px 20px 32px;
  }
  .mobile-menu {
    display: inline-flex;
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 40;
    box-shadow: 0 2px 12px #0002;
  }
  .nav-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: #0007;
    z-index: 20;
    border-radius: 0;
  }
  .stats {
    grid-template-columns: 1fr 1fr;
  }
  .board {
    grid-template-columns: 1fr;
  }
  .board-column {
    min-height: 180px;
  }
  .auth-layout {
    grid-template-columns: 1fr;
  }
  .auth-story {
    padding: 30px;
  }
  .auth-story h1,
  .auth-story > p,
  .focus-card,
  .tagline {
    display: none;
  }
  .auth-main {
    padding: 48px 24px;
  }
  .topbar {
    margin-bottom: 24px;
  }
  .page-heading h1 {
    font-size: 28px;
  }
  .global-message {
    left: 16px;
    right: 16px;
    top: 76px;
  }
  .task-form {
    padding: 24px;
  }
  .chart {
    gap: 8px;
  }
  .calendar-toolbar {
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }
}
@media (max-width: 480px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .stat-card {
    padding: 18px;
  }
  .task-row {
    padding: 18px;
    gap: 12px;
  }
  .task-copy {
    flex-basis: 70%;
  }
  .due {
    margin-left: 30px;
  }
  .row-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .filter-tabs {
    width: 100%;
    justify-content: space-between;
  }
  .filter-tabs button {
    font-size: 11px;
  }
  .detail-meta {
    gap: 20px;
  }
  .toast {
    bottom: 12px;
    left: 12px;
    right: 12px;
  }
  .auth-options {
    flex-wrap: wrap;
  }
  .inline-form {
    flex-direction: column;
  }
  .panel {
    padding: 22px;
  }
}
```

### taskly-frontend/src/lib/tasks.js

```javascript
export const statusOf = (t) =>
  t.completed ? "done" : t.status === "in-progress" ? "in-progress" : "todo";
export const dateKey = (value = new Date()) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// Due dates represent a calendar day, not an instant in UTC.
export const dueKey = (t) => (t.dueDate ? String(t.dueDate).slice(0, 10) : "");
export const overdue = (t) =>
  !t.completed && !t.archived && dueKey(t) && dueKey(t) < dateKey();
export const dueLabel = (t) =>
  !dueKey(t)
    ? "No due date"
    : dueKey(t) === dateKey()
      ? "Today"
      : new Date(dueKey(t) + "T12:00:00").toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        });
export function normalizeTask(t) {
  return {
    ...t,
    status: statusOf(t),
    category: t.category || "Personal",
    subtasks: t.subtasks || [],
    archived: !!t.archived,
  };
}
export const weekData = (tasks) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const key = dateKey(d);
    return {
      key,
      label: d.toLocaleDateString("en", { weekday: "short" }),
      value: tasks.filter(
        (t) => t.completed && t.completedAt && dateKey(t.completedAt) === key,
      ).length,
    };
  });
export function streakOf(tasks) {
  const days = new Set(
    tasks.filter((t) => t.completedAt).map((t) => dateKey(t.completedAt)),
  );
  let d = new Date(),
    count = 0;
  if (!days.has(dateKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dateKey(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
```

### taskly-frontend/src/main.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### taskly-frontend/src/pages/Auth.jsx

```jsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { messageOf } from "../api";
import AuthLayout from "../components/AuthLayout";
export default function Auth({ mode = "login" }) {
  const register = mode === "register",
    forgot = mode === "forgot",
    reset = mode === "reset",
    navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      confirm: "",
    }),
    [remember, setRemember] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if ((register || reset) && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      if (forgot) {
        const { data } = await api.post("/auth/forgot-password", {
          email: form.email,
        });
        setNotice(data.message);
      } else if (reset) {
        await api.post("/auth/reset-password", {
          token: params.get("token"),
          password: form.password,
        });
        setNotice("Password updated. You can sign in now.");
      } else {
        const { data } = await api.post(
          "/auth/" + (register ? "register" : "login"),
          { name: form.name, email: form.email, password: form.password },
        );
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        (remember ? localStorage : sessionStorage).setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  }
  const title = register
    ? "Create your account"
    : forgot
      ? "Let’s get you back in"
      : reset
        ? "Choose a new password"
        : "Welcome back";
  return (
    <AuthLayout register={register}>
      <h1>{title}</h1>
      <p className="muted">
        {register
          ? "Start organizing your day in a few simple steps."
          : forgot
            ? "Enter your account email to request a reset link."
            : reset
              ? "Choose a strong password for your account."
              : "Sign in to pick up where you left off."}
      </p>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="success" role="status">
          {notice}
        </div>
      )}
      <form onSubmit={submit}>
        {register && (
          <label>
            Full name
            <input
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={change}
              placeholder="Enter your full name"
              required
              maxLength={100}
            />
          </label>
        )}
        {!reset && (
          <label>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={change}
              placeholder="you@example.com"
              required
            />
          </label>
        )}
        {!forgot && (
          <label>
            {reset ? "New password" : "Password"}
            <input
              name="password"
              type="password"
              autoComplete={
                register || reset ? "new-password" : "current-password"
              }
              value={form.password}
              onChange={change}
              placeholder={
                register
                  ? "Create a password (at least 8 characters)"
                  : "Enter your password"
              }
              required
              minLength={register || reset ? 8 : 1}
              maxLength={128}
            />
          </label>
        )}
        {(register || reset) && (
          <label>
            Confirm password
            <input
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={change}
              placeholder="Re-enter your password"
              required
            />
          </label>
        )}
        {!register && !forgot && !reset && (
          <div className="auth-options">
            <label className="check-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />{" "}
              Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        )}
        <button
          className="primary full"
          disabled={busy || (reset && !params.get("token"))}
        >
          {busy
            ? "Please wait…"
            : register
              ? "Create account"
              : forgot
                ? "Send reset link"
                : reset
                  ? "Reset password"
                  : "Sign in"}
        </button>
      </form>
      {reset && !params.get("token") && (
        <p className="error">Open the reset link from your email.</p>
      )}
      <p className="auth-switch">
        {register ? (
          <Link to="/login">Already have an account? Sign in</Link>
        ) : forgot || reset ? (
          <Link to="/login">Back to sign in</Link>
        ) : (
          <Link to="/register">New to Taskly? Create an account</Link>
        )}
      </p>
    </AuthLayout>
  );
}
```

### taskly-frontend/src/pages/Workspace.jsx

```jsx
import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import TaskRow from "../components/TaskRow";
import {
  dateKey,
  dueKey,
  dueLabel,
  overdue,
  statusOf,
  weekData,
  streakOf,
} from "../lib/tasks";
export function Heading({ title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title = "No tasks found",
  body = "Add a task to start making progress.",
}) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">✓</div>
      <h3>{title}</h3>
      <p className="muted">{body}</p>
      <Link className="button primary" to="/tasks/new">
        + New task
      </Link>
    </div>
  );
}
export function Stats({ tasks }) {
  const active = tasks.filter((t) => !t.archived);
  return (
    <div className="stats">
      {[
        ["Total tasks", active.length],
        ["In progress", active.filter((t) => !t.completed).length],
        ["Completed", active.filter((t) => t.completed).length],
        ["Overdue", active.filter(overdue).length],
      ].map(([label, val]) => (
        <div
          key={label}
          className={"stat-card " + (label === "Completed" ? "mint" : "")}
        >
          <span>{label}</span>
          <strong>{val}</strong>
        </div>
      ))}
    </div>
  );
}
export function TaskList({
  mode = "all",
  tasks,
  user,
  onUpdate,
  onDelete,
  busy,
}) {
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState("all"),
    [priority, setPriority] = useState("all");
  const search = params.get("q") || "";
  const titles = {
    overview: "Good morning, " + (user.name?.split(" ")[0] || "there"),
    all: "All your tasks",
    today: "Today’s tasks",
    completed: "Look at your progress",
    archive: "Archive",
    search: "Search results",
  };
  const base = tasks
    .filter((t) => (mode === "archive" ? t.archived : !t.archived))
    .filter((t) =>
      mode === "today"
        ? dueKey(t) === dateKey()
        : mode === "completed"
          ? t.completed
          : true,
    );
  const shown = base
    .filter(
      (t) =>
        filter === "all" || (filter === "done" ? t.completed : !t.completed),
    )
    .filter((t) => priority === "all" || t.priority === priority)
    .filter((t) =>
      (t.title + " " + t.description + " " + t.category)
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  return (
    <>
      <Heading
        title={titles[mode]}
        subtitle={
          mode === "overview"
            ? "Let’s turn today’s plans into progress."
            : mode === "completed"
              ? "Completed tasks stay here. You can reopen them anytime."
              : mode === "archive"
                ? "Restore an archived task whenever you need it."
                : "Keep your next step clear and achievable."
        }
      />
      {mode === "overview" && <Stats tasks={tasks} />}
      <div className="section-heading">
        <h2>{mode === "archive" ? "Archived tasks" : "Your tasks"}</h2>
        <Link className="button primary" to="/tasks/new">
          + New task
        </Link>
      </div>
      <div className="toolbar">
        <input
          aria-label="Search tasks"
          className="search"
          placeholder="Search your tasks…"
          value={search}
          onChange={(e) =>
            setParams(e.target.value ? { q: e.target.value } : {}, {
              replace: true,
            })
          }
        />
        <div className="filter-tabs">
          {[
            ["all", "All tasks"],
            ["active", "In progress"],
            ["done", "Completed"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          aria-label="Priority filter"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="all">All priorities</option>
          {["high", "medium", "low"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      <div className="task-list">
        {shown.map((t) => (
          <TaskRow
            key={t._id}
            task={t}
            onUpdate={onUpdate}
            onDelete={onDelete}
            busy={busy}
          />
        ))}
        {!shown.length && (
          <Empty
            body={
              search
                ? "Try a different search or filter."
                : mode === "archive"
                  ? "Archived tasks will appear here."
                  : "Create your first task using New task."
            }
          />
        )}
      </div>
      <p className="muted small">
        Showing {shown.length} of {base.length} tasks
      </p>
    </>
  );
}
export function TaskForm({ tasks, onSave, busy }) {
  const { id } = useParams(),
    navigate = useNavigate();
  const task = tasks.find((t) => t._id === id);
  const [form, setForm] = useState(
    task
      ? { ...task, dueDate: dueKey(task) }
      : {
          title: "",
          description: "",
          category: "Personal",
          dueDate: "",
          priority: "medium",
          status: "todo",
        },
  );
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [sub, setSub] = useState("");
  if (id && !task)
    return <Empty title="Task not found" body="It may have been deleted." />;
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    const ok = await onSave(id, {
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate,
      subtasks,
    });
    if (ok) navigate("/tasks");
  }
  return (
    <>
      <Link className="back-link" to="/tasks">
        ← Back to tasks
      </Link>
      <form className="panel task-form" onSubmit={submit}>
        <h1>{id ? "Edit task" : "Create a new task"}</h1>
        <p className="muted">Keep the next step clear and achievable.</p>
        <label>
          Task title *
          <input
            name="title"
            value={form.title}
            onChange={change}
            required
            maxLength={200}
            placeholder="What needs to get done?"
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            rows={4}
            maxLength={5000}
            placeholder="Add a few details about this task…"
          />
        </label>
        <div className="form-grid">
          <label>
            Due date
            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={change}
            />
          </label>
          <label>
            Priority
            <select name="priority" value={form.priority} onChange={change}>
              {["low", "medium", "high"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Category
            <input
              name="category"
              value={form.category}
              onChange={change}
              maxLength={80}
            />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={change}>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Completed</option>
            </select>
          </label>
        </div>
        <fieldset>
          <legend>Subtasks</legend>
          {subtasks.map((s, i) => (
            <div className="subtask" key={i}>
              <input
                aria-label={"Complete " + s.title}
                type="checkbox"
                checked={s.completed}
                onChange={() =>
                  setSubtasks(
                    subtasks.map((v, j) =>
                      j === i ? { ...v, completed: !v.completed } : v,
                    ),
                  )
                }
              />
              <span>{s.title}</span>
              <button
                type="button"
                className="text-button"
                onClick={() => setSubtasks(subtasks.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="inline-form">
            <input
              aria-label="New subtask"
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              placeholder="Add a subtask"
              maxLength={200}
            />
            <button
              type="button"
              className="secondary"
              onClick={() => {
                if (sub.trim()) {
                  setSubtasks([
                    ...subtasks,
                    { title: sub.trim(), completed: false },
                  ]);
                  setSub("");
                }
              }}
            >
              Add
            </button>
          </div>
        </fieldset>
        <div className="actions">
          <button className="primary" disabled={busy}>
            {busy ? "Saving…" : id ? "Save changes" : "Create task"}
          </button>
          <Link className="button secondary" to="/tasks">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
export function TaskDetails({ tasks, onUpdate, onDelete, busy }) {
  const { id } = useParams();
  const task = tasks.find((t) => t._id === id);
  if (!task) return <Empty title="Task not found" />;
  return (
    <>
      <Link className="back-link" to="/tasks">
        ← Back to tasks
      </Link>
      <section className="panel detail-panel">
        <p className="eyebrow">
          {task.category} / {task.priority} priority
        </p>
        <h1>{task.title}</h1>
        <p className="description">
          {task.description || "No description added."}
        </p>
        <div className="detail-meta">
          <span>
            Status <strong>{statusOf(task).replace("-", " ")}</strong>
          </span>
          <span>
            Due date <strong>{dueLabel(task)}</strong>
          </span>
        </div>
        <h2>
          Subtasks · {task.subtasks.filter((s) => s.completed).length} of{" "}
          {task.subtasks.length} complete
        </h2>
        {task.subtasks.length ? (
          task.subtasks.map((s, i) => (
            <label className="subtask" key={s._id || i}>
              <input
                type="checkbox"
                checked={s.completed}
                disabled={busy}
                onChange={() =>
                  onUpdate(id, {
                    subtasks: task.subtasks.map((v, j) =>
                      j === i ? { ...v, completed: !v.completed } : v,
                    ),
                  })
                }
              />
              {s.title}
            </label>
          ))
        ) : (
          <p className="muted">Add subtasks from Edit task.</p>
        )}
        <div className="actions">
          <Link className="button primary" to={"/tasks/" + id + "/edit"}>
            Edit task
          </Link>
          <button
            disabled={busy}
            onClick={() => onUpdate(id, { completed: !task.completed })}
          >
            {task.completed ? "Reopen task" : "Mark complete"}
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => onUpdate(id, { archived: !task.archived })}
          >
            {task.archived ? "Restore task" : "Archive"}
          </button>
          <button className="danger" onClick={() => onDelete(task)}>
            Delete task
          </button>
        </div>
        <hr />
        <h2>Activity</h2>
        <p className="muted">
          Created {new Date(task.createdAt).toLocaleString()}
        </p>
        <p className="muted">
          Last updated {new Date(task.updatedAt).toLocaleString()}
        </p>
        {task.completedAt && (
          <p className="muted">
            Completed {new Date(task.completedAt).toLocaleString()}
          </p>
        )}
      </section>
    </>
  );
}
export function Board({ tasks, onUpdate, busy }) {
  const [priority, setPriority] = useState("all"),
    [category, setCategory] = useState("all");
  const active = tasks.filter(
    (t) =>
      !t.archived &&
      (priority === "all" || t.priority === priority) &&
      (category === "all" || t.category === category),
  );
  return (
    <>
      <Heading
        title="Task board"
        subtitle="See your work move from an idea to done."
      />
      <div className="toolbar">
        <Link className="button primary" to="/tasks/new">
          + New task
        </Link>
        <select
          aria-label="Filter priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="all">All priorities</option>
          {["high", "medium", "low"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <select
          aria-label="Filter category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {[...new Set(tasks.map((t) => t.category))].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      <div className="board">
        {[
          ["todo", "To do"],
          ["in-progress", "In progress"],
          ["done", "Done"],
        ].map(([value, label]) => (
          <section
            className="board-column"
            key={value}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (active.some((t) => t._id === id))
                onUpdate(id, { status: value });
            }}
          >
            <h3>
              {label} · {active.filter((t) => statusOf(t) === value).length}
            </h3>
            {active
              .filter((t) => statusOf(t) === value)
              .map((t) => (
                <article
                  className="board-card"
                  key={t._id}
                  draggable={!busy}
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", t._id)
                  }
                >
                  <small className="eyebrow">{t.category}</small>
                  <Link className="task-title" to={"/tasks/" + t._id}>
                    {t.title}
                  </Link>
                  <small className="muted">
                    {t.priority} priority · {dueLabel(t)}
                  </small>
                  <select
                    aria-label={"Move " + t.title}
                    value={statusOf(t)}
                    disabled={busy}
                    onChange={(e) =>
                      onUpdate(t._id, { status: e.target.value })
                    }
                  >
                    <option value="todo">To do</option>
                    <option value="in-progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </article>
              ))}
            {!active.some((t) => statusOf(t) === value) && (
              <p className="muted small">
                Drop a task here, or create a new one.
              </p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
export function Calendar({ tasks, settings }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const monday = settings?.weekStarts !== "sunday";
  const offset = (month.getDay() + (monday ? 6 : 0)) % 7;
  const count = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const slots = Math.ceil((offset + count) / 7) * 7;
  return (
    <>
      <Heading
        title="Calendar"
        subtitle="Plan ahead with your task due dates."
      />
      <div className="calendar-toolbar">
        <h2>
          {month.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="actions">
          <button
            className="secondary"
            aria-label="Previous month"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            ←
          </button>
          <button
            className="secondary"
            onClick={() =>
              setMonth(
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              )
            }
          >
            Today
          </button>
          <button
            className="secondary"
            aria-label="Next month"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            →
          </button>
        </div>
      </div>
      <div className="calendar panel">
        <div className="calendar-grid weekdays">
          {(monday
            ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          ).map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: slots }, (_, i) => {
            const day = i - offset + 1,
              key = dateKey(
                new Date(month.getFullYear(), month.getMonth(), day),
              ),
              inMonth = day > 0 && day <= count;
            return (
              <div
                key={i}
                className={
                  "calendar-cell " +
                  (!inMonth ? "outside" : "") +
                  (key === dateKey() ? " today" : "")
                }
              >
                {inMonth && (
                  <>
                    <strong>{day}</strong>
                    {tasks
                      .filter((t) => !t.archived && dueKey(t) === key)
                      .map((t) => (
                        <Link
                          key={t._id}
                          to={"/tasks/" + t._id}
                          className={t.completed ? "finished" : ""}
                        >
                          {t.title}
                        </Link>
                      ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
export function Analytics({ tasks }) {
  const active = tasks.filter((t) => !t.archived),
    done = active.filter((t) => t.completed),
    data = weekData(tasks),
    max = Math.max(1, ...data.map((d) => d.value));
  return (
    <>
      <Heading
        title="Analytics"
        subtitle="Your productivity at a glance. Based on your saved tasks."
      />
      <div className="stats">
        {[
          ["Completed", done.length],
          [
            "Completion rate",
            (active.length
              ? Math.round((done.length / active.length) * 100)
              : 0) + "%",
          ],
          ["Current streak", streakOf(tasks) + " days"],
          ["Overdue", active.filter(overdue).length],
        ].map(([a, b], i) => (
          <div className={"stat-card " + (i === 1 ? "mint" : "")} key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
          </div>
        ))}
      </div>
      <section className="panel">
        <h2>Tasks completed in the last 7 days</h2>
        <div
          className="chart"
          role="img"
          aria-label={data.map((d) => d.label + ": " + d.value).join(", ")}
        >
          {data.map((d) => (
            <div className="chart-column" key={d.key}>
              <strong>{d.value}</strong>
              <div
                className="chart-bar"
                style={{ height: Math.max(2, (d.value / max) * 190) }}
              />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
        <p className="small muted">
          Older completed tasks without a completion timestamp count in totals,
          but not the daily chart.
        </p>
      </section>
    </>
  );
}
export function Notifications({ tasks, settings }) {
  const [tomorrow] = useState(() => {
    const day = new Date();
    day.setDate(day.getDate() + 1);
    return dateKey(day);
  });
  const upcoming = tasks.filter(
    (t) => !t.archived && !t.completed && dueKey(t) && dueKey(t) <= tomorrow,
  );
  return (
    <>
      <Heading
        title="Notifications"
        subtitle="Task reminders in your workspace."
      />
      {settings?.reminders === false ? (
        <section className="panel">
          <p>Task reminders are turned off.</p>
          <Link to="/settings">Manage settings →</Link>
        </section>
      ) : upcoming.length ? (
        upcoming.map((t) => (
          <Link
            className="panel notification"
            key={t._id}
            to={"/tasks/" + t._id}
          >
            <h3>
              {overdue(t)
                ? "Overdue task"
                : dueKey(t) === dateKey()
                  ? "Due today"
                  : "Due tomorrow"}
            </h3>
            <p className="muted">
              {t.title} · {dueLabel(t)}
            </p>
          </Link>
        ))
      ) : (
        <section className="panel">
          <h3>You’re all caught up</h3>
          <p className="muted">
            Tasks due today, tomorrow or overdue will appear here.
          </p>
        </section>
      )}
    </>
  );
}
export function Help() {
  return (
    <>
      <Heading
        title="Help center"
        subtitle="A little guidance when you need it."
      />
      {[
        [
          "How do I create a task?",
          "Choose New task, add a title, priority and due date, then select Create task.",
        ],
        [
          "How do I complete a task?",
          "Select the circle beside a task. You can reopen tasks from Completed.",
        ],
        [
          "How do I use the board?",
          "Drag a card between columns or use its status dropdown. Changes are saved to your account.",
        ],
        [
          "Can other users see my tasks?",
          "The API filters every task operation by the signed-in account.",
        ],
        [
          "How do reminders work?",
          "The Notifications page shows overdue tasks and tasks due today or tomorrow when reminders are enabled. Browser push and scheduled email reminders are not included.",
        ],
        [
          "How do I reset my password?",
          "Use Forgot password on the sign-in page. Email recovery requires the server’s SMTP configuration.",
        ],
      ].map(([a, b]) => (
        <details className="panel faq" key={a}>
          <summary>{a}</summary>
          <p className="muted">{b}</p>
        </details>
      ))}
    </>
  );
}
export function Account({ user, onSave, settingsPage = false, busy }) {
  const [form, setForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    timezone: user.timezone || "Asia/Colombo",
    settings: {
      theme: "light",
      weekStarts: "monday",
      reminders: true,
      ...user.settings,
    },
  });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setting = (key, val) =>
    setForm({ ...form, settings: { ...form.settings, [key]: val } });
  return (
    <>
      <Heading title={settingsPage ? "Settings" : "Profile"} />
      <form
        className="panel account-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(
            settingsPage
              ? { settings: form.settings }
              : { name: form.name, bio: form.bio, timezone: form.timezone },
          );
        }}
      >
        <h2>
          {settingsPage
            ? "Make Taskly work for you"
            : "Your personal information"}
        </h2>
        {settingsPage ? (
          <>
            <label>
              Appearance
              <select
                value={form.settings.theme}
                onChange={(e) => setting("theme", e.target.value)}
              >
                <option value="light">Light theme</option>
                <option value="dark">Dark theme</option>
              </select>
            </label>
            <label>
              Week starts on
              <select
                value={form.settings.weekStarts}
                onChange={(e) => setting("weekStarts", e.target.value)}
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.settings.reminders}
                onChange={(e) => setting("reminders", e.target.checked)}
              />{" "}
              Task reminders in Notifications
            </label>
            <p className="muted small">
              Scheduled email and browser push reminders are not enabled.
            </p>
          </>
        ) : (
          <>
            <label>
              Full name
              <input
                name="name"
                required
                maxLength={100}
                value={form.name}
                onChange={change}
              />
            </label>
            <label>
              Email address
              <input value={user.email || ""} readOnly />
              <small className="muted">Your sign-in email is read-only.</small>
            </label>
            <label>
              Bio
              <textarea
                name="bio"
                maxLength={500}
                rows={3}
                value={form.bio}
                onChange={change}
              />
            </label>
            <label>
              Time zone
              <input
                name="timezone"
                value={form.timezone}
                onChange={change}
                placeholder="Asia/Colombo"
              />
              <small className="muted">
                Stored in your profile. Calendar day views use your device’s
                local date.
              </small>
            </label>
          </>
        )}
        <button className="primary" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </>
  );
}
```

### taskly-frontend/vite.config.js

```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```
