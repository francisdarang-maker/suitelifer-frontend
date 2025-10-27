// src/components/blog/CreatePostCard.jsx
import { useState, useRef, useEffect } from "react";
import { ImagePlus, Smile, X } from "lucide-react";
import DefaultAvatar from "../../../assets/images/defaultAvatar.svg";
import ShowFeelingPicker from "./ShowFeelingPicker";
import toast from "react-hot-toast";
import api from "../../../utils/axios";
import { useStore } from "../../../store/authStore";

const CreatePostCard = ({ fetchEmployeeBlogs }) => {
  const userLoggedIn = useStore((state) => state.user);

  // === Localized States ===
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // === Auto-resize textarea ===
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [description]);

  // === File Handlers ===
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const validFiles = selected.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length !== selected.length) {
      toast.error("Only image files are allowed");
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // === Feelings ===
  const handleFeelingSelect = (feeling) => {
    setSelectedFeeling(feeling);
    setShowFeelingPicker(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const removeFeeling = () => setSelectedFeeling(null);

  // === Submit Post ===
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() && files.length === 0) {
      toast.error("Please write something or add a photo.");
      return;
    }

    setIsPosting(true);
    try {
      let finalTitle = title.trim();
      if (selectedFeeling) {
        finalTitle += ` - (feeling ${selectedFeeling.label.toLowerCase()} ${selectedFeeling.emoji})`;
      }

      const blogData = { title: finalTitle, description: description.trim() };
      const { data } = await api.post("/api/add-employee-blog", blogData);
      const eblogId = data.eblog_id;

      // Upload images
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        await api.post(`/api/upload-save-image/eBlog/eblog/${eblogId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Post published successfully!");
      resetForm();
      fetchEmployeeBlogs();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // === Cancel Post ===
  const handleCancel = () => {
    if (description || title || files.length > 0 || selectedFeeling) {
      if (window.confirm("Discard post?")) resetForm();
    } else {
      setExpanded(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFiles([]);
    setSelectedFeeling(null);
    setExpanded(false);
  };

  // === JSX ===
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
      {!expanded ? (
        // COLLAPSED STATE
        <div className="p-4 ">
          <div className="flex gap-3 items-center">
            <img
              src={userLoggedIn?.profile_pic ?? DefaultAvatar}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
            />
            <button
              onClick={() => {
                setExpanded(true);
                setTimeout(() => textareaRef.current?.focus(), 100);
              }}
              className="flex-1 text-left px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 text-sm transition-all duration-200"
            >
              What's on your mind?
            </button>
          </div>

          <div className="flex items-center justify-around mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                setExpanded(true);
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all group"
            >
              <ImagePlus className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-600">
                Photo/Video
              </span>
            </button>

            <button
              onClick={() => {
                setExpanded(true);
                setTimeout(() => setShowFeelingPicker(true), 100);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all group"
            >
              <Smile className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-600">
                Feeling
              </span>
            </button>
          </div>
        </div>
      ) : (
        // EXPANDED STATE
        <div className="relative">
          <form onSubmit={handlePostSubmit} className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Create post</h3>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1.5 rounded-full hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 px-4 pt-4">
              <img
                src={userLoggedIn?.profile_pic ?? DefaultAvatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
              />
              <p className="text-sm font-semibold text-gray-800">
                {`${userLoggedIn.first_name} ${userLoggedIn.last_name}`}
              </p>
            </div>

            {/* Selected Feeling */}
            {selectedFeeling && (
              <div className="px-4 pt-2">
                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                  <span className="text-sm">
                    {selectedFeeling.emoji} Feeling{" "}
                    {selectedFeeling.label.toLowerCase()}
                  </span>
                  <button
                    type="button"
                    onClick={removeFeeling}
                    className="hover:bg-gray-200 rounded-full p-0.5 transition-all"
                  >
                    <X className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="px-4 pt-3 pb-2 max-h-[400px] overflow-y-auto">
              {/* Title Input - Larger and more prominent */}
              <input
                type="text"
                placeholder="Add a title (required)"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-bold text-gray-900 placeholder-gray-500 border-none outline-none mb-3 focus:ring-0"
              />

              {/* Description Textarea - Smaller than title */}
              <textarea
                ref={textareaRef}
                className="w-full resize-none text-gray-800 placeholder-gray-400 border-none outline-none text-base leading-relaxed"
                placeholder="What's on your mind? (required)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ minHeight: "80px", maxHeight: "300px" }}
              />

              {/* Image Previews */}
              {files.length > 0 && (
                <div className="mt-4 border border-gray-300 rounded-lg p-2 relative">
                  <div
                    className={`grid gap-1 ${
                      files.length === 1
                        ? "grid-cols-1"
                        : files.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2"
                    }`}
                  >
                    {files.slice(0, 4).map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`upload-${idx}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        >
                          <X className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-2 left-2 px-3 py-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <ImagePlus className="w-4 h-4 text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">
                      Add Photos
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Add to Post */}
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Add to your post
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100 transition-all group"
                    title="Photo/Video"
                  >
                    <ImagePlus className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-gray-100 transition-all group"
                    title="Feeling/Activity"
                    onClick={() => setShowFeelingPicker(!showFeelingPicker)}
                  >
                    <Smile className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Post Button */}
            <div className="px-4 pb-4">
              <button
                type="submit"
                disabled={isPosting || !description.trim() || (!title.trim() && files.length === 0)}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  isPosting || !description.trim() || (!title.trim() && files.length === 0)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>

          {showFeelingPicker && (
            <ShowFeelingPicker
              handleFeelingSelect={handleFeelingSelect}
              setShowFeelingPicker={setShowFeelingPicker}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CreatePostCard;