import React from "react";

export default function BlogDeleteDialog({
  deleteBlog,
  handleDeleteBlog,
  isDeleting,
  onCancel,
  isEmployeeBlog = false
}) {
  if (!deleteBlog) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Blog</h2>
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900">
            {deleteBlog.title}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          {/* Confirm Delete */}
          <button
            onClick={() => isEmployeeBlog ? handleDeleteBlog(deleteBlog.eblogId) : handleDeleteBlog(deleteBlog.blogId, deleteBlog.imageUrl)}
            disabled={isDeleting}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-medium disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>

          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
