// components/PersonalInfo.jsx
import InfoField from "./InfoField";
import DriveFolderEmbed from "./DriveFolderEmbed";
import { useState } from "react";
import {
  ArrowTopRightOnSquareIcon,
  Squares2X2Icon,
  QueueListIcon,
} from "@heroicons/react/24/solid";
import {
  PencilIcon,
  Squares2X2Icon as Squares2X2IconOutline,
  QueueListIcon as QueueListIconOutline,
  EyeIcon,
} from "@heroicons/react/24/outline";

const Documents = ({ user, loading, onOpen }) => {
  const [isGrid, setIsGrid] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-5 justify-start px-3">
          {isGrid ? (
            <QueueListIconOutline
              className="w-5 h-5 text-primary cursor-pointer"
              onClick={() => {
                setIsGrid(!isGrid);
              }}
            />
          ) : (
            <QueueListIcon className="w-5 h-5 text-primary" />
          )}
          {isGrid ? (
            <Squares2X2Icon className="w-5 h-5 text-primary" />
          ) : (
            <Squares2X2IconOutline
              className="w-5 h-5 text-primary cursor-pointer"
              onClick={() => {
                setIsGrid(!isGrid);
              }}
            />
          )}
          <a
            href={user?.HrisUserHr201?.hr201_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowTopRightOnSquareIcon className="w-4.5 h-4.5 text-primary cursor-pointer" />
          </a>
        </div>
        <div
          
          className="flex items-center sm:space-x-2 sm:px-4 py-2 text-sm font-medium text-gray-500 bg-white sm:border sm:border-gray-300 sm:rounded-lg sm:hover:bg-gray-50 transition-colors  cursor-pointer"
            
            onClick={onOpen}
          >
            <EyeIcon className="w-4 h-4" />
                     <span className="hidden sm:block">View only</span>

          </div>
      </div>
      <DriveFolderEmbed
        folderLink={user?.HrisUserHr201?.hr201_url}
        isGrid={isGrid}
      />
    </div>
  );
};

export default Documents;
