require "rails_helper"

RSpec.describe SalaryChange do
  it "closes the previous salary and creates the new salary record" do
    department = Department.create!(name: "Engineering")
    employee = Employee.create!(employee_number: "EMP-SAL", first_name: "Salary", last_name: "Test",
      email: "salary@example.com", department: department, country_code: "IN", employment_status: "active")
    old = employee.salary_records.create!(amount: 50000, currency: "INR", pay_frequency: "annual", effective_from: Date.new(2024, 1, 1))
    fresh = described_class.new(employee: employee, attributes: {
      amount: "60000", currency: "INR", pay_frequency: "annual", effective_from: "2025-01-01"
    }).call

    expect(old.reload.effective_to).to eq(Date.new(2024, 12, 31))
    expect(fresh.effective_to).to be_nil
    expect(employee.salary_records.current.count).to eq(1)
  end
end
