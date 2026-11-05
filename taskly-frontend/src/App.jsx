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
