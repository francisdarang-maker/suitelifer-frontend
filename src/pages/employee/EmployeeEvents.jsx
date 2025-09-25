
import { useState } from "react";
import { CalendarDaysIcon, Clock } from "lucide-react";
import ComingSoon from "../admin/ComingSoon";
import React, { useEffect } from "react";
import moment from "moment";
import EventCalendar from "../../components/admin/EventCalendar";
import api from "../../utils/axios";
import { Modal, Box, Typography } from "@mui/material";

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
      const response = await api.get("/api/events");
      const rawEvents = response.data.events;
      const adjustedEvents = rawEvents.map((event) => ({
           ...event,
          start: moment.utc(event.start).local().toDate(),
          end: moment.utc(event.end).local().toDate(),
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
    <div>
      {selectedEvent && (
          <Modal
              open={isEventDetailsModalOpen}
              onClose={() => setIsEventDetailsModalOpen(false)}
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
                  width: 480,
                  p: 4,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="font-bold text-primary">
                    {selectedEvent.title}
                  </Typography>
                  <button
                    onClick={() => setIsEventDetailsModalOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarDaysIcon className="w-5 h-5 text-primary" />
                    <span>
                      {moment(selectedEvent.start).format("MMMM D, YYYY")} –{" "}
                      {moment(selectedEvent.end).format("MMMM D, YYYY")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>
                      {moment(selectedEvent.start).format("h:mm A")} –{" "}
                      {moment(selectedEvent.end).format("h:mm A")}
                    </span>
                  </div>
                </div>

              <Typography
                variant="body1"
                className="text-gray-800 leading-relaxed mb-4"
              >
                {selectedEvent.description || "No description available."}
              </Typography>

              {selectedEvent.gdriveLink && (
                <div className="mb-4">
                  <Typography variant="body2" className="text-gray-600 font-medium">
                    📂 Drive Link:
                  </Typography>
                  <a
                    href={selectedEvent.gdriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {selectedEvent.gdriveLink}
                  </a>
                </div>
              )}
              {/* <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEventDetailsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  Close
                </button>
                <button className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition">
                  Add to Calendar
                </button>
              </div> */}
          </Box>
        </Modal>
      )}

      <div className="bg-white p-4">
        <h2 className="text-xl font-bold mb-4">Events Calendar</h2>
        <div className="border border-gray-200 rounded-md p-4">
          <EventCalendar
            events={events}
            // onSelectEvent={(event) => {
            //   alert(`Event: ${event.title}`);
            // }}
            onSelectEvent={handleEventClick}
            eventPropGetter={() => ({
              className: "custom-event",
            })}
            // eventPropGetter={() => ({
            //   style: {
            //     backgroundColor: "#2563eb",
            //     color: "white",
            //     padding: "4px",
            //     borderRadius: "4px",
            //   },
            // })}
            dayPropGetter={(date) => {
              const today = new Date();
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

              return isToday ? { className: "custom-today" } : {};
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeEvents;
