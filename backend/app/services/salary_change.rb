class SalaryChange
  class Error < StandardError; end

  def initialize(employee:, attributes:)
    @employee = employee
    @attributes = attributes
  end

  def call
    SalaryRecord.transaction do
      current = @employee.salary_records.current.order(effective_from: :desc).first
      start_date = Date.iso8601(@attributes.fetch(:effective_from).to_s)
      if current && start_date <= current.effective_from
        raise Error, "effective date must be later than the current salary start date"
      end
      current&.update!(effective_to: start_date - 1.day)
      @employee.salary_records.create!(@attributes)
    end
  rescue ActiveRecord::RecordInvalid => e
    raise Error, e.record.errors.full_messages.to_sentence
  end
end
