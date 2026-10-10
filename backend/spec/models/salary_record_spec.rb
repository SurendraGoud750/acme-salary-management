require "rails_helper"

RSpec.describe SalaryRecord, type: :model do
  let(:department) { Department.create!(name: "Engineering") }
  let(:employee) do
    Employee.create!(employee_number: "EMP-TEST", first_name: "Test", last_name: "User",
      email: "test@example.com", department: department, country_code: "IN", employment_status: "active")
  end

  it "rejects a non-positive salary" do
    record = SalaryRecord.new(employee: employee, amount: 0, currency: "INR", pay_frequency: "annual", effective_from: Date.today)
    expect(record).not_to be_valid
    expect(record.errors[:amount]).not_to be_empty
  end

  it "rejects an unsupported currency" do
    record = SalaryRecord.new(employee: employee, amount: 50_000, currency: "XYZ", pay_frequency: "annual", effective_from: Date.today)
    expect(record).not_to be_valid
  end
end
