
import React, { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

import { Plus, X } from "lucide-react";
import ActionButtons from "../../components/buttons/ActionButtons";
import Loading from "../../components/loader/Loading";
import api from "../../utils/axios";
import { Pencil, Trash2 } from "lucide-react"; // add this import

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add form state
  const [newTitle, setNewTitle] = useState("");
  const [newArticle, setNewArticle] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit form state
  const [editBlog, setEditBlog] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArticle, setEditArticle] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const gridRef = useRef();

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const fetchData = await api.get("/api/blogs");
      if (!fetchData) return;
      setBlogs(fetchData.data.data);
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

  // Add blog
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

      const blogData = { title: newTitle, article: newArticle, imageUrl };
      await api.post("/api/blogs", blogData);

      setNewTitle("");
      setNewArticle("");
      setNewImage(null);
      setShowAddForm(false);

      fetchBlogs();
    } catch (error) {
      console.error("Failed to add blog:", error);
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

  // Edit blog
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
      setEditImage(null);

      fetchBlogs();
    } catch (error) {
      console.error("Failed to edit blog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete blog
  const handleDeleteBlog = async (blogId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      console.log('from front', blogId)

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

  // Table columns

// Table columns
const columnDefs = useMemo(
  () => [
    { headerName: "ID", field: "blogId", sortable: true, filter: true, flex: 1 },
    { headerName: "Title", field: "title", sortable: true, filter: true, flex: 2 },
    {
      headerName: "Article",
      field: "article",
      flex: 3,
      cellRenderer: (params) => (
        <span>{params.value?.length > 100 ? params.value.slice(0, 100) + "..." : params.value}</span>
      ),
    },
    {
      headerName: "Image",
      field: "imageUrl",
      flex: 1.5,
      cellRenderer: (params) =>
        params.value ? (
          <img src={params.value} alt="Blog" className="w-16 h-16 object-cover rounded-md" />
        ) : (
          "No Image"
        ),
    },
    {
      headerName: "Created At",
      field: "createdAt",
      sortable: true,
      flex: 1.5,
      cellRenderer: (params) =>
        new Date(params.value).toLocaleString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      cellRenderer: (params) => (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditBlog(params.data);
              setEditTitle(params.data.title);
              setEditArticle(params.data.article);
              setIsEditing(true);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDeleteBlog(params.data.blogId, params.data.imageUrl)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ],
  []
);


  return (
    <div className="space-y-6 relative">
      {/* Toggle Add Form */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? "Close Form" : "Add Blog"}
        </button>
      </div>

      {/* Add Blog Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddBlog}
          className="bg-white shadow rounded-lg p-6 flex flex-col gap-4 transition-all"
        >
          <h2 className="text-lg font-semibold">Create a New Blog</h2>

          <input
            type="text"
            placeholder="Blog Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />

          <textarea
            placeholder="Blog Article"
            value={newArticle}
            onChange={(e) => setNewArticle(e.target.value)}
            rows={5}
            className="border border-gray-300 rounded-md p-2"
          />

          <label
            htmlFor="blogImage"
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500"
          >
            {newImage ? (
              <div className="flex flex-col items-center">
                <img
                  src={URL.createObjectURL(newImage)}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-md mb-2"
                />
                <span className="text-sm text-gray-600">{newImage.name} (click to change)</span>
              </div>
            ) : (
              <span className="text-gray-500">Drag & drop or click to upload image</span>
            )}
            <input
              id="blogImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setNewImage(e.target.files[0])}
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Adding..." : "Add Blog"}
          </button>
        </form>
      )}

      {/* Edit Blog Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold">Edit Blog</h2>
            <form onSubmit={handleEditBlog} className="flex flex-col gap-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
              />
              <textarea
                value={editArticle}
                onChange={(e) => setEditArticle(e.target.value)}
                rows={5}
                className="border border-gray-300 rounded-md p-2"
              />
              <label
                htmlFor="editBlogImage"
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500"
              >
                {editImage ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(editImage)}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-md mb-2"
                    />
                    <span className="text-sm text-gray-600">{editImage.name} (click to change)</span>
                  </div>
                ) : editBlog?.imageUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={editBlog.imageUrl}
                      alt="Current"
                      className="w-24 h-24 object-cover rounded-md mb-2"
                    />
                    <span className="text-sm text-gray-600">Current image (upload to replace)</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Upload image</span>
                )}
                <input
                  id="editBlogImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setEditImage(e.target.files[0])}
                />
              </label>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blogs Table */}
      {isLoading && <Loading />}
      {isError && <div className="text-red-600 text-center py-4">Failed to load blogs.</div>}
      {!isLoading && !isError && !showAddForm && (
        <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={blogs}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
          />
        </div>
      )}
    </div>
  );
}

export default AdminBlogs;

