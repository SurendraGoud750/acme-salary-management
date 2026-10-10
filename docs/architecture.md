# Architecture

## Overview
React + TypeScript SPA → versioned Rails JSON API → PostgreSQL.

The frontend separates UI components from the data adapter. Demo mode uses deterministic synthetic records so reviewers can inspect the UX immediately; API mode uses `VITE_API_BASE_URL`.

## Domain
- `Employee` has many `SalaryRecord`s.
- A salary record has amount (`decimal`), currency, frequency, `effective_from`, and optional `effective_to`.
- A current salary record has no `effective_to`.
- Salary changes run in a database transaction: close the current period and insert the new record together.

## API
- `GET /api/v1/employees`: query, filter, sort, paginate.
- `GET /api/v1/employees/:id`: employee and salary history.
- `POST /api/v1/employees`: create employee.
- `PATCH /api/v1/employees/:id`: update employee attributes.
- `POST /api/v1/employees/:id/salary_records`: append a salary period.
- `GET /api/v1/dashboard/summary`: headcount and salary stats grouped by currency.
- `GET /api/v1/reports/salaries`: report grouped by department/country/currency.

## Data integrity
- Unique employee number and email.
- Decimal salary amount, positive-only validation.
- Database foreign key from salary records to employees.
- Salary changes use transactions.
- Currency is preserved. Cross-currency averages are never calculated.

## Security boundary
The API supports an optional `HR_API_TOKEN` bearer token gate. For public deployment, add real authentication (e.g. Devise/JWT or an OIDC provider), HR role authorization, rate limiting, audit logs, HTTPS, secret management, and a restricted CORS allowlist before using real salary data.
