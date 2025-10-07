import { useState } from "react";
import { Image, FileText, Layout, Upload, Sparkles } from "lucide-react";

export default function BlogAddForm({ onSubmit, blogs }) {
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [section, setSection] = useState(0);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !article) return;

    setIsSubmitting(true);
    await onSubmit({ title, article, section, image });
    setIsSubmitting(false);

    setTitle("");
    setArticle("");
    setSection(0);
    setImage(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-8 py-3">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Blog</h2>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Title Input */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <FileText className="w-4 h-4" />
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all duration-200 text-slate-900 placeholder-slate-400 font-medium outline-none"
              placeholder="Enter an engaging title..."
            />
          </div>

          {/* Article Textarea */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Layout className="w-4 h-4" />
              Blog Content
            </label>
            <textarea
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              rows={8}
              className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all duration-200 text-slate-900 placeholder-slate-400 outline-none resize-none"
              placeholder="Write your blog content here..."
            />
            <div className="flex justify-between items-center mt-2 px-1">
              <p className="text-xs text-slate-500">
                Express your thoughts clearly and concisely
              </p>
              <p className="text-xs text-slate-400">
                {article.length} characters
              </p>
            </div>
          </div>

          {/* Section Selector */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Layout className="w-4 h-4" />
              Section Assignment
            </label>
            <select
              value={section}
              onChange={(e) => setSection(Number(e.target.value))}
              className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all duration-200 text-slate-900 font-medium outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[center_right_1rem] bg-no-repeat"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((sec) => {
                const assigned = blogs.map((b) => Number(b.section));
                const maxAssigned =
                  assigned.length > 0 ? Math.max(...assigned) : 0;
                const isTaken = assigned.includes(sec);
                const isNext = sec === maxAssigned + 1;
                const disabled = !isNext && !isTaken;

                return (
                  <option key={sec} value={sec} disabled={disabled || isTaken}>
                    Section {sec}
                    {isTaken ? " • Taken" : disabled ? " • Locked" : ""}
                  </option>
                );
              })}
              <option value={0}>Assign Later</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Upload className="w-4 h-4" />
              Featured Image
            </label>
            <label
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`block border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                dragActive
                  ? "border-slate-900 bg-slate-50 scale-[1.02]"
                  : image
                  ? "border-slate-300 bg-white"
                  : "border-slate-200 bg-slate-50/50 hover:border-slate-400 hover:bg-white"
              }`}
            >
              {image ? (
                <div className="relative group/img">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <span className="text-white font-medium">
                      Click to change image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium mb-1">
                    Drop your image here, or browse
                  </p>
                  <p className="text-slate-500 text-sm">
                    {" "}
                    PNG, JPG, GIF, WEBP or HEIC up to 4MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title || !article}
            className="w-full bg-primary hover:from-slate-800 hover:to-slate-700 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>Publish Blog</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
