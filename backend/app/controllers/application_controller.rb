class ApplicationController < ActionController::API
  before_action :require_hr_token!

  private

  # Optional private-staging gate. Replace with user authentication + HR role authorization
  # before any public deployment or use of real salary data.
  def require_hr_token!
    expected = ENV["HR_API_TOKEN"].to_s
    return if expected.empty? # local development only; production must configure auth

    supplied = request.headers["Authorization"].to_s.delete_prefix("Bearer ")
    head :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(supplied, expected)
  end

  def render_errors(record)
    render json: { errors: record.errors.to_hash }, status: :unprocessable_entity
  end
end
