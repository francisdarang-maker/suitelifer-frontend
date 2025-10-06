import { Image } from "lucide-react";
import { useEffect, useState } from "react";

export default function BlogEditDialog({ blog, onEdit, setIsEditing }) {
  const [editTitle, setEditTitle] = useState("");
  const [editArticle, setEditArticle] = useState("");
  const [editSection, setEditSection] = useState(0);
  const [editImage, setEditImage] = useState(null);
  const [oldUrl, setOldUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (blog) {
      setEditTitle(blog.title);
      setEditArticle(blog.article);
      setEditSection(blog.section);
      setOldUrl(blog.imageUrl);
      setEditImage(null);
    }
  }, [blog]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onEdit(editTitle, editArticle, editSection, editImage, oldUrl, blog.blogId);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Blog</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              {[1, 2, 3, 4, 5, 6, 7].map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
              <option value={0}>Assign Later</option>
            </select>
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
                  <span className="text-sm text-slate-600">{editImage.name}</span>
                </div>
              ) : oldUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={oldUrl}
                    alt="Current"
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                  <span className="text-sm text-slate-600">Click to change</span>
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
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
