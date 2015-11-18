class AddVotersToComment < ActiveRecord::Migration
  def change
    add_column :comments, :upvoters, :text, array:true, default: []
    add_column :comments, :downvoters, :text, array:true, default: []
  end
end
