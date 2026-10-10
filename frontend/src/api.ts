import { dashboardFromEmployees, demoEmployees } from './data';
import type { DashboardSummary, Employee, Salary } from './types';

const demoMode = import.meta.env.VITE_DEMO_MODE !== 'false';
const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');
let demoData = demoEmployees;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.errors ? JSON.stringify(body.errors) : `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getEmployees(params: { search?: string; country?: string; department?: string; status?: string; page?: number; perPage?: number }) {
  if (demoMode) {
    let rows = demoData;
    if (params.search) {
      const q = params.search.toLowerCase();
      rows = rows.filter(e => [e.full_name, e.employee_number, e.email].some(v => v.toLowerCase().includes(q)));
    }
    if (params.country) rows = rows.filter(e => e.country_code === params.country);
    if (params.department) rows = rows.filter(e => String(e.department_id) === params.department);
    if (params.status) rows = rows.filter(e => e.employment_status === params.status);
    const page = params.page || 1; const perPage = params.perPage || 25;
    return { data: rows.slice((page - 1) * perPage, page * perPage), meta: { page, per_page: perPage, total: rows.length, total_pages: Math.ceil(rows.length / perPage) } };
  }
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.country) query.set('country', params.country);
  if (params.department) query.set('department_id', params.department);
  if (params.status) query.set('status', params.status);
  query.set('page', String(params.page || 1)); query.set('per_page', String(params.perPage || 25));
  return request<{data: Employee[]; meta: {page: number; per_page: number; total: number; total_pages: number}}>(`/employees?${query}`);
}
export async function getEmployee(id: number): Promise<Employee> {
  if (demoMode) return demoData.find(e => e.id === id) || demoData[0];
  const res = await request<{data: Employee}>(`/employees/${id}`); return res.data;
}
export async function getDashboard(): Promise<DashboardSummary> {
  if (demoMode) return dashboardFromEmployees(demoData);
  const res = await request<{data: DashboardSummary}>('/dashboard/summary'); return res.data;
}
export async function addSalary(id: number, salary: Omit<Salary, 'id' | 'effective_to'>): Promise<Salary> {
  if (demoMode) {
    const index = demoData.findIndex(e => e.id === id);
    if (index < 0) throw new Error('Employee not found');
    const employee = demoData[index];
    const old = employee.current_salary;
    if (old && salary.effective_from <= old.effective_from) throw new Error('Effective date must be later than current salary start date.');
    if (old) old.effective_to = new Date(new Date(salary.effective_from).getTime() - 86400000).toISOString().slice(0, 10);
    const fresh: Salary = { ...salary, id: Math.max(...(employee.salary_records || []).map(s => s.id), 0) + 1, effective_to: null };
    employee.salary_records = [fresh, ...(employee.salary_records || [])]; employee.current_salary = fresh;
    return fresh;
  }
  const res = await request<{data: Salary}>(`/employees/${id}/salary_records`, { method: 'POST', body: JSON.stringify({ salary_record: salary }) });
  return res.data;
}
export const departmentOptions = ['Engineering', 'Product', 'Finance', 'People', 'Sales', 'Operations', 'Legal', 'Marketing', 'Support'];
export const countryOptions = ['IN', 'US', 'GB', 'DE', 'CA', 'AU', 'SG', 'NL', 'FR', 'JP'];
