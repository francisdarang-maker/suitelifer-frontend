import { useLocation, useNavigate, useParams } from "react-router-dom";
import BlogComment from "./BlogComment";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
} from "@heroicons/react/20/solid";
import { Heart } from "lucide-react"; // 💡 add this
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

  const [onComment, onCommentChange] = useState("")
  const [isSubmitComment, setIsSubmitComment] = useState(false)

 
  const fetchBlog = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`api/employee-blog/${id}`);
      setBlog(response.data[0]);
    } catch (err) {
      console.error("Error fetching blog", err);
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
      setIsHeart(!newState);
      setBlog((prev) => ({
        ...prev,
        likeCount: prev.likeCount + (newState ? -1 : 1),
      }));
    }
  };

  const fetchLikeStatus = async (eblogId) => {
    try {
      const { data } = await api.get(`/api/${eblogId}/is-liked`);
      setIsHeart(data.liked);
    } catch (err) {
      console.error("Error fetching like status:", err);
    }
  };

  const fetchComments = async() => {
      
    const comments = await api.get(`/api/show-comments/${blog.eblogId}`)
    console.log(comments)

  }

  const handleCommentSubmit = async () => {
  if (!onComment.trim()) return;

  setIsSubmitComment(true);

  console.log("Submitting comment:", onComment);

  // simulate 1.5s delay like an API call

  // after delay, mock that comment is submitted
  toast("Comment submitted successfully!");

  setIsSubmitComment(false);
  onCommentChange(""); // clear textarea after submit
};


  useEffect(() => {
    fetchBlog();
    
  }, [id]);

  useEffect(() => {
    if (blog?.eblogId) {
      fetchLikeStatus(blog.eblogId);
      fetchComments();
    }
  }, [blog?.eblogId]);

  if (isLoading || !blog) return <Loader />;

  return (
    <section className="p-2 xl:p-3 flex flex-col gap-8 mt-4">

      <button
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate(location.state?.previousPage || "/")}
      >
        <ArrowLeftIcon className="w-6 h-6 text-primary" />
        <span className="font-avenir-black text-primary text-base">Back</span>
      </button>


      <section className="flex gap-4">
        <div className="w-12 h-12">
          <img
            src={blog.userPic}
            alt={blog.firstName}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div>
          <p className="font-avenir-black">
            {blog.firstName} {blog.lastName}
          </p>
          <span className="text-xs text-gray-500">{blog.date}</span>
        </div>
      </section>


      <section>
        <main className="max-w-full mx-auto">
          <Carousel images={blog.images || []} isButtonOutside={false} />
        </main>
      </section>

      <section>
        <h3
          className="text-center font-avenir-black"
          dangerouslySetInnerHTML={{ __html: blog.title }}
        ></h3>
        <p dangerouslySetInnerHTML={{ __html: blog.description }}></p>
      </section>

      <section className="flex gap-3">
        <button className="flex gap-3 cursor-pointer" onClick={handleHeartClick}>
          {isHeart ? (
            <HeartIcon className="w-5 h-5 text-red-400" />
          ) : (
            <Heart className="w-5 h-5 text-gray-400" />
          )}
          <span className="text-gray-500">{blog.likeCount}</span>
        </button>

        <button className="flex gap-3 cursor-pointer">
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-gray-400" />
          <span className="text-gray-500">{blog.commentCount}</span>
        </button>
      </section>

      <section className="flex items-center gap-3">
        <div className="w-12 h-12">
          <img
            src={blog.userPic}
            alt={blog.firstName}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
         <textarea
        //  (isSubmitComment && disabled)
          name="comment"
          id="comment"
          cols="30"
          rows="1"
          value={onComment}
          disabled={isSubmitComment}
          className="border flex-1 px-2 py-2 rounded bg-blue-50 border-none min-h-[50px] focus:outline-primary"
          placeholder="Write your comment here..."
          onChange={(e) => onCommentChange(e.target.value)}
        ></textarea>

        {/* {isSubmitComment ? } */}
        <PaperAirplaneIcon className="text-primary w-6 h-6" onClick={handleCommentSubmit}/>
      </section>

      <section className="flex justify-between items-center">
        <h4 className="">Comments</h4>
        <div className="flex items-center gap-1">
          <span className="text-primary font-avenir-black text-sm">
            Newest first
          </span>
          <ArrowUpIcon className="w-4 h-4 text-primary" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        {comments.map((comment, index) => (
          <div key={comment.id}>
            <BlogComment {...comment} />
            {index !== comments.length - 1 && (
              <hr className="text-gray-200 mt-4" />
            )}
          </div>
        ))}
      </section>
    </section>
  );
};

export default BlogView;
