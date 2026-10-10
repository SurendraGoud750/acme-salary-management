module Api
  module V1
    class DashboardController < ApplicationController
      def summary
        salaries = SalaryRecord.current.joins(:employee)
        currency_totals = salaries.group(:currency).count
        average_salaries = salaries.group(:currency).average(:amount).transform_values { |v| v&.round(2) }
        render json: {
          data: {
            employee_count: Employee.count,
            active_employee_count: Employee.active.count,
            country_count: Employee.distinct.count(:country_code),
            department_count: Department.count,
            employees_by_country: Employee.group(:country_code).count.sort.to_h,
            employees_by_department: Employee.joins(:department).group("departments.name").count.sort.to_h,
            salary_count_by_currency: currency_totals.sort.to_h,
            average_salary_by_currency: average_salaries.sort.to_h
          }
        }
      end
    end
  end
end
