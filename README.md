# ACME Salary Management

A take-home assessment starter implementation for managing employee salary records across countries.

## Stack
- Backend: Ruby on Rails API, PostgreSQL, RSpec
- Frontend: React + TypeScript + Vite + Material UI
- Demo data: deterministic seed script for 10,000 employees
- Product artifacts: requirements, architecture, trade-offs, testing, AI usage, performance, demo script

> This repository is a runnable project scaffold with a working React demo mode and Rails API source. It has not been deployed from this environment. Review and run the commands below, then deploy using the guide in `docs/deployment.md`.

## Quick start

### Frontend demo
```bash
cd frontend
npm install
npm run dev
```
The UI uses a built-in deterministic mock data adapter by default, so the dashboard, directory, filters, employee profile, and salary-change form can be reviewed without a running backend.

### Rails API
Requires Ruby, Bundler, and PostgreSQL.
```bash
cd backend
cp .env.example .env
bundle install
bin/rails db:create db:migrate
bin/rails db:seed
bundle exec rspec
bin/rails server -p 3000
```
Set `VITE_API_BASE_URL=http://localhost:3000/api/v1` in `frontend/.env.local` to use the API rather than demo mode.

## Demo login / security note
The local demo uses synthetic data only. Authentication is intentionally documented as a deployment hardening requirement; do not expose salary data publicly until authentication and HR authorization are enabled. The scaffold includes a simple API key gate that can be enabled using `HR_API_TOKEN`.

## Core features
- Employee directory with search, department/country/status filters, sorting and pagination
- Salary profile with historical records
- Salary change form with amount/currency/frequency/effective-date validation
- Dashboard and reports, explicitly grouped by currency rather than mixing currencies
- Seed script for 10,000 deterministic synthetic employees
- Backend tests for employee search, salary validation, and transactional salary history

## Assessment artifacts
See `docs/`.
