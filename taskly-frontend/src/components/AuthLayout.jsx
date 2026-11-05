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
