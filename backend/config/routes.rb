Rails.application.routes.draw do
  get "/up", to: proc { [200, { "Content-Type" => "application/json" }, [{ status: "ok" }.to_json]] }
  namespace :api do
    namespace :v1 do
      resources :employees, only: %i[index show create update] do
        resources :salary_records, only: %i[create], controller: "employee_salary_records"
      end
      get "dashboard/summary", to: "dashboard#summary"
      get "reports/salaries", to: "reports#salaries"
    end
  end
end
