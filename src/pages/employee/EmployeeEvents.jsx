import { useState, useEffect } from "react";
import { CalendarDaysIcon, Clock } from "lucide-react";
import { Modal, Box, Typography } from "@mui/material";
import EventCalendar from "../../components/admin/EventCalendar";
import api from "../../utils/axios";
import moment from "moment-timezone";

const CATEGORY_COLORS = {
  party: "#ec4899",
  launchpod: "#3b82f6",
  holiday: "#22c55e",
  payroll: "#f97316",
  meeting: "#8b5cf6",
  others: "#0097b2",
};

const EmployeeEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventDetailsModalOpen(true);
  };

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

  return (
    <div className="bg-white p-4">
     

      <div className="rounded-md lg:p-4">
        <EventCalendar
          events={events}
          onSelectEvent={handleEventClick}
          onSelectSlot={() => {}}
          enableDragDrop={false}
          isEmployee={true}
        />
      </div>

      {/* Event Details Modal */}
      <Modal
        open={isEventDetailsModalOpen}
        onClose={() => setIsEventDetailsModalOpen(false)}
      >
        <Box
          sx={detailsModalStyle(
            CATEGORY_COLORS[selectedEvent?.category] || "#6B7280"
          )}
        >
          {selectedEvent && (
            <>
              {/* Header */}
              <Box
                sx={{
                  ...headerStyle,
                  background:
                    CATEGORY_COLORS[selectedEvent.category] ||
                    "linear-gradient(135deg, #2e97b2 0%, #25798e 100%)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.125rem", sm: "1.25rem" },
                        lineHeight: 1.3,
                        mb: 1,
                      }}
                    >
                      {selectedEvent.title}
                    </Typography>
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 2,
                        py: 0.5,
                        borderRadius: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {selectedEvent.category}
                    </Box>
                  </Box>

                  <button
                    onClick={() => setIsEventDetailsModalOpen(false)}
                    className="text-white hover:bg-white/20 transition-colors rounded-full p-1.5 -mt-1"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </Box>
              </Box>

              {/* Content */}
              <Box sx={contentStyle}>
                <DetailSection
                  icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  title="Schedule"
                >
                  <Typography sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
                    <span className="font-medium text-gray-700">Starts:</span>{" "}
                    {moment(selectedEvent.start).format("MMM D, YYYY • h:mm A")}
                  </Typography>
                  <Typography sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
                    <span className="font-medium text-gray-700">Ends:</span>{" "}
                    {moment(selectedEvent.end).format("MMM D, YYYY • h:mm A")}
                  </Typography>
                </DetailSection>

                <DetailSection
                  icon="M4 6h16M4 12h16M4 18h7"
                  title="Description"
                >
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#6B7280",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedEvent.description || (
                      <span style={{ fontStyle: "italic", color: "#9CA3AF" }}>
                        No description provided
                      </span>
                    )}
                  </Typography>
                </DetailSection>

                <DetailSection
                  icon="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  title="Attachments"
                >
                  {selectedEvent.gdriveLink || selectedEvent.gdrive_link ? (
                    <a
                      href={
                        selectedEvent.gdriveLink || selectedEvent.gdrive_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                      >
                        <path
                          fill="#4285F4"
                          d="M12 2L3.5 17h5.5l8.5-15h-5.5z"
                        />
                        <path fill="#34A853" d="M3.5 17L8.5 22H20L15 17H3.5z" />
                        <path
                          fill="#FBBC05"
                          d="M20 22l-8.5-15h5.5L24 17l-4 5z"
                        />
                      </svg>
                      Open in Drive
                    </a>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#9CA3AF",
                        fontStyle: "italic",
                      }}
                    >
                      No files attached
                    </Typography>
                  )}
                </DetailSection>
              </Box>

              {/* Footer */}
              <Box sx={footerStyle}>
                <button
                  onClick={() => setIsEventDetailsModalOpen(false)}
                  className="w-full px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

/* 🔹 Reusable DetailSection Component (from Admin modal) */
const DetailSection = ({ icon, title, children }) => (
  <Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <svg
        className="w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={icon}
        />
      </svg>
      <Typography
        sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}
      >
        {title}
      </Typography>
    </Box>
    <Box sx={{ pl: 4, display: "flex", flexDirection: "column", gap: 0.5 }}>
      {children}
    </Box>
  </Box>
);

/* 🔹 Modal Styles (same as Admin modal) */
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  width: { xs: "95%", sm: "90%", md: "480px" },
  maxWidth: "480px",
  maxHeight: { xs: "90vh", sm: "85vh" },
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const detailsModalStyle = (color) => ({
  ...modalStyle,
  borderTop: "none",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "6px",
    backgroundColor: color,
  },
});

const headerStyle = {
  background: "linear-gradient(135deg, #2e97b2 0%, #25798e 100%)",
  px: { xs: 3, sm: 4 },
  py: 3,
  color: "white",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
  mt: 0,
};

const contentStyle = {
  px: { xs: 3, sm: 4 },
  py: 3,
  overflowY: "auto",
  flexGrow: 1,
};

const footerStyle = {
  px: { xs: 3, sm: 4 },
  py: 2.5,
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "flex-end",
};

export default EmployeeEvents;
