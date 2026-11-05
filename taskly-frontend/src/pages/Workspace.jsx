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
