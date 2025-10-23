import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, FolderOpen, Clock } from "lucide-react";
import moment from "moment";

const CATEGORY_COLORS = {
  party: "#ec4899",
  launchpod: "#3b82f6",
  holiday: "#22c55e",
  payroll: "#f97316",
  others: "#0097b2",
};

const EventSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const events = location.state?.events || [];

  const getCategoryColor = (category) =>
    CATEGORY_COLORS[category?.toLowerCase()] || CATEGORY_COLORS.others;

  console.log(events)

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          This Week’s Events
        </h2>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <p className="text-gray-500 text-sm">No events scheduled this week.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => {
            const color = getCategoryColor(event.category);
            return (
              <div
                key={event.eventId}
                className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all"
              >
                {/* Top Accent Bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: color }}
                />

                {/* Card Body */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: color }}
                    >
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 leading-tight">
                        {event.title}
                      </h3>
                      <p
                        className="text-xs font-medium mt-0.5"
                        style={{ color }}
                      >
                        {event.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>
                      {moment(event.start).format("MMM D, YYYY • h:mm A")} –{" "}
                      {moment(event.end).format("h:mm A")}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {event.description || "No description provided."}
                  </p>

                  {event.gdriveLink && (
                    <a
                      href={event.gdriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium"
                      style={{ color }}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>View Files</span>
                    </a>
                  )}
                </div>

                {/* Subtle hover overlay */}
                <div
                  className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all"
                  style={{ pointerEvents: "none" }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventSummary;
