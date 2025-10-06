import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Calendar,
  Image,
  FileText,
  Sparkles,
} from "lucide-react";
import api from "../../utils/axios";

function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [newTitle, setNewTitle] = useState("");
  const [newArticle, setNewArticle] = useState("");
  const [newSection, setNewSection] = useState(0);
  const [newImage, setNewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [editBlog, setEditBlog] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArticle, setEditArticle] = useState("");
  const [editSection, setEditSection] = useState(0);
  const [editImage, setEditImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const fetchData = await api.get("/api/blogs");
      if (!fetchData) return;
      setBlogs(fetchData.data.data);
      console.log("Blogs", fetchData.data.data);
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

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!newTitle || !newArticle) return;

    try {
      setIsSubmitting(true);
      let imageUrl = null;
      if (newImage) {
        const imgForm = new FormData();
        imgForm.append("file", newImage);
        const uploadRes = await api.post("/api/upload-image/blogs", imgForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data?.imageUrl;
        console.log(uploadRes.data)
      }

      const blogData = {
        title: newTitle,
        article: newArticle,
        section: newSection,
        imageUrl,
      };
      await api.post("/api/blogs", blogData);

      setNewTitle("");
      setNewArticle("");
      setNewSection(0);
      setNewImage(null);
      setShowAddForm(false);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to add blog:", error);
      alert("Failed to add blog. Please try again.");
    } finally {
      setIsSubmitting(false);
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
      console.error("Failed to extract publicId from Cloudinary URL:", err);
      return null;
    }
  }

  const handleEditBlog = async (e) => {
    e.preventDefault();
    if (!editTitle || !editArticle) return;

    try {
      setIsSubmitting(true);

      let imageUrl = null;
      if (editImage) {
        const imgForm = new FormData();
        imgForm.append("file", editImage);

        console.log(imageUrl)
        const oldPublicId = extractPublicId(editBlog.imageUrl);

        if(oldPublicId !== null){
          await api.delete(`api/blog/${oldPublicId}`);
        }

        const uploadRes = await api.post("/api/upload-image/blogs", imgForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data?.imageUrl;
      }

      const updatedData = {
        blogId: editBlog.blogId,
        title: editTitle,
        article: editArticle,
        section: editSection,
        imageUrl: imageUrl
      };
      await api.put("/api/blogs", updatedData);

      setIsEditing(false);
      setEditBlog(null);
      setEditTitle("");
      setEditArticle("");
      setEditSection(0);
      setEditImage(null);

      fetchBlogs();
    } catch (error) {
      console.error("Failed to edit blog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlog = async (blogId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      console.log("from front", blogId);

      if(imageUrl){
        const oldPublicId = extractPublicId(imageUrl);
        await api.delete(`api/blog/${oldPublicId}`);
      }

      await api.delete(`/api/blogs/${blogId}`);

      fetchBlogs();
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Blog Management
            </h1>
          </div>
          <p className="text-slate-600 ml-14">
            Create, edit, and manage your blog content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Blogs
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {blogs.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  With Images
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {blogs.filter((b) => b.imageUrl).length}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Image className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">This Month</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {
                    blogs.filter(
                      (b) =>
                        new Date(b.createdAt).getMonth() ===
                        new Date().getMonth()
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
            >
              {showAddForm ? <X size={20} /> : <Plus size={20} />}
              {showAddForm ? "Close" : "Add Blog"}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Create New Blog
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter blog title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Article
                </label>
                <textarea
                  placeholder="Write your article..."
                  value={newArticle}
                  onChange={(e) => setNewArticle(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Section (Layout)
                </label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value={0}>Section 1 (Default)</option>
                  <option value={1}>Section 2</option>
                  <option value={2}>Section 3</option>
                  <option value={3}>Section 4</option>
                  <option value={4}>Section 5</option>
                  <option value={5}>Section 6</option>
                  <option value={6}>Section 7</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Select which section this blog belongs to (affects layout display)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Featured Image
                </label>
                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                  {newImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={URL.createObjectURL(newImage)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                      />
                      <span className="text-sm text-slate-600">
                        {newImage.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Image className="w-12 h-12 text-slate-400" />
                      <span className="text-slate-600">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-slate-500">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setNewImage(e.target.files[0])}
                  />
                </label>
              </div>
              <button
                onClick={handleAddBlog}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Publishing..." : "Publish Blog"}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
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
        ) : paginatedBlogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedBlogs.map((blog) => (
                <div
                  key={blog.blogId}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-2xl transition-all hover:-translate-y-1 group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                    {blog.imageUrl ? (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Image className="w-16 h-16 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-slate-700">
                      Section: {(blog.section || 0) + 1}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {blog.article}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => {
                          setEditBlog(blog);
                          setEditTitle(blog.title);
                          setEditArticle(blog.article);
                          setEditSection(blog.section || 0);
                          setIsEditing(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all font-medium"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteBlog(blog.blogId, blog.imageUrl)
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all font-medium"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        ID: {(blog.blogId || 0) + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No blogs found</p>
          </div>
        )}

        {isEditing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Edit Blog
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Article
                  </label>
                  <textarea
                    value={editArticle}
                    onChange={(e) => setEditArticle(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Section (Layout)
                  </label>
                  <select
                    value={editSection}
                    onChange={(e) => setEditSection(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={0}>Section 1 (Default)</option>
                    <option value={1}>Section 2</option>
                    <option value={2}>Section 3</option>
                    <option value={3}>Section 4</option>
                    <option value={4}>Section 5</option>
                    <option value={5}>Section 6</option>
                    <option value={6}>Section 7</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Select which section this blog belongs to (affects layout display)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Featured Image
                  </label>
                  <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                    {editImage ? (
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={URL.createObjectURL(editImage)}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg shadow-md"
                        />
                        <span className="text-sm text-slate-600">
                          {editImage.name}
                        </span>
                      </div>
                    ) : editBlog?.imageUrl ? (
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={editBlog.imageUrl}
                          alt="Current"
                          className="w-32 h-32 object-cover rounded-lg shadow-md"
                        />
                        <span className="text-sm text-slate-600">
                          Click to change
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Image className="w-12 h-12 text-slate-400" />
                        <span className="text-slate-600">Click to upload</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setEditImage(e.target.files[0])}
                    />
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEditBlog}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBlogs;