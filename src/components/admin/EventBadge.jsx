import { Tooltip, Fade } from "@mui/material";
import EventImageCarousel from "../events/EventImageCarousel";

function EventBadge({
    event, 
    compact = false, 
    eventImages, 
    loadingImages, 
    onSelectEvent, 
    handleEventHover}) {
  
    const CATEGORY_COLORS = {
    party: "#ec4899",
    launchpod: "#3b82f6",
    holiday: "#22c55e",
    payroll: "#f97316",
    others: "#0097b2",
  };

  const category = event.category?.toLowerCase() || "others";
  const solidColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.others;
  const eventKey = event.eventId || event.id;
  const images = eventImages[eventKey] || [];
  const isLoading = loadingImages[eventKey];
  return (
    <>
    <Tooltip
      title={
        <EventImageCarousel
          isLoading={isLoading}
          hasLink={!!(event.gdriveLink || event.gdrive_link)}
          images={images}
        />
      }
      arrow
      placement="top"
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      enterDelay={500}
      leaveDelay={100}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "transparent",
            padding: 0,
            maxWidth: "none",
            boxShadow: "none",
          },
        },
        arrow: {
          sx: { color: "rgba(17, 24, 39, 0.95)" },
        },
      }}
    >
      <div
        onMouseEnter={() => handleEventHover(event)}
        onClick={() => onSelectEvent(event)}
        className={`
          relative group cursor-pointer
          ${
            compact
              ? "px-2 py-1.5 text-xs mb-1"
              : "px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm mb-2"
          }
          rounded-lg transition-all duration-300
          hover:shadow-lg
          overflow-hidden
        `}
        style={{
          backgroundColor: `${solidColor}20`,
          borderLeft: `3px solid ${solidColor}`,
        }}
      >
        <div 
          className="relative z-10 font-semibold truncate"
          style={{ color: solidColor }}
        >
          {event.title}
        </div>
      </div>
    </Tooltip>
    </>
  )
}

export default EventBadge
