# Performance considerations

- Employee listing uses server-side pagination with a bounded page size (maximum 100).
- Add indexes for `employee_number`, `email`, `department_id`, `country_code`, and `employment_status`.
- Salary history lookup is indexed by `employee_id` and effective date.
- Dashboard summary uses database aggregates and groups salaries by currency.
- Seed uses bulk inserts to reduce callback overhead while maintaining deterministic values.
- Avoid N+1 queries by eager-loading associations when rendering employee details.
- Do not claim measured throughput until tested in the target environment.

Suggested verification:
```sql
EXPLAIN ANALYZE SELECT * FROM employees
WHERE country_code = 'IN' AND employment_status = 'active'
ORDER BY last_name, first_name LIMIT 25 OFFSET 0;
```
