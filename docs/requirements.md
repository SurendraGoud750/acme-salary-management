# Product Requirements — ACME Salary Management

## Goal
Replace spreadsheet-based salary tracking for ACME's 10,000 employees across multiple countries with a secure, web-based tool that helps HR maintain salary records and answer compensation questions.

## Primary user
HR Manager responsible for employee data quality, salary updates, and organization-level compensation reporting.

## In scope
- Create, view, and update employee records.
- Search by employee name or employee number; filter by department, country, and employment status.
- Server-side pagination and sorting for a 10,000-employee dataset.
- Store salary amount, original currency, pay frequency, and effective dates.
- Preserve salary history when a salary changes.
- Dashboard metrics for headcount, departments, countries, and salary summaries grouped by currency.
- Seed 10,000 deterministic synthetic employees.
- REST API, automated tests, responsive UI, deployment notes, and demo script.

## Out of scope (deliberate)
- Payroll execution, tax, payslip generation, and bank integrations: these require country-specific compliance rules and payment integrations.
- Live currency conversion: requires an approved FX source, timestamp policy, and clear audit trail.
- Bonuses, equity, benefits, compensation planning, and multi-stage approvals: valuable later, but not required to validate the core workflow.
- Enterprise SSO and multi-tenant organizations: one ACME organization is assumed for this version.

## Non-functional requirements
- Decimal-safe salary values, foreign keys, database indexes, and transactional salary changes.
- Clear validation and API error responses.
- Pagination rather than returning 10,000 rows in a single request.
- Automated tests with isolated fixtures and no dependency on the full seed.
- Synthetic data only; production access must require authentication and role-based authorization.

## Acceptance criteria
1. HR can search, filter, and page through 10,000 employees.
2. Salary updates retain the previous salary period and create a new current record.
3. Dashboard summaries never silently aggregate different currencies.
4. Invalid salary amounts/dates are rejected.
5. Tests cover core business rules and API behavior.
6. Setup, architecture, trade-offs, AI usage, performance, and demo instructions are documented.
