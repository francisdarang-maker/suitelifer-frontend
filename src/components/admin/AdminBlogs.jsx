import { useState, useEffect } from "react";
import { FileText, CircleAlert, NotebookPen } from "lucide-react";
import api from "../../utils/axios";
import BlogContentCard from "../blog/admin/BlogContentCard";
import Loading from "../loader/Loading";
import BlogStatsCards from "../blog/admin/BlogStatsCards";
import BlogSearchBar from "../blog/admin/BlogSearchBar";
import BlogAddForm from "../blog/admin/BlogAddForm";
import BlogDeleteDialog from "../blog/admin/BlogDeleteDialog";
import BlogEditDialog from "../blog/admin/BlogEditDialog";

function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showAddForm, setShowAddForm] = useState(false);

  const [editBlog, setEditBlog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [deleteBlog, setDeleteBlog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const fetchData = await api.get("/api/blogs");
      if (!fetchData) return;
      setBlogs(fetchData.data.data);
      setFilteredBlogs(fetchData.data.data);
    } catch (error) {
      console.error(error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const filtered = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.article.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBlogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, blogs]);

  const handleAddBlog = async ({ title, article, section, image }) => {
    try {
      let imageUrl = null;

      if (image) {
        const imgForm = new FormData();
        imgForm.append("file", image);
        const uploadRes = await api.post("/api/upload-image/blogs", imgForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data?.imageUrl;
      }

      await api.post("/api/blogs", { title, article, section, imageUrl });
      fetchBlogs();
    } catch (err) {
      console.error("Failed to add blog:", err);
    } finally {
      setShowAddForm(false);
    }
  };

  function extractPublicId(imageUrl) {
    if (!imageUrl) return null;
    try {
      const cleanUrl = imageUrl.split("?")[0];
      const parts = cleanUrl.split("/");
      const filename = parts[parts.length - 1];
      const publicId = filename.split(".")[0];
      return `suitelifer/blogs/${publicId}`;
    } catch (err) {
      console.error("Failed to extract publicId:", err);
      return null;
    }
  }

  const handleEditBlog = async (title, article, section, newImage, oldUrl, blogId) => {
    if (!title || !article) return;

    try {
      let imageUrl = oldUrl;

      if (newImage) {
        const imgForm = new FormData();
        imgForm.append("file", newImage);

        const oldPublicId = extractPublicId(oldUrl);
        if (oldPublicId) {
          await api.delete(`/api/blog/${oldPublicId}`);
        }

        const uploadRes = await api.post("/api/upload-image/blogs", imgForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data?.imageUrl;
      }

      const updatedData = { blogId, title, article, section, imageUrl };
      await api.put("/api/blogs", updatedData);

      setIsEditing(false);
      setEditBlog(null);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to edit blog:", error);
    } 
  };

  const handleDeleteBlog = async (blogId, imageUrl) => {
    try {
      setIsDeleting(true);

      if (imageUrl) {
        // Cloudinary Endpoint
        const oldPublicId = extractPublicId(imageUrl);
        await api.delete(`/api/blog/${oldPublicId}`);
      }

      await api.delete(`/api/blogs/${blogId}`);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to delete blog:", error);
    } finally {
      setIsDeleting(false);
      setDeleteBlog(null);
    }
  };

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br bg-primary rounded-lg shadow-lg">
              <NotebookPen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Blog Management
            </h1>
            <CircleAlert className="text-primary h-5 w-5" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 ">
          <BlogStatsCards blogs={blogs} />
        </div>

        {/* Search Bar */}
        <BlogSearchBar
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={() => setShowAddForm(!showAddForm)}
          searchTerm={searchTerm}
          showAddForm={showAddForm}
        />

        {/* Add Form */}
        {showAddForm && (
          <BlogAddForm onSubmit={handleAddBlog} blogs={blogs} />
        )}

        {/* Edit Dialog */}
        {isEditing && editBlog && (
          <BlogEditDialog
            blog={editBlog}
            onEdit={handleEditBlog}
            setIsEditing={setIsEditing}
          />
        )}

        {/* Delete Dialog */}

        {deleteBlog && (
          <BlogDeleteDialog
            onClick={() => setDeleteBlog(null)}
            deleteBlog={deleteBlog}
            isDeleting={isDeleting}
            handleDeleteBlog={handleDeleteBlog}
            blogs={blogs}
            onCancel={() => setDeleteBlog(null)}
          />
        )}

        {/* Loading State */}

        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-red-200">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Failed to load blogs
            </div>
            <p className="text-slate-600 mb-4">
              There was an error loading the blogs. Please try again.
            </p>
            <button
              onClick={fetchBlogs}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Retry
            </button>
          </div>
        ) : paginatedBlogs.length > 0 && !showAddForm ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedBlogs.map((blog) => (
                <BlogContentCard
                  key={blog.blogId}
                  blog={blog}
                  onEdit={() => {
                    setEditBlog(blog);
                    setIsEditing(true);
                  }}
                  onDelete={() => setDeleteBlog(blog)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "bg-white border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : !showAddForm ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No blogs found</p>
          </div>
        )
      : null
      }
      </div>
    </div>
  );
}

export default AdminBlogs;
