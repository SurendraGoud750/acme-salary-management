module Api
  module V1
    class EmployeesController < ApplicationController
      SORT_COLUMNS = %w[first_name last_name employee_number country_code created_at].freeze

      def index
        page = [[params.fetch(:page, 1).to_i, 1].max, 1_000_000].min
        per_page = [[params.fetch(:per_page, 25).to_i, 1].max, 100].min
        employees = Employee.includes(:department).search_text(params[:search])
        employees = employees.where(country_code: params[:country].upcase) if params[:country].present?
        employees = employees.where(department_id: params[:department_id]) if params[:department_id].present?
        employees = employees.where(employment_status: params[:status]) if params[:status].present?
        sort = SORT_COLUMNS.include?(params[:sort]) ? params[:sort] : "last_name"
        direction = params[:direction] == "desc" ? :desc : :asc
        total = employees.count
        rows = employees.order(sort => direction).limit(per_page).offset((page - 1) * per_page)
        render json: { data: rows.map { |e| employee_json(e) }, meta: { page: page, per_page: per_page, total: total, total_pages: (total.to_f / per_page).ceil } }
      end

      def show
        employee = Employee.includes(:department, :salary_records).find(params[:id])
        render json: { data: employee_json(employee).merge(salary_records: employee.salary_records.map { |s| salary_json(s) }) }
      end

      def create
        employee = Employee.new(employee_params)
        if employee.save
          render json: { data: employee_json(employee) }, status: :created
        else
          render_errors(employee)
        end
      end

      def update
        employee = Employee.find(params[:id])
        if employee.update(employee_params)
          render json: { data: employee_json(employee) }
        else
          render_errors(employee)
        end
      end

      private

      def employee_params
        params.require(:employee).permit(:employee_number, :first_name, :last_name, :email, :department_id, :country_code, :employment_status)
      end

      def employee_json(e)
        { id: e.id, employee_number: e.employee_number, first_name: e.first_name, last_name: e.last_name,
          full_name: "#{e.first_name} #{e.last_name}", email: e.email, department_id: e.department_id,
          department: e.department.name, country_code: e.country_code, employment_status: e.employment_status,
          current_salary: e.salary_records.find { |s| s.effective_to.nil? }.then { |s| s && salary_json(s) } }
      end

      def salary_json(s)
        { id: s.id, amount: s.amount.to_s("F"), currency: s.currency, pay_frequency: s.pay_frequency,
          effective_from: s.effective_from, effective_to: s.effective_to }
      end
    end
  end
end
