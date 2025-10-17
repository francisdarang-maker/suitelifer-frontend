import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/20/solid";

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const Calendar = ({
  eventDates = [],
  setSelectedCalendarDate,
  fullEvents = [],
}) => {
  const events = eventDates.reduce((acc, date) => {
    acc[date] = true;
    return acc;
  }, {});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDayClick = (day) => {
    const clickedDate = format(day, "yyyy-MM-dd");
    setSelectedDate(clickedDate);
    setSelectedCalendarDate(clickedDate);
    const eventsForDay = fullEvents.filter(
      (event) => format(new Date(event.start), "yyyy-MM-dd") === clickedDate
    );
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-base font-semibold text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Next month"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const dateString = format(day, "yyyy-MM-dd");
          const isSelected = dateString === selectedDate;
          const hasEvent = events[dateString];

          return (
            <button
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              className={`
                relative h-10 w-full rounded-lg text-sm font-medium
                transition-all duration-200 ease-in-out
                ${!isCurrentMonth && "text-gray-300"}
                ${
                  isCurrentMonth &&
                  !isSelected &&
                  !isToday &&
                  "text-gray-700 hover:bg-gray-50"
                }
                ${
                  isToday &&
                  !isSelected &&
                  "bg-primary text-white hover:bg-primary"
                }
                ${
                  isSelected &&
                  isToday &&
                  "bg-primary text-white ring-2 ring-primary"
                }
                ${
                  isSelected &&
                  !isToday &&
                  "bg-primary-50 text-primary-600 ring-2 ring-primary"
                }
              `}
            >
              <span className="relative z-10">{format(day, "d")}</span>
              {hasEvent && (
                <div
                  className={`
                    absolute bottom-1.5 left-1/2 transform -translate-x-1/2 
                    w-1 h-1 rounded-full
                    ${isToday || isSelected ? "bg-white" : "bg-primary"}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
