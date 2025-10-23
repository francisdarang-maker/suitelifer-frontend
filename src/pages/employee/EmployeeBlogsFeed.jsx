import BlogCard from "../../components/blog/BlogCard";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { TicketIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import api from "../../utils/axios";
import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { RefreshCcw, ImagePlus, X, Smile, Users } from "lucide-react";
import Loader from "../../components/loader/Loading";
import toast from "react-hot-toast";
import { useStore } from "../../store/authStore";

import DefaultAvatar from '../../assets/images/defaultAvatar.svg'
import moment from "moment";

const EmployeeBlogsFeed = () => {
  const { id } = useParams();
  const [eBlogs, setEmployeeblogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const observer = useRef()

  const userLoggedIn = useStore((state) => state.user);
  
  // Feelings data
  const feelings = [
    { id: 1, name: "happy", emoji: "😊", label: "Happy" },
    { id: 2, name: "sad", emoji: "😢", label: "Sad" },
    { id: 3, name: "excited", emoji: "🤩", label: "Excited" },
    { id: 4, name: "blessed", emoji: "🙏", label: "Blessed" },
    { id: 5, name: "loved", emoji: "🥰", label: "Loved" },
    { id: 6, name: "grateful", emoji: "😌", label: "Grateful" },
    { id: 7, name: "motivated", emoji: "💪", label: "Motivated" },
    { id: 8, name: "tired", emoji: "😴", label: "Tired" },
    { id: 9, name: "angry", emoji: "😠", label: "Angry" },
    { id: 10, name: "confused", emoji: "😕", label: "Confused" },
    { id: 11, name: "proud", emoji: "😎", label: "Proud" },
    { id: 12, name: "celebrating", emoji: "🎉", label: "Celebrating" },
  ];

  // === Fetch Blogs ===
  const fetchEmployeeBlogs = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/api/all-employee-blog?page=${pageNum}&limit=10`);
      const sorted = data.blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (pageNum === 1) {
        setEmployeeblogs(sorted);
      } else {
        setEmployeeblogs((prev) => [...prev, ...sorted]);
      }

      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setIsLoading(false);
    }
};

const lastBlogRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

    useEffect(() => {
      if (page === 1) return;
      fetchEmployeeBlogs(page);
    }, [page]);

    useEffect(() => {
      fetchEmployeeBlogs(1);
    }, []);


  // === Auto-resize textarea ===
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [description]);

  // === File Handler ===
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const validFiles = selected.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== selected.length) {
      toast.error("Only image files are allowed");
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  // === Remove File ===
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // === Handle Feeling Selection ===
  const handleFeelingSelect = (feeling) => {
    setSelectedFeeling(feeling);
    setShowFeelingPicker(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // === Remove Feeling ===
  const removeFeeling = () => {
    setSelectedFeeling(null);
  };

  // === Submit Post ===
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() && files.length === 0) {
      toast.error("Please write something or add a photo.");
      return;
    }

    setIsPosting(true);
    try {
      // Build title with feeling
      let finalTitle = title.trim() || "";

      if (selectedFeeling) {
        finalTitle = `${finalTitle} - (feeling ${selectedFeeling.label.toLowerCase()} ${
          selectedFeeling.emoji
        })`;
      }

      const blogData = {
        title: finalTitle,
        description: description.trim(),
      };

      // Step 1: Create blog
      const response = await api.post("/api/add-employee-blog", blogData);
      const eblogId = response.data.eblog_id;

      // Step 2: Upload images (if any)
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        await api.post(
          `/api/upload-save-image/eBlog/eblog/${eblogId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      toast.success("Post published successfully!");
      setTitle("");
      setDescription("");
      setFiles([]);
      setSelectedFeeling(null);
      setExpanded(false);
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
    if (
      description.trim() ||
      files.length > 0 ||
      title.trim() ||
      selectedFeeling
    ) {
      if (window.confirm("Discard post?")) {
        setTitle("");
        setDescription("");
        setFiles([]);
        setSelectedFeeling(null);
        setExpanded(false);
      }
    } else {
      setExpanded(false);
    }
  };

  // Fetch & adjust events
  const fetchEvents = async () => {
    try {
      const localTimeZone = moment.tz.guess();
      const response = await api.get("/api/events");
      const adjustedEvents = response.data.events.map((event) => ({
        ...event,
        start: moment(event.start).utc(true).tz(localTimeZone).toDate(),
        end: moment(event.end).utc(true).tz(localTimeZone).toDate(),
      }));
      setEvents(adjustedEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter current week events
  const getWeeklyEvents = () => {
    const startOfWeek = moment().startOf("week");
    const endOfWeek = moment().endOf("week");

    return events.filter((e) => {
      const eventStart = moment(e.start);
      return eventStart.isBetween(startOfWeek, endOfWeek, "day", "[]");
    });
  };

  const weeklyEvents = getWeeklyEvents();

  const handleEventClick = () => {
    navigate("/app/weekly-event", { state: { events: weeklyEvents } });
  };

  return (
    <section className="min-h-screen bg-white mb-2 mt-10 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
      {id ? (
        <Outlet />
      ) : (
        <>
          {/* Info banner */}
           <div
              className="bg-primary rounded-md p-3 flex justify-between mb-5 lg:hidden"
              onClick={handleEventClick}
            >
              <div className="flex gap-2">
                <TicketIcon className="w-5 h-5 text-white" />
                <span className="text-white text-sm">
                  {weeklyEvents.length} {weeklyEvents.length === 1 ? "event" : "events"} this week
                </span>
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-white text-xss">See all</span>
                <ChevronRightIcon className="w-3 h-3 text-white" />
              </div>
            </div>

          {/* Create Post Section - Facebook Style */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
            {!expanded ? (
              // === COLLAPSED STATE - Compact ===
              <div className="p-4 ">
                <div className="flex gap-3 items-center">
                  <img
                    src={userLoggedIn?.profile_pic ?? DefaultAvatar }
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

                {/* Quick Actions */}
                <div className="flex items-center justify-around mt-3 pt-3 border-t border-gray-200 ">
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
              // === EXPANDED STATE - Full Composer ===
              <div className="relative">
                <form onSubmit={handlePostSubmit} className="flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Create post
                    </h3>
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
                      src={userLoggedIn?.profile_pic ?? DefaultAvatar }
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">
                          { `${ userLoggedIn.first_name} ${userLoggedIn.last_name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-200 rounded px-2 py-0.5 w-fit mt-1">
                        <Users className="w-3 h-3 text-gray-600" />
                        <span className="text-xs text-gray-600">Public</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Feeling Badge (removable) */}
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

                  {/* Content Area */}
                  <div className="px-4 pt-3 pb-2 max-h-[400px] overflow-y-auto">
                    {/* Title Input */}
                    <input
                      type="text"
                      placeholder="Add a title"
                      value={title}
                      required
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-base font-medium text-gray-800 placeholder-gray-400 border-none outline-none mb-2"
                    />

                    {/* Description Textarea */}
                    <textarea
                      ref={textareaRef}
                      className="w-full resize-none text-gray-800 placeholder-gray-400 border-none outline-none text-2xl"
                      placeholder="What's on your mind?"
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
                              : files.length === 3
                              ? "grid-cols-2"
                              : "grid-cols-2"
                          }`}
                        >
                          {files.slice(0, 4).map((file, idx) => (
                            <div
                              key={idx}
                              className={`relative group ${
                                files.length === 3 && idx === 0
                                  ? "row-span-2"
                                  : ""
                              }`}
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`upload-${idx}`}
                                className={`w-full object-cover rounded-lg ${
                                  files.length === 1
                                    ? "h-[400px]"
                                    : files.length === 3 && idx === 0
                                    ? "h-full"
                                    : "h-48"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                  className="
                                    absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg 
                                    transition-all 
                                    opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                                    hover:bg-gray-100
                                  "
                              >
                                <X className="w-4 h-4 text-gray-700" />
                              </button>
                              {files.length > 4 && idx === 3 && (
                                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-3xl font-bold">
                                    +{files.length - 4}
                                  </span>
                                </div>
                              )}
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

                  {/* Add to Post Section */}
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
                          onClick={() =>
                            setShowFeelingPicker(!showFeelingPicker)
                          }
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
                      disabled={
                        isPosting || !description.trim() || !title.trim() && files.length === 0
                      }
                      className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        isPosting || !description.trim() || !title.trim() && files.length === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      {isPosting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </form>

                {/* Feeling Picker Modal - Outside form */}
{showFeelingPicker && (
  <>
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/30 z-40"
      onClick={() => setShowFeelingPicker(false)}
    />

    {/* Modal */}
    <div
      className="
        fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        w-[90%] sm:w-[85%] md:w-[60%] lg:w-[40%] xl:w-[30%]
        bg-white rounded-2xl shadow-2xl border border-gray-200
        z-50 overflow-hidden
        p-4
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <h4 className="text-lg font-semibold text-gray-800">
          How are you feeling?
        </h4>
        <button
          type="button"
          onClick={() => setShowFeelingPicker(false)}
          className="p-1 hover:bg-gray-100 rounded-full transition-all"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto max-h-[65vh] pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {feelings.map((feeling) => (
            <button
              key={feeling.id}
              type="button"
              onClick={() => handleFeelingSelect(feeling)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all text-left border border-transparent hover:border-gray-300"
            >
              <span className="text-2xl">{feeling.emoji}</span>
              <span className="text-sm font-medium text-gray-700">
                {feeling.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </>
)}

              </div>
            )}
          </div>

          {/* Feed */}
          <main>
            {isLoading && (
              <div className="flex justify-center mt-4">
              <Loader />
              </div>
            )}
            {eBlogs.length > 0 ? (
                eBlogs.map((blog, index) => {
                  if (index === eBlogs.length - 1) {
                    return (
                      <div ref={lastBlogRef} key={index} className="mb-4">
                        <BlogCard blog={blog} />
                      </div>
                    );
                  } else {
                    return (
                      <div key={index} className="mb-4">
                        <BlogCard blog={blog} />
                      </div>
                    );
                  }
                }
                ))
              : !isLoading && (
                  <div className="flex flex-col items-center justify-center mt-20 text-center">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-sm">
                      <h3 className="text-xl font-avenir-black text-gray-700 mb-2">
                        No Blog Posts Yet
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        It looks a bit quiet here. Check back later for new
                        stories and updates from your team.
                      </p>
                      <button
                        onClick={fetchEmployeeBlogs}
                        className="mt-6 px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 mx-auto"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>
                  </div>
                )}

                {!hasMore && !isLoading && (
                <div className="text-center text-gray-500 py-6">
                  🎉 You’ve reached the end of the feed.
                </div>
              )}
          </main>
        </>
      )}
    </section>
  );
};

export default EmployeeBlogsFeed;
