# Files to replace and add

Paths are relative to TaskNest/. Keep the original as a backup.

## REPLACE these existing files

- `taskly-backend/middleware/auth.js`
- `taskly-backend/models/Task.js`
- `taskly-backend/models/User.js`
- `taskly-backend/package-lock.json`
- `taskly-backend/package.json`
- `taskly-backend/routes/auth.js`
- `taskly-backend/routes/tasks.js`
- `taskly-backend/server.js`
- `taskly-frontend/README.md`
- `taskly-frontend/index.html`
- `taskly-frontend/src/App.jsx`
- `taskly-frontend/src/api.js`
- `taskly-frontend/src/index.css`

## ADD these new files

- `.gitignore`
- `README.md`
- `VERIFICATION.md`
- `taskly-backend/.env.example`
- `taskly-backend/tests/api.test.js`
- `taskly-frontend/.env.example`
- `taskly-frontend/src/components/AuthLayout.jsx`
- `taskly-frontend/src/components/Layout.jsx`
- `taskly-frontend/src/components/TaskRow.jsx`
- `taskly-frontend/src/lib/tasks.js`
- `taskly-frontend/src/pages/Auth.jsx`
- `taskly-frontend/src/pages/Workspace.jsx`

## REMOVE obsolete pages after App.jsx is replaced

- `taskly-frontend/src/pages/Login.jsx`
- `taskly-frontend/src/pages/Register.jsx`
- `taskly-frontend/src/pages/Tasks.jsx`

`Login.jsx` and `Register.jsx` are replaced by `Auth.jsx`. `Tasks.jsx` is replaced by `Workspace.jsx` and the shared components.
Keep your real backend `.env` local. Do not include node_modules or .env when sharing.
No separate npm install is needed for every page: run it once in each frontend/backend folder.
