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
