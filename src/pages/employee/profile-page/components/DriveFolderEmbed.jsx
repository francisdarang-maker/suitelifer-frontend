import { useState } from "react";
import Skeleton from "react-loading-skeleton";

export default function DriveFolderEmbed({ folderLink, isGrid = false }) {
  const [isLoading, setIsLoading] = useState(true);

  if (!folderLink || typeof folderLink !== "string") {
    return (
      <p className="text-muted-foreground italic text-sm">
        No Google Drive folder link has been set up yet.
      </p>
    );
  }

  const match = folderLink.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const folderId = match?.[1];

  if (!folderId) {
    return (
      <p className="text-muted-foreground italic text-sm">
        Invalid Google Drive folder link format. Click 'Edit' to check and
        change.
      </p>
    );
  }

  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}${
    isGrid ? "#grid" : "#list"
  }`;

  return (
    <div className="flex-1 w-full  min-h-[300px] h-[calc(100vh-4rem)] ">
      {isLoading &&
        (isGrid ? (
          <div className="grid grid-cols-4 gap-10 p-5">
            {Array(12)
              .fill()
              .map((_, i) => (
                <Skeleton key={i} height={150} />
              ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-5">
            {Array(10)
              .fill()
              .map((_, i) => (
                <Skeleton key={i} height={40} />
              ))}
          </div>
        ))}

      <iframe
        src={embedUrl}
        className={`w-full h-full border-0 ${isLoading ? "hidden" : ""}`}
        title="Google Drive Folder"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
