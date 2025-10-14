import { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import ContentEditor from "../cms/ContentEditor";
import api from "../../utils/axios";
import toast from "react-hot-toast";

const BlogCreate = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);

    if (selectedFiles.length > 0) {
      console.group("📸 Selected Image Files");
      selectedFiles.forEach((file, index) => {
        console.log(`Image #${index + 1}`);
        console.table({
          Name: file.name,
          Type: file.type,
          Size: `${(file.size / 1024).toFixed(2)} KB`,
        });
      });
      console.groupEnd();
    } else {
      console.warn("⚠️ No images selected.");
    }
  };

  const handleTitleChange = (content) => setBlogTitle(content);
  const handleDescriptionChange = (content) => setBlogDescription(content);

  const uploadBlog = async (blogData) => {
    try {

      setIsLoading(true);

      const response = await api.post("/api/add-employee-blog", blogData);
      const eblogId = response.data.eblog_id;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));

       await api.post(`/api/upload-save-image/eBlog/eblog/${eblogId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }).then((res)=> console.log(res)).catch((err)=> console.log(err))

      }

      toast.success("Blog uploaded successfully!");
      navigate("/app/my-blogs");
    } catch (error) {
      console.error("❌ Error uploading blog:", error);
      toast.error("Failed to upload blog.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogDescription.trim()) {

      toast.error("Please write something in the editor.");
      return;

    }

    const blogData = { title: blogTitle, description: blogDescription };
    uploadBlog(blogData);

  };

  return (
    <section className="p-2 xl:p-3">
      <div className="lg:flex items-center justify-between hidden">
        <div className="flex items-center gap-2">
          <h2 className="font-avenir-black text-gray-800">Create New Blog</h2>
          <InformationCircleIcon className="w-4 h-4 text-gray-500" />
        </div>
        <span
          onClick={() => navigate("/app/my-blogs")}
          className="font-avenir-black text-red-400 text-sm cursor-pointer hover:underline"
        >
          Discard Blog
        </span>
      </div>

      <section
        className="p-5 rounded-lg bg-white"
        style={{ boxShadow: "rgba(0, 0, 0, 0.08) 0px 4px 12px" }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-13 h-13">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Author"
              className="w-12 h-12 object-cover rounded-full"
            />
          </div>
          <p className="font-avenir-black text-gray-700">Hernani Domingo</p>
        </div>

        <ContentEditor
          files={files}
          handleFileChange={handleFileChange}
          handleTitleChange={handleTitleChange}
          handleDescriptionChange={handleDescriptionChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          type="eblog"
        />
      </section>
    </section>
  );
};

export default BlogCreate;

