// components/ProfileHeader.jsx
import { PencilIcon } from "@heroicons/react/24/outline";
import defaultProfileImg from "../../../../assets/images/defaultAvatar.svg";

const ProfileHeader = ({ user, loading, onEditProfilePic }) => {
  if (loading) {
    return (
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-200 h-24 w-24 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const fullName = [
    user?.HrisUserInfo?.first_name,
    user?.HrisUserInfo?.last_name,
    user?.HrisUserInfo?.extension_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="px-5 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
        <div className="relative group self-center sm:self-start">
          <div className="relative mt-3 mx-auto rounded-full size-35">
            {/* Profile Image Container */}
            <div className="relative w-full h-full rounded-full border border-gray-200 overflow-hidden">
              <img
                src={user?.HrisUserInfo?.user_pic || defaultProfileImg}
                alt={fullName || "profile picture"}
                className="absolute inset-0 w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Edit Icon */}
            <div
              onClick={onEditProfilePic}
              className="absolute bottom-3 right-3 w-5 h-5 p-1 bg-primary rounded-full cursor-pointer flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <PencilIcon className="text-white w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs sm:text-sm font-avenir-roman text-primary">
            {user?.user_id}
          </p>
          <p className="text-xl sm:text-2xl font-avenir-black text-gray-900 mb-1">
            {fullName}
            {user?.HrisUserInfo?.nickname && (
              <span className="text-sm sm:text-lg font-avenir-medium text-gray-600 ml-2">
                ({user?.HrisUserInfo?.nickname})
              </span>
            )}
          </p>
          <p className="text-xs sm:text-sm font-avenir-medium text-gray-600">
            {user?.HrisUserDesignations?.[0]?.CompanyJobTitle?.job_title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
