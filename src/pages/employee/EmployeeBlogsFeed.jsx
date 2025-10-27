import BlogCard from "../../components/blog/BlogCard";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { TicketIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import api from "../../utils/axios";
import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { RefreshCcw, ImagePlus, X, Smile, Users } from "lucide-react";
import Loader from "../../components/loader/Loading";
import moment from "moment";
import CreatePostCard from "../../components/suitebite/admin/CreatePostCard";

const EmployeeBlogsFeed = () => {
  const { id } = useParams();
  const [eBlogs, setEmployeeblogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const observer = useRef()
  
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
           {isLoading && (
              <div className="flex justify-center mt-4">
              <Loader />
              </div>
            )}
           {
            weeklyEvents.length > 0 && ( 
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
            )
           }

          {/* Create Post Section - Facebook Style */}
          {
            
            <CreatePostCard fetchEmployeeBlogs={fetchEmployeeBlogs}/>
          }

          {/* Feed */}
          <main>
           
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
