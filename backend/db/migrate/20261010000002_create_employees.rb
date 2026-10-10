class CreateEmployees < ActiveRecord::Migration[7.1]
  def change
    create_table :employees do |t|
      t.string :employee_number, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.references :department, null: false, foreign_key: true
      t.string :country_code, null: false, limit: 2
      t.string :employment_status, null: false, default: "active"
      t.timestamps
    end
    add_index :employees, :employee_number, unique: true
    add_index :employees, :email, unique: true
    add_index :employees, :country_code
    add_index :employees, :employment_status
    add_index :employees, [:department_id, :country_code]
    add_index :employees, [:last_name, :first_name]
  end
end
