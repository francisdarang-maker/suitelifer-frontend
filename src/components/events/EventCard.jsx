import React from "react";
import { Clock, FileText } from "lucide-react";
import { format } from "date-fns";

const EventCard = ({ event, onClick, isToday }) => {
  const dayAbbreviation = format(new Date(event.start), "EEE");
  const dayOfMonth = format(new Date(event.start), "d");
  const startTime = format(new Date(event.start), "h:mm a");
  const endTime = format(new Date(event.end), "h:mm a");

  return (
    <section
      onClick={onClick}
      className="group relative bg-white border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent overflow-hidden"
    >
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/0 transition-all duration-300 pointer-events-none" />

      <div className="relative z-10 flex gap-4 items-start">
        {/* Date Column - Only show when isToday */}
        {isToday && (
          <div className="flex flex-col items-center justify-center py-1 px-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 flex-shrink-0">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {dayAbbreviation}
            </span>
            <span className="text-2xl font-bold text-primary leading-none mt-1">
              {dayOfMonth}
            </span>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-primary transition-colors duration-200">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && event.description.trim() !== "" && (
            <div className="flex items-start gap-2 mt-2.5">
              <FileText className="size-4 text-primary flex-shrink-0 mt-0.5 opacity-70" />
              <p className="line-clamp-2 text-xs text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Time */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-100">
            <Clock className="size-4 text-primary flex-shrink-0 opacity-70" />
            <span className="text-xs font-semibold text-gray-700">
              {startTime}{" "}
              <span className="text-gray-400 font-normal">→</span> {endTime}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCard;