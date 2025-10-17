import { useLocation, useNavigate, useParams } from "react-router-dom";
import BlogComment from "./BlogComment";
import { ArrowLeftIcon, HeartIcon } from "@heroicons/react/20/solid";
import {
  Heart,
  MessageCircle,
  Send,
  Share2,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Edit2,
  Trash2,
  Flag,
  ArrowUpDown,
} from "lucide-react";
import Loader from "../../components/loader/Loading";
import Carousel from "../cms/Carousel";
import api from "../../utils/axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const BlogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [isHeart, setIsHeart] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [onComment, onCommentChange] = useState("");
  const [isSubmitComment, setIsSubmitComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' or 'oldest'
  const [currentUserId, setCurrentUserId] = useState(null); // Set this from your auth context

  const fetchBlog = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`api/employee-blog/${id}`);
      setBlog(response.data);
    } catch (err) {
      console.error("Error fetching blog", err);
      toast.error("Failed to load blog post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeartClick = async () => {
    const newState = !isHeart;
    setIsHeart(newState);
    setBlog((prev) => ({
      ...prev,
      likeCount: prev.likeCount + (newState ? 1 : -1),
    }));

    try {
      await api.post(`/api/${blog.eblogId}/like`);
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error("Failed to like post");
      setIsHeart(!newState);
      setBlog((prev) => ({
        ...prev,
        likeCount: prev.likeCount + (newState ? -1 : 1),
      }));
    }
  };

  const handleSaveClick = async () => {
    const newState = !isSaved;
    setIsSaved(newState);

    try {
      if (newState) {
        await api.post(`/api/${blog.eblogId}/save`);
        toast.success("Post saved!");
      } else {
        await api.delete(`/api/${blog.eblogId}/save`);
        toast.success("Post unsaved");
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      toast.error("Failed to save post");
      setIsSaved(!newState);
    }
  };

  const handleShareClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleEditBlog = () => {
    navigate(`/blog/edit/${blog.eblogId}`);
  };

  const handleDeleteBlog = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/api/employee-blog/${blog.eblogId}`);
        toast.success("Post deleted successfully");
        navigate(-1);
      } catch (err) {
        console.error("Error deleting blog:", err);
        toast.error("Failed to delete post");
      }
    }
  };

  const handleReportBlog = async () => {
    if (window.confirm("Do you want to report this post?")) {
      try {
        await api.post(`/api/employee-blog/${blog.eblogId}/report`);
        toast.success("Post reported successfully");
        setShowMenu(false);
      } catch (err) {
        console.error("Error reporting blog:", err);
        toast.error("Failed to report post");
      }
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const { data } = await api.get(`/api/${blog.eblogId}/is-liked`);
      setIsHeart(data.liked);
    } catch (err) {
      console.error("Error fetching like status:", err);
    }
  };

  const fetchSaveStatus = async () => {
    try {
      const { data } = await api.get(`/api/${blog.eblogId}/is-saved`);
      setIsSaved(data.saved);
    } catch (err) {
      console.error("Error fetching save status:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const comments = await api.get(`/api/show-comments/${blog.eblogId}`);
      setComments(comments.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!onComment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      setIsSubmitComment(true);

      const payload = {
        eblogId: blog.eblogId,
        comment: onComment,
      };

      await api.post("/api/add-comment", payload);
      toast.success("Comment added!");
      onCommentChange("");

      // Update comment count
      setBlog((prev) => ({
        ...prev,
        commentCount: prev.commentCount + 1,
      }));

      fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await api.post(`/api/comment/${commentId}/like`);
      fetchComments();
    } catch (err) {
      console.error("Error liking comment:", err);
      toast.error("Failed to like comment");
    }
  };

  const handleReplyComment = async (commentId, replyText) => {
    try {
      await api.post(`/api/comment/${commentId}/reply`, {
        comment: replyText,
      });
      toast.success("Reply added!");
      fetchComments();
    } catch (err) {
      console.error("Error replying to comment:", err);
      toast.error("Failed to add reply");
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await api.put(`/api/comment/${commentId}`, {
        comment: newContent,
      });
      toast.success("Comment updated!");
      fetchComments();
    } catch (err) {
      console.error("Error editing comment:", err);
      toast.error("Failed to edit comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await api.delete(`/api/comment/${commentId}`);
        toast.success("Comment deleted");

        // Update comment count
        setBlog((prev) => ({
          ...prev,
          commentCount: Math.max(0, prev.commentCount - 1),
        }));

        fetchComments();
      } catch (err) {
        console.error("Error deleting comment:", err);
        toast.error("Failed to delete comment");
      }
    }
  };

  const handleReportComment = async (commentId) => {
    try {
      await api.post(`/api/comment/${commentId}/report`);
      toast.success("Comment reported");
    } catch (err) {
      console.error("Error reporting comment:", err);
      toast.error("Failed to report comment");
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
    setComments([...comments].reverse());
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  useEffect(() => {
    if (blog?.eblogId) {
      fetchLikeStatus();
      fetchSaveStatus();
      fetchComments();
    }
  }, [blog?.eblogId]);

  if (isLoading || !blog) return <Loader />;

  const isOwner = currentUserId === blog.userId;

  return (
    <section className="max-w-4xl mx-auto p-4 xl:p-6 mb-20">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
          onClick={() => navigate(location.state?.previousPage || "/")}
        >
          <ArrowLeftIcon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-primary">Back</span>
        </button>

        {/* More Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <MoreHorizontal className="w-6 h-6 text-gray-600" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px] z-50">
                {isOwner ? (
                  <>
                    <button
                      onClick={handleEditBlog}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Post
                    </button>
                    <button
                      onClick={handleDeleteBlog}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleReportBlog}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Flag className="w-4 h-4" />
                    Report Post
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Blog Post Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Author Info */}
        <div className="p-4 flex items-center gap-3">
          <img
            src={
              blog.userPic ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt={blog.firstName}
            className="w-12 h-12 object-cover rounded-full ring-2 ring-gray-100"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {blog.firstName} {blog.lastName}
            </p>
            <span className="text-xs text-gray-500">{blog.date}</span>
          </div>
        </div>

        {/* Images Carousel */}
        {blog.images && blog.images.length > 0 && (
          <div className="w-full">
            <Carousel images={blog.images} isButtonOutside={false} />
          </div>
        )}

        {/* Blog Content */}
        <div className="p-6">
          <h1
            className="text-2xl font-bold text-gray-900 mb-4"
            dangerouslySetInnerHTML={{ __html: blog.title }}
          />
          <div
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: blog.description }}
          />
        </div>

        {/* Like and Comment Count */}
        <div className="px-6 py-3 border-t border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <button className="hover:underline">
              {blog.likeCount} {blog.likeCount === 1 ? "like" : "likes"}
            </button>
            <button className="hover:underline">
              {blog.commentCount}{" "}
              {blog.commentCount === 1 ? "comment" : "comments"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-2 flex items-center justify-around border-b border-gray-200">
          <button
            onClick={handleHeartClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all ${
              isHeart ? "text-red-600" : "text-gray-600"
            }`}
          >
            {isHeart ? (
              <HeartIcon className="w-6 h-6" />
            ) : (
              <Heart className="w-6 h-6" />
            )}
            <span className="text-sm font-semibold">Like</span>
          </button>

          <button
            onClick={() => document.getElementById("comment-input")?.focus()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-gray-600"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-semibold">Comment</span>
          </button>

          <button
            onClick={handleShareClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-gray-600"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-sm font-semibold">Share</span>
          </button>

          {/* <button
            onClick={handleSaveClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all ${
              isSaved ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-6 h-6" />
            ) : (
              <Bookmark className="w-6 h-6" />
            )}
            <span className="text-sm font-semibold">Save</span>
          </button> */}
        </div>

        {/* Comment Input */}
        <div className="p-4 flex items-start gap-3 bg-gray-50">
          <img
            src={
              blog.userPic ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="Your avatar"
            className="w-10 h-10 object-cover rounded-full ring-2 ring-gray-100"
          />
          <div className="flex-1 flex gap-2">
            <textarea
              id="comment-input"
              value={onComment}
              disabled={isSubmitComment}
              className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Write a comment..."
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCommentSubmit();
                }
              }}
              rows={1}
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            <button
              onClick={handleCommentSubmit}
              disabled={isSubmitComment || !onComment.trim()}
              className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitComment ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h2>
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-primary"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "newest" ? "Newest first" : "Oldest first"}
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <BlogComment
                  {...comment}
                  currentUserId={currentUserId}
                  onLike={handleLikeComment}
                  onReply={handleReplyComment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onReport={handleReportComment}
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogView;
