export type Salary = {
  id: number;
  amount: string;
  currency: string;
  pay_frequency: 'annual' | 'monthly' | 'hourly';
  effective_from: string;
  effective_to: string | null;
};
export type Employee = {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  department_id: number;
  department: string;
  country_code: string;
  employment_status: 'active' | 'on_leave' | 'inactive';
  current_salary: Salary | null;
  salary_records?: Salary[];
};
export type DashboardSummary = {
  employee_count: number;
  active_employee_count: number;
  country_count: number;
  department_count: number;
  employees_by_country: Record<string, number>;
  employees_by_department: Record<string, number>;
  salary_count_by_currency: Record<string, number>;
  average_salary_by_currency: Record<string, number>;
};
