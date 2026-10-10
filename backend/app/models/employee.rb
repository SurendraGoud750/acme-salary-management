class Employee < ApplicationRecord
  belongs_to :department
  has_many :salary_records, -> { order(effective_from: :desc, id: :desc) }, dependent: :destroy

  enum :employment_status, { active: "active", on_leave: "on_leave", inactive: "inactive" }

  validates :employee_number, presence: true, uniqueness: true
  validates :first_name, :last_name, :email, :country_code, presence: true
  validates :email, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :country_code, length: { is: 2 }

  scope :search_text, ->(q) {
    return all if q.blank?
    escaped = "%#{sanitize_sql_like(q.strip)}%"
    where("first_name ILIKE :q OR last_name ILIKE :q OR employee_number ILIKE :q OR email ILIKE :q", q: escaped)
  }
end
