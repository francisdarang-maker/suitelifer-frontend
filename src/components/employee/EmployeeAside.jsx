import React, { useEffect, useState } from "react";
import Calendar from "../cms/Calendar";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import EventCard from "../events/EventCard";
import api from "../../utils/axios";
import { format, parseISO, isValid } from "date-fns";
import moment from "moment";
import { useLocation } from "react-router-dom";
import { Modal, Box } from "@mui/material";

const EmployeeAside = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventDetailsModalOpen(true);
  };

  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [events, setEvents] = useState([]);
  const eventsForSelectedDate = events.filter(
    (event) =>
      format(new Date(event.start), "yyyy-MM-dd") === selectedCalendarDate
  );

  const [showAllTodayEvents, setShowAllTodayEvents] = useState(false);
  const [showAllUpcomingEvents, setshowAllUpcomingEvents] = useState(false);
  const [showAllSelectedDateEvents, setShowAllSelectedDateEvents] = useState(false);
  const [eventDates, setEventDates] = useState([]);

  const [showTodayEvent, setShowTodayEvent] = useState(
    JSON.parse(localStorage.getItem("showTodayEvent")) ?? true
  );
  const [showUpcomingEvent, setShowUpcomingEvent] = useState(
    JSON.parse(localStorage.getItem("showUpcomingEvent")) ?? false
  );
  const [showSelectedDateEvent, setShowSelectedDateEvent] = useState(
    JSON.parse(localStorage.getItem("showSelectedDateEvent")) ?? true
  );
  const [loading, setLoading] = useState(false);

  const toIso = (dateTime) => dateTime.replace(" ", "T") + "Z";

  const [todayEvents, setTodayEvents] = useState([]);

  const fetchTodayEvents = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await api.get(`/api/events/today?today=${today}`);
      setTodayEvents(response.data.todayEvents);
    } catch (err) {
      console.log("Error fetching today's events:", err);
    }
  };

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const fetchUpcomingEvents = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await api.get("/api/events/upcoming", { today });
      setUpcomingEvents(response.data.upcomingEvents);
    } catch (err) {
      console.log("Error fetching upcoming events:", err);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/api/events");
        setEvents(response.data.events);

        const dates = response.data.events.reduce((acc, current) => {
          const dateRaw = current.start;
          if (typeof dateRaw === "string") {
            const parsedDate = parseISO(dateRaw);
            if (isValid(parsedDate)) {
              const formattedDate = format(parsedDate, "yyyy-MM-dd");
              acc.push(formattedDate);
            } else {
              console.warn("Invalid parsed date:", dateRaw);
            }
          } else {
            console.warn("Missing or non-string date:", dateRaw);
          }
          return acc;
        }, []);

        setEventDates(dates);
      } catch (error) {
        console.log("Error fetching events:", error);
      }
    };

    fetchEvents();
    fetchTodayEvents();
    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    try {
      setLoading(true);
      const showToday =
        JSON.parse(localStorage.getItem("showTodayEvent")) ?? true;
      const showUpcoming =
        JSON.parse(localStorage.getItem("showUpcomingEvent")) ?? false;
      const showSelectedDate =
        JSON.parse(localStorage.getItem("showSelectedDateEvent")) ?? true;
      setShowTodayEvent(showToday);
      setShowUpcomingEvent(showUpcoming);
      setShowSelectedDateEvent(showSelectedDate);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTodayDisclosureBtn = () => {
    const updatedShowToday = !showTodayEvent;
    localStorage.setItem("showTodayEvent", updatedShowToday);
    setShowTodayEvent(updatedShowToday);
  };

  const handleUpcomingDisclosureBtn = () => {
    const updatedShowUpcoming = !showUpcomingEvent;
    localStorage.setItem("showUpcomingEvent", updatedShowUpcoming);
    setShowUpcomingEvent(updatedShowUpcoming);
  };

  const handleSelectedDateDisclosureBtn = () => {
    const updatedShowSelectedDate = !showSelectedDateEvent;
    localStorage.setItem("showSelectedDateEvent", updatedShowSelectedDate);
    setShowSelectedDateEvent(updatedShowSelectedDate);
  };

  const location = useLocation();
  const hideCalendar = location.pathname.includes("company-events");
  const hideCalendarforAdmin = location.pathname.includes("events");

  if (loading) return null;
  if (hideCalendar) return null;
  if (hideCalendarforAdmin) return null;

  return (
    <aside className="w-64 xl:w-72 h-screen bg-white border-l border-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-white shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">
          Events
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {/* Calendar */}
        <Calendar
          eventDates={eventDates}
          setSelectedCalendarDate={setSelectedCalendarDate}
        />

        {/* Events Sections - Always visible */}
        <div className="space-y-3">
          {/* Today's Events */}
          <Disclosure as="div" defaultOpen={showTodayEvent}>
            {({ open }) => (
              <>
                <DisclosureButton
                  className="group flex w-full items-center justify-between px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                  onClick={() => {
                    handleTodayDisclosureBtn();
                    setShowAllTodayEvents(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">
                      Today
                    </span>
                    <span className="px-2 py-0.5 bg-primary text-white rounded-full text-xs font-semibold">
                      {todayEvents.length}
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </DisclosureButton>

                <DisclosurePanel className="mt-2 space-y-1.5 px-1">
                  {(showAllTodayEvents
                    ? todayEvents
                    : todayEvents.slice(0, 2)
                  ).map((event, index) => (
                    <div
                      key={index}
                      className="transform hover:scale-[1.02] transition-transform duration-200"
                    >
                      <EventCard
                        event={event}
                        onClick={() => handleEventClick(event)}
                      />
                    </div>
                  ))}

                  {todayEvents.length > 2 && (
                    <button
                      onClick={() =>
                        setShowAllTodayEvents(!showAllTodayEvents)
                      }
                      className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      {showAllTodayEvents
                        ? "Show less ↑"
                        : `Show ${todayEvents.length - 2} more ↓`}
                    </button>
                  )}

                  {todayEvents.length === 0 && (
                    <div className="text-center py-3 px-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">
                        No events for today
                      </p>
                    </div>
                  )}
                </DisclosurePanel>
              </>
            )}
          </Disclosure>

          {/* Upcoming Events */}
          <Disclosure as="div" defaultOpen={showUpcomingEvent}>
            {({ open }) => (
              <>
                <DisclosureButton
                  className="group flex w-full items-center justify-between px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                  onClick={handleUpcomingDisclosureBtn}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">
                      Upcoming
                    </span>
                    <span className="px-2 py-0.5 bg-gray-600 text-white rounded-full text-xs font-semibold">
                      {upcomingEvents.length}
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </DisclosureButton>

                <DisclosurePanel className="mt-2 space-y-1.5 px-1">
                  {(showAllUpcomingEvents
                    ? upcomingEvents
                    : upcomingEvents.slice(0, 2)
                  ).map((event, index) => (
                    <div
                      key={index}
                      className="transform hover:scale-[1.02] transition-transform duration-200"
                    >
                      <EventCard
                        event={event}
                        onClick={() => handleEventClick(event)}
                      />
                    </div>
                  ))}

                  {upcomingEvents.length > 2 && (
                    <button
                      onClick={() =>
                        setshowAllUpcomingEvents(!showAllUpcomingEvents)
                      }
                      className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      {showAllUpcomingEvents
                        ? "Show less ↑"
                        : `Show ${upcomingEvents.length - 2} more ↓`}
                    </button>
                  )}

                  {upcomingEvents.length === 0 && (
                    <div className="text-center py-3 px-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">
                        No upcoming events
                      </p>
                    </div>
                  )}
                </DisclosurePanel>
              </>
            )}
          </Disclosure>

          {/* Selected Date Events - Only when date is selected */}
          {selectedCalendarDate &&
            selectedCalendarDate !== format(new Date(), "yyyy-MM-dd") && (
              <Disclosure as="div" defaultOpen={showSelectedDateEvent}>
                {({ open }) => (
                  <>
                    <DisclosureButton
                      className="group flex w-full items-center justify-between px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                      onClick={() => {
                        handleSelectedDateDisclosureBtn();
                        setShowAllSelectedDateEvents(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">
                          {format(
                            parseISO(selectedCalendarDate),
                            "MMM d, yyyy"
                          )}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {eventsForSelectedDate.length}
                        </span>
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </DisclosureButton>

                    <DisclosurePanel className="mt-2 space-y-1.5 px-1">
                      {(showAllSelectedDateEvents
                        ? eventsForSelectedDate
                        : eventsForSelectedDate.slice(0, 2)
                      ).map((event, index) => (
                        <div
                          key={index}
                          className="transform hover:scale-[1.02] transition-transform duration-200"
                        >
                          <EventCard
                            event={event}
                            onClick={() => handleEventClick(event)}
                          />
                        </div>
                      ))}

                      {eventsForSelectedDate.length > 2 && (
                        <button
                          onClick={() =>
                            setShowAllSelectedDateEvents(
                              !showAllSelectedDateEvents
                            )
                          }
                          className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          {showAllSelectedDateEvents
                            ? "Show less ↑"
                            : `Show ${
                                eventsForSelectedDate.length - 2
                              } more ↓`}
                        </button>
                      )}

                      {eventsForSelectedDate.length === 0 && (
                        <div className="text-center py-3 px-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">
                            No events for this date
                          </p>
                        </div>
                      )}
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
            )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          open={isEventDetailsModalOpen}
          onClose={() => setIsEventDetailsModalOpen(false)}
          slotProps={{
            backdrop: {
              style: { backgroundColor: "rgba(0, 0, 0, 0.6)" },
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
              borderRadius: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              width: "85%",
              maxWidth: "420px",
              maxHeight: "85vh",
              overflow: "auto",
            }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 rounded-t-2xl">
              <h3 className="text-base font-bold text-gray-800 pr-8 truncate">
                {selectedEvent.title}
              </h3>
            </div>

            {/* Modal Content */}
            <div className="px-5 py-4 space-y-3">
              <div className="space-y-2">
                {/* Start Time */}
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">
                      Start
                    </p>
                    <p className="text-xs text-gray-800 font-medium">
                      {moment(selectedEvent.start).format("MMM D, YYYY h:mm A")}
                    </p>
                  </div>
                </div>

                {/* End Time */}
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">
                      End
                    </p>
                    <p className="text-xs text-gray-800 font-medium">
                      {moment(selectedEvent.end).format("MMM D, YYYY h:mm A")}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">
                        Description
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Drive Link */}
                {selectedEvent.gdriveLink && (
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">
                        Drive Link
                      </p>
                      <a
                        href={selectedEvent.gdriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium underline break-all"
                      >
                        View in Google Drive
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-5 py-3 rounded-b-2xl">
              <button
                onClick={() => setIsEventDetailsModalOpen(false)}
                className="w-full px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </Box>
        </Modal>
      )}
    </aside>
  );
};

export default EmployeeAside;