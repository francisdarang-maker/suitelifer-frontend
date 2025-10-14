import { Image, FileText, Layout, Upload, BoldIcon, ItalicIcon, UnderlineIcon, List, ListOrdered } from "lucide-react";
import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

export default function BlogEditDialog({ blog, onEdit, setIsEditing, blogs = [] }) {
  const [editTitle, setEditTitle] = useState("");
  const [editSection, setEditSection] = useState(0);
  const [editImage, setEditImage] = useState(null);
  const [oldUrl, setOldUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: blog?.article || "",
    onUpdate: ({ editor }) => {},
  });

  useEffect(() => {
    if (blog) {
      setEditTitle(blog.title || "");
      setEditSection(blog.section || 0);
      setOldUrl(blog.imageUrl || null);
      setEditImage(null);
      if (editor && blog.article) editor.commands.setContent(blog.article);
    }
  }, [blog, editor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editor) return;
    const htmlContent = editor.getHTML();
    setIsSubmitting(true);
    await onEdit(editTitle, htmlContent, editSection, editImage, oldUrl, blog.blogId);
    setIsSubmitting(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setEditImage(e.dataTransfer.files[0]);
    }
  };

  const renderSectionOptions = () => {
    const assigned = blogs.map((b) => Number(b.section));
    return [1, 2, 3, 4, 5, 6, 7].map((sec) => {
      const isTaken = assigned.includes(sec) && sec !== blog.section;
      const isCurrent = sec === blog.section;
      return (
        <option key={sec} value={sec} disabled={isTaken}>
          Section {sec}
          {isTaken ? " • Taken" : isCurrent ? " • Current" : ""}
        </option>
      );
    });
  };

  const wordCount = editor?.storage?.characterCount?.characters() || 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl border border-slate-200/60 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-primary px-8 py-3">
          <h2 className="text-2xl font-bold text-white">Edit Blog</h2>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Title Input */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <FileText className="w-4 h-4" /> Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all duration-200 text-slate-900 placeholder-slate-400 font-medium outline-none"
              placeholder="Enter an engaging title..."
            />
          </div>

          {/* TipTap Editor */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Layout className="w-4 h-4" /> Blog Content
            </label>

            {/* Toolbar */}
            <div className="flex gap-3 mb-2 mt-3 place-items-center">
              <BoldIcon
                className="size-5 cursor-pointer"
                onClick={() => editor?.chain().focus().toggleBold().run()}
              />
              <ItalicIcon
                className="size-5 cursor-pointer"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              />
              <UnderlineIcon
                className="size-5 cursor-pointer"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              />
              <List
                className="size-5 cursor-pointer"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              />
              <ListOrdered
                className="size-5 cursor-pointer"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              />
            </div>

            <div className="border border-gray-400 focus-within:border-primary outline-none p-2 min-h-50 rounded bg-slate-50 text-slate-800">
              <EditorContent
                editor={editor}
                className="w-full [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold [&_em]:italic"
              />
            </div>
            <p className="text-right text-gray-500 text-sm mt-1">
              {wordCount} characters
            </p>
          </div>

          {/* Section Selector */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Layout className="w-4 h-4" /> Section Assignment
            </label>
            <select
              value={editSection}
              onChange={(e) => setEditSection(Number(e.target.value))}
              className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all duration-200 text-slate-900 font-medium outline-none cursor-pointer appearance-none"
            >
              {renderSectionOptions()}
              <option value={0}>Assign Later</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Upload className="w-4 h-4" /> Featured Image
            </label>
            <label
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`block border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                dragActive
                  ? "border-slate-900 bg-slate-50 scale-[1.02]"
                  : editImage || oldUrl
                  ? "border-slate-300 bg-white"
                  : "border-slate-200 bg-slate-50/50 hover:border-slate-400 hover:bg-white"
              }`}
            >
              {editImage ? (
                <img
                  src={URL.createObjectURL(editImage)}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
              ) : oldUrl ? (
                <img src={oldUrl} alt="Current" className="w-full h-64 object-cover" />
              ) : (
                <div className="p-12 text-center">
                  <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium mb-1">
                    Drop your image here, or browse
                  </p>
                  <p className="text-slate-500 text-sm">
                    PNG, JPG, GIF, WEBP or HEIC up to 4MB
                  </p>
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

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !editTitle || !editor?.getText()}
              className="flex-1 bg-primary text-white py-4 px-6 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all duration-300 font-semibold hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
