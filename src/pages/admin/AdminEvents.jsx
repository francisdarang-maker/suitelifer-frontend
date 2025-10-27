import React, { useState, useEffect, useRef } from "react";
import { Modal, TextField, Typography, Box } from "@mui/material";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import EventCalendar from "../../components/admin/EventCalendar";
import ContentButtons from "../../components/admin/ContentButtons";
import api from "../../utils/axios";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import moment from "moment-timezone";

// Constants
const CATEGORY_COLORS = {
  party: "#ec4899",
  launchpod: "#3b82f6",
  holiday: "#22c55e",
  payroll: "#f97316",
  others: "#0097b2",
};

const DEFAULT_EVENT = {
  eventId: null,
  title: "",
  category: "others",
  start: new Date(),
  end: new Date(new Date().getTime() + 60 * 60 * 1000),
  description: "",
  gdriveLink: "",
};

const GDRIVE_REGEX =
  /^(https:\/\/drive\.google\.com\/(file\/d\/|drive\/folders\/)[a-zA-Z0-9_-]+\/?.*)$/;

const AdminEvents = () => {
  const user = useStore((state) => state.user);

  // State
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [eventDetails, setEventDetails] = useState(DEFAULT_EVENT);
  const [gdriveError, setGdriveError] = useState("");
  const [dataUpdated, setDataUpdated] = useState(false);

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, [dataUpdated]);

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
      toast.error("Failed to load events");
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setEventDetails(DEFAULT_EVENT);
    setIsEditing(false);
    setGdriveError("");
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEventDetails(DEFAULT_EVENT);
    setGdriveError("");
  };

  const openDeleteDialog = () => {
    setIsDetailsModalOpen(false);
    setTimeout(() => setIsDeleteDialogOpen(true), 200);
  };

  // Event handlers
  const handleEventChange = (e, isDate) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({
      ...prev,
      [name]: isDate ? new Date(value) : value,
    }));

    if (name === "gdriveLink") {
      setGdriveError(
        value && !GDRIVE_REGEX.test(value) ? "Invalid Google Drive link" : ""
      );
    }
  };

  const handleSelectSlot = ({ start, category }) => {
    const eventStart = new Date(start);
    const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

    setEventDetails({
      ...DEFAULT_EVENT,
      start: eventStart,
      end: eventEnd,
      category: category || "others",
    });
    setIsEditing(false);
    setIsAddModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleEditEvent = () => {
    setEventDetails({
      eventId: selectedEvent.eventId,
      title: selectedEvent.title,
      category: selectedEvent.category,
      start: selectedEvent.start,
      end: selectedEvent.end,
      description: selectedEvent.description || "",
      gdriveLink: selectedEvent.gdriveLink || selectedEvent.gdrive_link || "",
    });
    setIsEditing(true);
    setIsDetailsModalOpen(false);
    setIsAddModalOpen(true);
  };

  const handleAddEditEvent = async () => {
    if (!eventDetails.title.trim()) {
      toast.error("Event title is required");
      return;
    }

    try {
      const payload = {
        ...eventDetails,
        userId: user.id,
        start: moment(eventDetails.start).utc().format("YYYY-MM-DD HH:mm:ss"),
        end: moment(eventDetails.end).utc().format("YYYY-MM-DD HH:mm:ss"),
        gdrive_link: eventDetails.gdriveLink,
      };
      delete payload.gdriveLink;

      const response = await api[eventDetails.eventId ? "put" : "post"](
        "/api/events/",
        payload
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setDataUpdated(!dataUpdated);
      }
    } catch (error) {
      toast.error(`Failed to ${eventDetails.eventId ? "update" : "add"} event`);
      console.error("Error saving event:", error);
    } finally {
      closeAddModal();
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.eventId) {
      toast.error("No event selected for deletion");
      return;
    }

    try {
      const response = await api.delete("/api/events", {
        data: { eventId: selectedEvent.eventId },
      });

      if (response.data.success) {
        toast.success("Event deleted successfully");
        setDataUpdated((prev) => !prev);
      } else {
        toast.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleteDialogOpen(false);
      setIsDetailsModalOpen(false);
    }
  };

  return (
    <div className="bg-white p-2 ">
      <div className="flex justify-end gap-2 me-8">
        <ContentButtons
          icon={<PlusCircleIcon className="size-5" />}
          text={"Add Event"}
          handleClick={openAddModal}
        />
      </div>

      <div className="flex gap-8 mt-4 min-h-0 flex-grow">
        <div className="bg-white border-gray-200 rounded-md p-4 w-full overflow-y-auto max-h-[calc(100vh-8rem)]">
          <EventCalendar
            events={events}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddEditEventModal
        open={isAddModalOpen}
        onClose={closeAddModal}
        isEditing={isEditing}
        eventDetails={eventDetails}
        gdriveError={gdriveError}
        onEventChange={handleEventChange}
        onSubmit={handleAddEditEvent}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={openDeleteDialog}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        eventTitle={selectedEvent?.title}
        onConfirm={handleDeleteEvent}
      />
    </div>
  );
};

const AddEditEventModal = ({
  open,
  onClose,
  isEditing,
  eventDetails,
  gdriveError,
  onEventChange,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Box sx={modalStyle}>
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-all"
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

          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEditing ? "Edit Event" : "Create New Event"}
            </div>
            <p className="text-gray-500 text-xs">
              {isEditing
                ? "Update your event details"
                : "Fill in the details below"}
            </p>
          </div>
        </div>

        {/* Content - Compact Grid Layout */}
        <div className="px-6 py-5 overflow-y-auto flex-grow ">
          <div className="grid grid-cols-2 gap-4">
            {/* Category - Full Width */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Category
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={eventDetails.category}
                  onChange={(e) => onEventChange(e, false)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all appearance-none cursor-pointer hover:bg-gray-100"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${
                      CATEGORY_COLORS[eventDetails.category]
                    }20, transparent)`,
                  }}
                >
                  {Object.keys(CATEGORY_COLORS).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Event Title - Full Width */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={eventDetails.title}
                onChange={(e) => onEventChange(e, false)}
                placeholder="e.g., Team Building Activity"
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-cyan-600"
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
                Start <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="start"
                value={moment(eventDetails.start).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => onEventChange(e, true)}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                End
              </label>
              <input
                type="datetime-local"
                name="end"
                value={moment(eventDetails.end).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => onEventChange(e, true)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Description - Full Width */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-cyan-600"
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
                Description
              </label>
              <textarea
                name="description"
                value={eventDetails.description}
                onChange={(e) => onEventChange(e, false)}
                placeholder="Add event details..."
                rows={2}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none"
              />
            </div>

            {/* Google Drive Link - Full Width */}
            <div className="col-span-2 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Google Drive Link
                <span className="text-xs font-normal text-gray-400">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="gdriveLink"
                  value={eventDetails.gdriveLink}
                  onChange={(e) => onEventChange(e, false)}
                  placeholder="https://drive.google.com/..."
                  className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    gdriveError
                      ? "border-red-300 focus:ring-red-500/50 focus:border-red-500"
                      : "border-gray-200 focus:ring-cyan-500/50 focus:border-cyan-500"
                  }`}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base">
                  📂
                </div>
              </div>
              {gdriveError && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {gdriveError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-gray-700 font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!!gdriveError}
              className="px-5 py-2.5 text-sm bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isEditing ? "Update Event" : "Create Event"}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

// Event Details Modal Component
const EventDetailsModal = ({ open, onClose, event, onEdit, onDelete }) => {
  if (!event) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Box sx={modalStyle}>
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-all"
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

          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 tracking-tight pr-8">
              {event.title}
            </div>
            <div
              className="inline-block px-3 py-1 rounded-lg text-xs font-semibold text-white"
              style={{
                background: CATEGORY_COLORS[event.category] || "#6B7280",
              }}
            >
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-grow">
          <div className="space-y-5">
            {/* Schedule */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-cyan-600"
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
                Schedule
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 space-y-1.5">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Starts:</span>{" "}
                  {moment(event.start).format("MMM D, YYYY • h:mm A")}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Ends:</span>{" "}
                  {moment(event.end).format("MMM D, YYYY • h:mm A")}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-cyan-600"
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
                Description
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {event.description || (
                    <span className="italic text-gray-400">
                      No description provided
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Attachments
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                {event.gdriveLink || event.gdrive_link ? (
                  <a
                    href={event.gdriveLink || event.gdrive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium border border-blue-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                    >
                      <path fill="#4285F4" d="M12 2L3.5 17h5.5l8.5-15h-5.5z" />
                      <path fill="#34A853" d="M3.5 17L8.5 22H20L15 17H3.5z" />
                      <path fill="#FBBC05" d="M20 22l-8.5-15h5.5L24 17l-4 5z" />
                    </svg>
                    Open in Drive
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No files attached
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0 ">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            {/* <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-gray-700 font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              Close
            </button> */}
            <button
              onClick={onEdit}
              className="px-2 py-1.5 sm:px-5 sm:py-2.5 text-sm bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Edit Event
            </button>
            <button
              onClick={onDelete}
              className="px-2 py-1.5 sm:px-5 sm:py-2.5  text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Delete
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ open, onClose, eventTitle, onConfirm }) => (
  <Modal open={open} onClose={onClose}>
    <Box sx={deleteDialogStyle}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Confirm Deletion
      </Typography>
      <Typography sx={{ color: "#6B7280", mb: 3 }}>
        Are you sure you want to delete{" "}
        <strong>{eventTitle || "this event"}</strong>? This action cannot be
        undone.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <button
          onClick={onClose}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
        >
          Delete
        </button>
      </Box>
    </Box>
  </Modal>
);

// Detail Section Component
const DetailSection = ({ icon, title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
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

// Styles
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  width: { xs: "85%", sm: "90%", md: "500px" },
  maxWidth: "500px",
  height: { xs: "70%", sm: "90%", md: "500px" },
  maxHeight: "80vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const detailsModalStyle = (color) => ({
  ...modalStyle,
  width: { xs: "95%", sm: "90%", md: "480px" },
  maxWidth: "480px",
});

const headerStyle = {
  background: "linear-gradient(135deg, #2e97b2 0%, #25798e 100%)",
  px: { xs: 3, sm: 4 },
  py: 3,
  color: "white",
};

const titleStyle = {
  fontWeight: 700,
  fontSize: { xs: "1.25rem", sm: "1.5rem" },
  textAlign: "center",
};

const subtitleStyle = {
  textAlign: "center",
  opacity: 0.9,
  mt: 0.5,
  fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
  gap: 2,
  justifyContent: "flex-end",
  flexWrap: { xs: "wrap", sm: "nowrap" },
};

const deleteDialogStyle = {
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
  p: 4,
  zIndex: 2000,
};

export default AdminEvents;
