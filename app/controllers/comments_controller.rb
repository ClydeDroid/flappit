class CommentsController < ApplicationController
  before_filter :authenticate_user!, only: [:create, :upvote, :downvote]

  def create
    post = Post.find(params[:post_id])
    comment = post.comments.create(comment_params.merge(user_id: current_user.id))
    respond_with post, comment
  end

  def upvote
    post = Post.find(params[:post_id])
    comment = post.comments.find(params[:id])
    comment.increment!(:upvotes)
    respond_with post, comment
  end

  def downvote
    post = Post.find(params[:post_id])
    comment = post.comments.find(params[:id])
    comment.upvotes = comment.upvotes-1
    comment.save!
    respond_with post, comment
  end

  def as_json(options = {})
    super(options.merge(include: :user))
  end

  private
  def comment_params
    params.require(:comment).permit(:body, :upvotes)
  end
end
