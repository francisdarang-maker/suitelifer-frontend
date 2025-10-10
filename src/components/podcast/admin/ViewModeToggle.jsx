import { Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";

const ViewModeToggle = ({ viewMode = "card", onChange }) => {
  const handleToggle = (mode) => {
    if (viewMode !== mode && typeof onChange === "function") {
      onChange(mode);
    }
  };

  const getButtonClass = (mode) =>
    `flex items-center justify-center p-2 rounded-md transition-all duration-200 
     ${
       viewMode === mode
         ? "bg-blue-600 text-white shadow-sm"
         : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
     }`;

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => handleToggle("card")}
        className={getButtonClass("card")}
        title="Card View"
      >
        <Squares2X2Icon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => handleToggle("compact")}
        className={getButtonClass("compact")}
        title="Compact View"
      >
        <ListBulletIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ViewModeToggle;
