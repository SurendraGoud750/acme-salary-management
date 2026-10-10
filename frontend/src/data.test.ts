import { describe, expect, it } from 'vitest';
import { createDemoEmployees, dashboardFromEmployees } from './data';

describe('demo data', () => {
  it('creates exactly 10,000 deterministic synthetic employees by default', () => {
    const first = createDemoEmployees();
    const second = createDemoEmployees();
    expect(first).toHaveLength(10000);
    expect(first[41].employee_number).toBe('EMP-00042');
    expect(first[41].employee_number).toBe(second[41].employee_number);
    expect(first[41].email).toBe(second[41].email);
  });

  it('groups dashboard salary averages by currency', () => {
    const employees = createDemoEmployees(2);
    const summary = dashboardFromEmployees(employees);
    expect(summary.employee_count).toBe(2);
    expect(summary.country_count).toBe(2);
    expect(Object.keys(summary.average_salary_by_currency).length).toBeGreaterThan(0);
  });
});
