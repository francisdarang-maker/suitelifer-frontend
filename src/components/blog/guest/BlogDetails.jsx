import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useBlogDetailsStore from "../../../store/stores/blogDetailsStore";
import Loading from "../../../components/loader/Loading";
import formatTimestamp from "../../../utils/formatTimestamp";

export default function BlogDetails() {
  const { slugs } = useParams();
  const navigate = useNavigate();

  const { blogItem, isLoading, fetchBlogItem, resetBlogItem } = useBlogDetailsStore();

  useEffect(() => {
    if (!slugs) return;
    fetchBlogItem(slugs);
    return () => resetBlogItem();
  }, [slugs, fetchBlogItem, resetBlogItem]);

  if (isLoading) return <Loading />;

  if (!blogItem?.title) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Blog not found or missing data.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="text-primary hover:underline mb-6 inline-flex items-center gap-2"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        {blogItem.title}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {formatTimestamp(blogItem.createdAt)?.fullDate}
      </p>

      {/* Featured image */}
      {blogItem.imageUrl && (
        <div className="mb-8">
          <img
            src={blogItem.imageUrl}
            alt={blogItem.title}
            className="w-full h-[400px] object-cover rounded-2xl shadow-md"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-slate max-w-none text-justify text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: blogItem.article }}
      />
    </div>
  );
}
