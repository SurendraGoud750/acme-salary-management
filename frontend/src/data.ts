import type { DashboardSummary, Employee, Salary } from './types';

const departments = ['Engineering', 'Product', 'Finance', 'People', 'Sales', 'Operations', 'Legal', 'Marketing', 'Support'];
const countries = ['IN', 'US', 'GB', 'DE', 'CA', 'AU', 'SG', 'NL', 'FR', 'JP'];
const currencies: Record<string, string> = { IN: 'INR', US: 'USD', GB: 'GBP', DE: 'EUR', CA: 'CAD', AU: 'AUD', SG: 'SGD', NL: 'EUR', FR: 'EUR', JP: 'USD' };
const firstNames = ['Aarav', 'Aditi', 'Arjun', 'Anaya', 'Dev', 'Diya', 'Ishaan', 'Kavya', 'Liam', 'Maya', 'Noah', 'Olivia', 'Rohan', 'Sara', 'Theo', 'Zara'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Mehta', 'Brown', 'Wilson', 'Taylor', 'Martin', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young'];
const money = (n: number) => String(n.toFixed(2));

export function createDemoEmployees(count = 10000): Employee[] {
  return Array.from({ length: count }, (_, i) => {
    const country = countries[i % countries.length];
    const salary: Salary = { id: i + 1, amount: money(42000 + ((i * 137) % 98000)), currency: currencies[country],
      pay_frequency: i % 12 === 0 ? 'monthly' : 'annual', effective_from: `${2022 + (i % 4)}-01-01`, effective_to: null };
    const first = firstNames[(i * 7) % firstNames.length];
    const last = lastNames[(i * 11) % lastNames.length] + (i % 9 === 0 ? 'son' : '');
    return { id: i + 1, employee_number: `EMP-${String(i + 1).padStart(5, '0')}`, first_name: first, last_name: last,
      full_name: `${first} ${last}`, email: `employee${i + 1}@acme.example`, department_id: (i % departments.length) + 1,
      department: departments[i % departments.length], country_code: country, employment_status: i % 31 === 0 ? 'inactive' : i % 47 === 0 ? 'on_leave' : 'active',
      current_salary: salary, salary_records: [salary] };
  });
}
export const demoEmployees = createDemoEmployees();

export function dashboardFromEmployees(employees: Employee[]): DashboardSummary {
  const countriesCount: Record<string, number> = {};
  const departmentsCount: Record<string, number> = {};
  const salaryCount: Record<string, number> = {};
  const salarySums: Record<string, number> = {};
  let active = 0;
  employees.forEach((e) => {
    countriesCount[e.country_code] = (countriesCount[e.country_code] || 0) + 1;
    departmentsCount[e.department] = (departmentsCount[e.department] || 0) + 1;
    if (e.employment_status === 'active') active++;
    const s = e.current_salary;
    if (s) {
      salaryCount[s.currency] = (salaryCount[s.currency] || 0) + 1;
      salarySums[s.currency] = (salarySums[s.currency] || 0) + Number(s.amount);
    }
  });
  return { employee_count: employees.length, active_employee_count: active, country_count: Object.keys(countriesCount).length,
    department_count: Object.keys(departmentsCount).length, employees_by_country: countriesCount, employees_by_department: departmentsCount,
    salary_count_by_currency: salaryCount, average_salary_by_currency: Object.fromEntries(Object.entries(salarySums).map(([k, v]) => [k, Math.round(v / salaryCount[k] * 100) / 100])) };
}
