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
