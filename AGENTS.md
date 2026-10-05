# Project Hotel Agent Guide

## Repository Layout

- `project_reactJs/` is the React 19 + Vite frontend.
- `project_nodejs/` is the CommonJS Express 5 API with Sequelize 6 and PostgreSQL.
- The frontend calls the API at `http://localhost:3000` through `project_reactJs/src/Page/util/Request.jsx`.
- The API entrypoint is `project_nodejs/index.js`; feature routes live in `project_nodejs/router/`, controllers in `project_nodejs/controllers/`, and Sequelize models in `project_nodejs/models/`.

## Commands

Run commands from the relevant project directory:

```text
cd project_reactJs
npm run dev       # Vite development server
npm run lint      # ESLint
npm run build     # Production build
npm run preview   # Preview the production build

cd ../project_nodejs
npm start         # Nodemon API server on port 3000
npx sequelize-cli db:migrate  # Apply migrations when the database is configured
```

The backend `npm test` script is the default placeholder and intentionally exits with an error; do not treat it as a working test suite.

## Frontend Conventions

- Use React function components and the existing React Router structure in `src/App.jsx`.
- Keep authenticated dashboard pages under the `Protect`/`Layout` route tree and public guest pages under `LayoutPage`.
- Use `Request` for API calls so authorization headers, multipart form handling, and 401 redirects remain consistent. Do not duplicate Axios setup in individual pages.
- Existing dashboard CRUD pages use Ant Design for forms/modals and SweetAlert helpers for success, error, and delete confirmation feedback. Follow the local component and stylesheet pattern before introducing a new UI abstraction.
- Reuse the existing utility and storage modules, especially `src/Page/util/`, `src/Page/localStorage/`, and `src/swertalert/`.
- Preserve the repository's existing JavaScript/JSX style and run `npm run lint` after frontend changes.

## Backend Conventions

- Add new endpoints by wiring a router in `router/`, implementing handlers in `controllers/`, and using models from `models/`; register the router in `index.js`.
- Models define associations in `static associate(models)`, and `models/index.js` loads and connects all model files automatically.
- Keep API responses consistent with the established shape: `{ success, message, data }` for successful operations and the same fields with an appropriate HTTP error status for failures.
- Use `middlewares/auth.js` for JWT-protected routes and preserve the frontend's `Authorization: Bearer <token>` contract.
- Use Sequelize transactions for operations that write related records, such as user/profile, reservation/details, service/orders, and staff/room assignments. Roll back before returning after validation or persistence errors.
- Route handlers should log failures through `middlewares/logError.js` rather than leaking raw errors to clients.
- Keep schema changes in timestamped `migrations/`; update models and migrations together when changing persisted fields or relationships.

## Safety Checks

- Do not commit credentials or replace local database settings casually. `project_nodejs/config/config.json` currently contains development database credentials; prefer environment variables for new secrets and avoid exposing them in frontend code or logs.
- Check both API and UI callers when changing an endpoint, including response nesting and multipart field names.
- For changes involving authentication, uploads, transactions, or model associations, manually exercise the affected request path after lint/build checks because the repository has no meaningful automated backend test suite.

## Useful Examples

- Frontend CRUD and multipart form: `project_reactJs/src/Page/backend/roomType/RoomType.jsx`
- Frontend protected API page: `project_reactJs/src/Page/backend/Room/Room.jsx`
- Shared request/auth behavior: `project_reactJs/src/Page/util/Request.jsx`
- Backend validation and eager loading: `project_nodejs/controllers/Room.controller.js`
- Backend transaction with related records: `project_nodejs/controllers/reservation.controller.js`
- Model association pattern: `project_nodejs/models/room.js`