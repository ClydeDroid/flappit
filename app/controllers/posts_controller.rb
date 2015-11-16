class PostsController < ApplicationController
  before_filter :authenticate_user!, only: [:create, :upvote, :downvote]

  def index
    respond_with Post.all
  end

  def create
    respond_with Post.create(post_params.merge(user_id: current_user.id))
  end

  def show
    respond_with Post.find(params[:id])
  end

  def upvote
    post = Post.find(params[:id])
    uidstr = current_user.id.to_s
    if post.upvoters.delete(uidstr)
      post.upvotes -= 1
    elsif post.downvoters.delete(uidstr)
      post.upvotes += 2
      post.upvoters << uidstr
    else
      post.upvotes += 1
      post.upvoters << uidstr
    end
    post.save!
    respond_with post
  end

  def downvote
    post = Post.find(params[:id])
    uidstr = current_user.id.to_s
    if post.downvoters.delete(uidstr)
      post.upvotes += 1
    elsif post.upvoters.delete(uidstr)
      post.upvotes -= 2
      post.downvoters << uidstr
    else
      post.upvotes -= 1
      post.downvoters << uidstr
    end
    post.save!
    respond_with post
  end

  private
  def post_params
    params.require(:post).permit(:link, :title, :upvotes)
  end
end
