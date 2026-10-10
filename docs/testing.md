# Testing strategy

## Backend
Run `cd backend && bundle exec rspec`.
- Model validations: employee uniqueness and salary amount/currency/frequency.
- API: employee search/pagination and invalid salary payloads.
- Salary service: closes prior salary period and adds new record atomically.

The RSpec suite uses a small number of fixtures created per test; it does not seed all 10,000 records.

## Frontend
Run `cd frontend && npm test`.
- Salary form validation.
- Filtering and search behavior.
- Demo-mode employee directory rendering.

## Manual smoke test
1. Start Rails and frontend with API mode enabled.
2. Search for `EMP-00042`.
3. Open an employee and confirm salary history.
4. Submit a valid salary change effective on a later date.
5. Confirm the old salary gets an end date and the new one is current.
6. Change department/country filters and compare dashboard counts.

## Performance checks
Seed 10,000 employees, inspect the employee listing query with `EXPLAIN ANALYZE`, and record p50/p95 latency on the deployment platform before making performance claims.
