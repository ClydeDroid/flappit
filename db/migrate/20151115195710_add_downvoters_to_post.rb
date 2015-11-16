class AddDownvotersToPost < ActiveRecord::Migration
  def change
    add_column :posts, :downvoters, :text, array:true, default: []
    rename_column :posts, :voters, :upvoters
  end
end
