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
