# Deployment guide

This repository has not been deployed automatically. Deploy only after running the tests and enabling proper authentication.

## Suggested hosting
- Frontend: Vercel or Netlify, build command `npm run build`, output directory `dist`.
- Rails API: Render or Railway, root directory `backend`, start command `bundle exec puma -C config/puma.rb`.
- Database: managed PostgreSQL provided by the backend host.

## Environment variables
Backend:
- `DATABASE_URL` — managed PostgreSQL URL.
- `RAILS_MASTER_KEY` — if encrypted credentials are used.
- `HR_API_TOKEN` — optional private staging token; configure a long random value.
- `FRONTEND_ORIGIN` — exact deployed frontend origin for CORS.

Frontend:
- `VITE_API_BASE_URL` — e.g. `https://your-api-host.example/api/v1`.
- `VITE_DEMO_MODE=false` — disables mock data and uses the API.

## Release checklist
- [ ] Run migrations against the production database.
- [ ] Seed synthetic demo data through a controlled one-off command.
- [ ] Verify health endpoint and API connectivity.
- [ ] Configure CORS to the exact frontend origin.
- [ ] Enable real authentication/authorization before public access.
- [ ] Confirm secrets are not committed.
- [ ] Run browser smoke tests.
