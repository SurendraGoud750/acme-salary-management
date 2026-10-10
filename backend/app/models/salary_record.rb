class SalaryRecord < ApplicationRecord
  belongs_to :employee

  CURRENCIES = %w[USD EUR GBP INR CAD AUD SGD].freeze
  FREQUENCIES = %w[annual monthly hourly].freeze

  validates :amount, numericality: { greater_than: 0 }
  validates :currency, inclusion: { in: CURRENCIES }
  validates :pay_frequency, inclusion: { in: FREQUENCIES }
  validates :effective_from, presence: true
  validate :effective_to_after_effective_from
  validate :no_overlapping_periods

  scope :current, -> { where(effective_to: nil) }

  private

  def effective_to_after_effective_from
    return if effective_to.blank? || effective_from.blank? || effective_to > effective_from
    errors.add(:effective_to, "must be after effective from")
  end

  def no_overlapping_periods
    return if employee_id.blank? || effective_from.blank?
    candidates = self.class.where(employee_id: employee_id).where.not(id: id)
    candidates = candidates.where("effective_from <= ?", effective_to || Date.new(9999, 12, 31))
    candidates = candidates.where("effective_to IS NULL OR effective_to >= ?", effective_from)
    errors.add(:base, "salary period overlaps an existing record") if candidates.exists?
  end
end
