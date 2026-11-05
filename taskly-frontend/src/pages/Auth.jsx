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
