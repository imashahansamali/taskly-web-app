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
