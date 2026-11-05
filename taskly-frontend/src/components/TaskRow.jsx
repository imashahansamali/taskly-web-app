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
