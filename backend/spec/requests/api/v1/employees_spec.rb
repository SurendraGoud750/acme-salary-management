require "rails_helper"

RSpec.describe "Employees API", type: :request do
  before do
    department = Department.create!(name: "Engineering")
    3.times do |i|
      Employee.create!(employee_number: format("EMP-%05d", i + 1), first_name: "Person#{i}", last_name: "Test",
        email: "person#{i}@example.com", department: department, country_code: i == 0 ? "IN" : "US", employment_status: "active")
    end
  end

  it "searches and paginates employees" do
    get "/api/v1/employees", params: { search: "EMP-00002", page: 1, per_page: 1 }
    expect(response).to have_http_status(:ok)
    json = response.parsed_body
    expect(json.dig("meta", "total")).to eq(1)
    expect(json.dig("data", 0, "employee_number")).to eq("EMP-00002")
  end

  it "caps page size at 100" do
    get "/api/v1/employees", params: { per_page: 1000 }
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig("meta", "per_page")).to eq(100)
  end
end
