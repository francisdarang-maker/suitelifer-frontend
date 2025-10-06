import React, { useState, useEffect } from "react";
import { Modal, TextField, Typography, Box } from "@mui/material";
import EventCalendar from "../../components/admin/EventCalendar";
import ContentButtons from "../../components/admin/ContentButtons";
import ComingSoon from "./ComingSoon";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import api from "../../utils/axios";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import moment from "moment-timezone";

const AdminEvents = () => {
  const user = useStore((state) => state.user);

  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [gdriveError, setGdriveError] = useState("");

  const defaultEventDetails = {
    eventId: null,
    title: "",
    category: "others",
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000),
    description: "",
    gdriveLink: "",
  };

  const [eventDetails, setEventDetails] = useState(defaultEventDetails);
  const [dataUpdated, setDataUpdated] = useState(false);

  const categoryColors = {
    party: "#ec4899",
    launchpod: "#3b82f6",
    holiday: "#22c55e",
    payroll: "#f97316",
    meeting: "#EDE9FE",
    others: "#0097b2",
  };

  const handleEventChange = (e, isDate) => {
    const { name, value } = e.target;

    setEventDetails((prevDetails) => ({
      ...prevDetails,
      [name]: isDate ? new Date(value) : value,
    }));

    if (name === "gdriveLink") {
      if (value && !validateGdriveLink(value)) {
        setGdriveError("Invalid Google Drive link");
      } else {
        setGdriveError("");
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const localTimeZone = moment.tz.guess();
      console.log("Device TimeZone:", localTimeZone);

      const response = await api.get("/api/events");
      const rawEvents = response.data.events;

      const adjustedEvents = rawEvents.map((event) => {
        return {
          ...event,
          start: moment(event.start).utc(true).tz(localTimeZone).toDate(),
          end: moment(event.end).utc(true).tz(localTimeZone).toDate(),
        };
      });

      setEvents(adjustedEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [dataUpdated]);

  const handleSelectSlot = ({ start }) => {
    const eventStart = new Date(start);
    const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

    setEventDetails({
      ...defaultEventDetails,
      start: eventStart,
      end: eventEnd,
    });
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  const handleAddEditEvent = async () => {
    if (!eventDetails.title.trim()) {
      toast.error("Event title is required");
      return;
    }

    try {
      const eventPayload = {
        ...eventDetails,
        userId: user.id,
        start: moment(eventDetails.start).utc().format("YYYY-MM-DD HH:mm:ss"),
        end: moment(eventDetails.end).utc().format("YYYY-MM-DD HH:mm:ss"),
        gdrive_link: eventDetails.gdriveLink, // Map camelCase to snake_case for backend
      };

      // Remove the camelCase version to avoid confusion
      delete eventPayload.gdriveLink;

      let response;
      if (!eventDetails.eventId) {
        response = await api.post("/api/events/", eventPayload);
      } else {
        response = await api.put(`/api/events/`, eventPayload);
      }

      if (response.data.success) {
        toast.success(response.data.message);
      }

      setDataUpdated(!dataUpdated);
    } catch (error) {
      toast.error(
        `Encountered a problem while ${
          eventDetails.eventId ? "updating" : "adding"
        } the event.`
      );
      console.error("Error saving event:", error);
    } finally {
      setIsAddModalOpen(false);
      setEventDetails(defaultEventDetails);
      setGdriveError("");
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventDetailsModalOpen(true);
  };

  const handleEditEvent = () => {
    setEventDetails({
      eventId: selectedEvent.eventId,
      title: selectedEvent.title,
      category: selectedEvent.category,
      start: selectedEvent.start,
      end: selectedEvent.end,
      description: selectedEvent.description || "",
      gdriveLink: selectedEvent.gdriveLink || selectedEvent.gdrive_link || "", // Check both camelCase and snake_case
    });
    setIsEditing(true);
    setIsEventDetailsModalOpen(false);
    setIsAddModalOpen(true);
  };

  const validateGdriveLink = (link) => {
    const regex =
      /^(https:\/\/drive\.google\.com\/(file\/d\/|drive\/folders\/)[a-zA-Z0-9_-]+\/?.*)$/;
    return regex.test(link);
  };

  return (
    <div className="bg-white p-2">
      <div className="flex justify-end gap-2">
        <ContentButtons
          icon={<PlusCircleIcon className="size-5" />}
          text="Add Event"
          handleClick={() => {
            setEventDetails(defaultEventDetails);
            setIsEditing(false);
            setGdriveError("");
            setIsAddModalOpen(true);
          }}
        />
      </div>
      <div className="flex gap-8 mt-4 h-full">
        <div className="bg-white border-gray-200 rounded-md p-4 w-full">
          <EventCalendar
            events={events}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleEventClick}
          />
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEventDetails(defaultEventDetails);
          setGdriveError("");
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(4px)",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: { xs: "95%", sm: "90%", md: "500px" },
            maxWidth: "500px",
            maxHeight: { xs: "90vh", sm: "85vh" },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #2e97b2 0%, #1c5b6b 100%)",
              px: { xs: 3, sm: 4 },
              py: 3,
              color: "white",
              position: "relative",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                textAlign: "center",
              }}
            >
              {isEditing ? "Edit Event" : "Create New Event"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                opacity: 0.9,
                mt: 0.5,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {isEditing
                ? "Update your event details"
                : "Fill in the details below"}
            </Typography>
          </Box>

          {/* Form Content - Scrollable */}
          <Box
            sx={{
              px: { xs: 3, sm: 4 },
              py: 3,
              overflowY: "auto",
              flexGrow: 1,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={eventDetails.category}
                onChange={(e) => handleEventChange(e, false)}
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                size="small"
              >
                <option value="party">Party</option>
                <option value="launchpod">Launchpod</option>
                <option value="holiday">Holiday</option>
                <option value="payroll">Payroll</option>
                <option value="meeting">Meeting</option>
                <option value="others">Others</option>
              </TextField>

              <TextField
                fullWidth
                label="Event Title"
                required
                name="title"
                value={eventDetails.title}
                onChange={(e) => handleEventChange(e, false)}
                placeholder="e.g., Team Building Activity"
                size="small"
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  required
                  label="Start Date"
                  type="datetime-local"
                  value={moment(eventDetails.start).format("YYYY-MM-DDTHH:mm")}
                  name="start"
                  onChange={(e) => handleEventChange(e, true)}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="End Date"
                  type="datetime-local"
                  value={moment(eventDetails.end).format("YYYY-MM-DDTHH:mm")}
                  name="end"
                  onChange={(e) => handleEventChange(e, true)}
                  size="small"
                />
              </Box>

              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={eventDetails.description}
                name="description"
                onChange={(e) => handleEventChange(e, false)}
                placeholder="Add event details..."
                size="small"
              />

              <TextField
                fullWidth
                label="Google Drive Link (Optional)"
                placeholder="https://drive.google.com/..."
                value={eventDetails.gdriveLink}
                name="gdriveLink"
                onChange={(e) => handleEventChange(e, false)}
                error={!!gdriveError}
                helperText={gdriveError}
                size="small"
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        mr: 1,
                        fontSize: "1.25rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      📂
                    </Box>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Footer Actions */}
          <Box
            sx={{
              px: { xs: 3, sm: 4 },
              py: 2.5,
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEventDetails(defaultEventDetails);
                setGdriveError("");
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEditEvent}
              disabled={!!gdriveError}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? "Update Event" : "Create Event"}
            </button>
          </Box>
        </Box>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        open={isEventDetailsModalOpen}
        onClose={() => setIsEventDetailsModalOpen(false)}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(4px)",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            borderRadius: 2,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: { xs: "95%", sm: "90%", md: "480px" },
            maxWidth: "480px",
            maxHeight: { xs: "90vh", sm: "85vh" },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedEvent && (
            <>
              {/* Header with Color Accent */}
              <Box
                sx={{
                  background:
                    categoryColors[selectedEvent?.category] || "#6B7280",
                  px: { xs: 3, sm: 4 },
                  py: 3,
                  color: "white",
                  position: "relative",
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
                        backdropFilter: "blur(10px)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
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

              {/* Body - Scrollable */}
              <Box
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: 3,
                  overflowY: "auto",
                  flexGrow: 1,
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Date & Time */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#374151",
                        }}
                      >
                        Schedule
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        pl: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "0.875rem", color: "#6B7280" }}
                      >
                        <span className="font-medium text-gray-700">
                          Starts:
                        </span>{" "}
                        {moment(selectedEvent.start).format(
                          "MMM D, YYYY • h:mm A"
                        )}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.875rem", color: "#6B7280" }}
                      >
                        <span className="font-medium text-gray-700">Ends:</span>{" "}
                        {moment(selectedEvent.end).format(
                          "MMM D, YYYY • h:mm A"
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
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
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#374151",
                        }}
                      >
                        Description
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        pl: 4,
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
                  </Box>

                  {/* Google Drive Link */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
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
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#374151",
                        }}
                      >
                        Attachments
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 4 }}>
                      {selectedEvent.gdriveLink || selectedEvent.gdrive_link ? (
                        <a
                          href={
                            selectedEvent.gdriveLink ||
                            selectedEvent.gdrive_link
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
                            <path
                              fill="#34A853"
                              d="M3.5 17L8.5 22H20L15 17H3.5z"
                            />
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
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: 2.5,
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <button
                  onClick={() => setIsEventDetailsModalOpen(false)}
                  className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleEditEvent}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-md hover:shadow-lg"
                >
                  Edit Event
                </button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default AdminEvents;
