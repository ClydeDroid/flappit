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
    uidstr = current_user.id.to_s
    if comment.upvoters.delete(uidstr)
      comment.upvotes -= 1
    elsif comment.downvoters.delete(uidstr)
      comment.upvotes += 2
      comment.upvoters << uidstr
    else
      comment.upvotes += 1
      comment.upvoters << uidstr
    end
    comment.save!
    respond_with post, comment
  end

  def downvote
    post = Post.find(params[:post_id])
    comment = post.comments.find(params[:id])
    uidstr = current_user.id.to_s
    if comment.downvoters.delete(uidstr)
      comment.upvotes += 1
    elsif comment.upvoters.delete(uidstr)
      comment.upvotes -= 2
      comment.downvoters << uidstr
    else
      comment.upvotes -= 1
      comment.downvoters << uidstr
    end
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
