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
