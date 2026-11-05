# Verification

- Frontend `npm run build`: passed (React/Vite production build).
- Frontend `npm run lint`: passed.
- Backend `npm test`: 7 passing HTTP/model tests. Includes authentication requirement, account scoping, owner/operator injection filtering, completion timestamp, inaccessible task rejection, malformed ID/blank title handling and compatibility defaults.
- These backend tests stub database methods and use real Express routing/JWT verification. They do not connect to MongoDB Atlas.
- Browser visual/end-to-end testing could not run: the environment had no browser executable, and browser downloads returned truncated archives. Do not treat the build as a pixel-perfect browser verification.
- SMTP delivery and live Atlas connectivity were not tested; configure your own `.env` locally. Uploaded secrets were not used.
- Native editable Figma node context and screenshots informed layout/colors/typography. No UI screenshot is embedded in the implementation.

## Local acceptance checklist

1. Start both servers following README; register/login.
2. Add a task with date, priority, category and subtasks; reload and confirm persistence.
3. Edit, complete/reopen, archive/restore and delete with confirmation.
4. Switch task board status with dropdown and drag/drop.
5. Search, filter, navigate calendar months; inspect Today/Completed/Analytics.
6. Save profile; choose dark theme and Sunday start; reload.
7. Sign in as another user and confirm tasks are separate.
8. Configure SMTP, request recovery email, reset password and verify old sessions are rejected.
9. Test mobile menu at a narrow browser width.
