import React, { useState, useEffect } from "react";
import {
  Modal,
  TextField,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
// import moment from "moment";
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

  // const [isComingSoon, setComingSoon] = useState(false); // Set to true if still in development
  const [openDialog, setOpenDialog] = useState(false);

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
    gdrive_link: "",
  };

  const categoryColors = {

  party: "#ec4899",     // red-100
  launchpod: "#3b82f6", // blue-100
  holiday: "#22c55e",   // green-100
  payroll: "#f97316",   // yellow-100
  meeting: "#EDE9FE",   // purple-100
  others: "#0097b2",    // gray-100
};


  const handleEventChange = (e, isDate) => {
  const { name, value } = e.target;

  setEventDetails((ne) => ({
    ...ne,
    [name]: isDate ? new Date(value) : value,
  }));

  if (name === "gdrive_link") {
    if (value && !validateGdriveLink(value)) {
      setGdriveError("Invalid Google Drive link");
    } else {
      setGdriveError("");
    }
  }
};
  const [eventDetails, setEventDetails] = useState(defaultEventDetails);
  const [dataUpdated, setDataUpdated] = useState(false);

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(start);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      setOpenDialog(true);
      return;
    }

    const eventStart = new Date(start);
    const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

    setEventDetails({
      title: "",
      start: eventStart,
      end: eventEnd,
      description: "",
    });
    setIsAddModalOpen(true);
  };

 const handleAddEditEvent = async () => {
  
  try {
    const eventPayload = {
      ...eventDetails,
      userId: user.id,
      start: moment(eventDetails.start).utc().format("YYYY-MM-DD HH:mm:ss"),
      end: moment(eventDetails.end).utc().format("YYYY-MM-DD HH:mm:ss"),
    };

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
  }
};


  const handleEventClick = (event) => {
    setEventDetails(event);
    setSelectedEvent(event);
    setIsEventDetailsModalOpen(true);
  };

  const handleEditEvent = () => {
    setEventDetails(selectedEvent);
    setIsEditing(true);
    setIsEventDetailsModalOpen(false);
    setIsAddModalOpen(true);
  };

  const validateGdriveLink = (link) => {
  const regex = /^(https:\/\/drive\.google\.com\/(file\/d\/|drive\/folders\/)[a-zA-Z0-9_-]+\/?.*)$/;
  return regex.test(link);
};

  // if (isComingSoon) return <ComingSoon />;

  return (
    <div className="bg-white p-2">
      <div className="flex justify-end gap-2">
        <ContentButtons
          icon={<PlusCircleIcon className="size-5" />}
          text="Add Event"
          handleClick={() => {
            setEventDetails({
              title: "",
              start: new Date(),
              end: new Date(new Date().getTime() + 60 * 60 * 1000),
              description: "",
              gdriveLink: "",
            });

            setIsEditing(false);
            setIsAddModalOpen(true);
            console.log(eventDetails);
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

      {/* Invalid Date Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Invalid Date Selection</DialogTitle>
        <DialogContent>
          You can only add events from today onward.
        </DialogContent>
        <DialogActions>
          <button onClick={() => setOpenDialog(false)} className="btn-primary">
            OK
          </button>
        </DialogActions>
      </Dialog>

     <Modal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0,0,0,0.1)", 
            backdropFilter: "blur(2px)", 
          },
        },
        bgcolor: categoryColors[selectedEvent?.category] || "white", 
      }}
      >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 24,
              width: "480px",
              p: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              align="center"
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              {isEditing ? "Edit Event ✏️" : "Add New Event 🎉"}
            </Typography>

             <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={eventDetails.category}
              onChange={(e) => handleEventChange(e, false)}
              slotProps={{
                select:{
                native:true
              }
              }}
              defaultValue={"party"}
            
            >
              <option value="party">Party</option>
              <option value="launchpod">Launchpod</option>
              <option value="holiday">Holiday</option>
              <option value="payroll">Payroll</option>
              <option value="meeting">Meeting</option>
              <option value="others">Others</option>
            </TextField>

            {/* Form Fields */}
            <TextField
              fullWidth
              label="Event Title"
              required
              name="title"
              value={eventDetails.title}
              onChange={(e) => handleEventChange(e, false)}
            />
            <TextField
              fullWidth
              required
              label="Start Date"
              type="datetime-local"
              value={moment(eventDetails.start).format("YYYY-MM-DDTHH:mm")}
              name="start"
              onChange={(e) => handleEventChange(e, true)}
            />
            <TextField
              fullWidth
              label="End Date"
              type="datetime-local"
              value={moment(eventDetails.end).format("YYYY-MM-DDTHH:mm")}
              name="end"
              onChange={(e) => handleEventChange(e, true)}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={eventDetails.description}
              name="description"
              onChange={(e) => handleEventChange(e, false)}
            />
            <TextField
              fullWidth
              label="Google Drive Link"
              placeholder="Paste your Drive link here"
              value={eventDetails.gdriveLink}
              name="gdrive_link"
              onChange={(e) => handleEventChange(e, false)}
              error={!!gdriveError}
              helperText={gdriveError}
              InputProps={{
                startAdornment: (
                  <span role="img" aria-label="drive" style={{ marginRight: 8 }}>
                    📂
                  </span>
                ),
              }}
            />

            {/* Actions */}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEventDetails(defaultEventDetails);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEditEvent}
                className="px-4 py-2 bg-primary opacity-80 text-white rounded-lg hover:opacity-100 transition shadow"
              >
                {isEditing ? "Update Event" : "Add Event"}
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
        backgroundColor: "rgba(0,0,0,0.1)",
        backdropFilter: "blur(2px)",
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
      borderRadius: 3,
      boxShadow: 24,
      width: "420px",
      maxWidth: "95%",
      p: 0,
      overflow: "hidden",
      borderLeft: `6px solid ${categoryColors[selectedEvent?.category] || "#6B7280"}`, // 👈 Accent strip
    }}
  >
    {selectedEvent && (
      <>
        {/* Header */}
        <Box className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col">
            <Typography variant="h6" className="font-bold text-gray-800">
              {selectedEvent.title}
            </Typography>
            {/* Category Badge */}
            <span
              className="text-xs px-2 py-0.5 rounded-full w-fit mt-1"
              style={{
                backgroundColor: categoryColors[selectedEvent?.category],
                color: categoryColors[selectedEvent?.category],
                fontWeight: 600,
              }}
            >
              {selectedEvent.category}
            </span>
          </div>

          <button
            onClick={() => setIsEventDetailsModalOpen(false)}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            ✕
          </button>
        </Box>

        {/* Body */}
        <Box className="flex flex-col gap-4 px-5 py-4">
          <Typography className="text-sm text-gray-700">
            <strong>Start:</strong>{" "}
            {moment(selectedEvent.start).format("MMMM D, YYYY h:mm A")}
          </Typography>
          <Typography className="text-sm text-gray-700">
            <strong>End:</strong>{" "}
            {moment(selectedEvent.end).format("MMMM D, YYYY h:mm A")}
          </Typography>
          <Typography className="text-sm text-gray-700 leading-relaxed">
            <strong>Description:</strong>{" "}
            {selectedEvent.description || (
              <span className="italic text-gray-400">No description</span>
            )}
          </Typography>

          {/* Google Drive Link */}
          <Box className="flex items-center gap-2">
            <Typography component="span" className="font-semibold">
              Drive:
            </Typography>
            {selectedEvent.gdriveLink ? (
              <a
                href={selectedEvent.gdriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
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
                View
              </a>
            ) : (
              <Typography component="span" className="text-sm text-gray-400">
                No link provided
              </Typography>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setIsEventDetailsModalOpen(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
          <button
            onClick={handleEditEvent}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 shadow transition"
          >
            Edit
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
