class CreateSalaryRecords < ActiveRecord::Migration[7.1]
  def change
    create_table :salary_records do |t|
      t.references :employee, null: false, foreign_key: true
      t.decimal :amount, precision: 14, scale: 2, null: false
      t.string :currency, null: false, limit: 3
      t.string :pay_frequency, null: false
      t.date :effective_from, null: false
      t.date :effective_to
      t.timestamps
    end
    add_index :salary_records, [:employee_id, :effective_from]
    add_index :salary_records, [:currency, :effective_to]
  end
end
