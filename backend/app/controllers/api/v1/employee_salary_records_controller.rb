module Api
  module V1
    class EmployeeSalaryRecordsController < ApplicationController
      def create
        employee = Employee.find(params[:employee_id])
        record = SalaryChange.new(employee: employee, attributes: salary_params).call
        render json: { data: { id: record.id, amount: record.amount.to_s("F"), currency: record.currency,
          pay_frequency: record.pay_frequency, effective_from: record.effective_from, effective_to: record.effective_to } }, status: :created
      rescue SalaryChange::Error => e
        render json: { errors: { salary: [e.message] } }, status: :unprocessable_entity
      rescue ActionController::ParameterMissing => e
        render json: { errors: { request: [e.message] } }, status: :bad_request
      end

      private

      def salary_params
        params.require(:salary_record).permit(:amount, :currency, :pay_frequency, :effective_from)
      end
    end
  end
end
