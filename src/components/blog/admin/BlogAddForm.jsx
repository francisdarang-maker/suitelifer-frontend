import { useState } from "react";
import { Image } from "lucide-react";

export default function BlogAddForm({ onSubmit, blogs }) {
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [section, setSection] = useState(0);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !article) return;

    setIsSubmitting(true);
    await onSubmit({ title, article, section, image });
    setIsSubmitting(false);

    // Reset form
    setTitle("");
    setArticle("");
    setSection(0);
    setImage(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Create New Blog
      </h2>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl"
          placeholder="Enter blog title..."
        />
      </div>

      {/* Article */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Article</label>
        <textarea
          value={article}
          onChange={(e) => setArticle(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border rounded-xl"
          placeholder="Write your article..."
        />
      </div>

      {/* Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
        <select
          value={section}
          onChange={(e) => setSection(Number(e.target.value))}
          className="w-full px-4 py-3 border rounded-xl"
        >
          {[1,2,3,4,5,6,7].map((sec) => {
            const assigned = blogs.map((b) => Number(b.section));
            const maxAssigned = assigned.length > 0 ? Math.max(...assigned) : 0;
            const isTaken = assigned.includes(sec);
            const isNext = sec === maxAssigned + 1;
            const disabled = !isNext && !isTaken;

            return (
              <option key={sec} value={sec} disabled={disabled || isTaken}>
                Section {sec}{isTaken ? " - Taken" : disabled ? " - Locked" : ""}
              </option>
            );
          })}
          <option value={0}>Assign Later</option>
        </select>
      </div>

      {/* Image */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Featured Image</label>
        <label className="block border-2 border-dashed p-6 rounded-xl text-center cursor-pointer">
          {image ? (
            <img src={URL.createObjectURL(image)} alt="Preview" className="w-32 h-32 object-cover mx-auto mb-2 rounded-lg" />
          ) : (
            <Image className="w-12 h-12 text-slate-400 mx-auto" />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-3 rounded-xl disabled:opacity-50"
      >
        {isSubmitting ? "Publishing..." : "Publish Blog"}
      </button>
    </div>
  );
}
