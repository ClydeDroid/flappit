class AddVotersToPost < ActiveRecord::Migration
  def change
    add_column :posts, :voters, :text, array:true, default: []
  end
end
