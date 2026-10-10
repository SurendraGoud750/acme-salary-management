module Api
  module V1
    class ReportsController < ApplicationController
      def salaries
        records = SalaryRecord.current.joins(employee: :department)
        records = records.where(employees: { country_code: params[:country].upcase }) if params[:country].present?
        records = records.where(employees: { department_id: params[:department_id] }) if params[:department_id].present?
        result = records.group("departments.name", "employees.country_code", :currency, :pay_frequency)
          .pluck("departments.name", "employees.country_code", "salary_records.currency", "salary_records.pay_frequency",
                 Arel.sql("COUNT(*)"), Arel.sql("AVG(salary_records.amount)"))
          .map { |department, country, currency, frequency, count, average|
            { department: department, country_code: country, currency: currency, pay_frequency: frequency,
              employee_count: count, average_salary: average.to_f.round(2) }
          }
        render json: { data: result }
      end
    end
  end
end
