// components/modals/EditProfilePicModal.jsx
import { useState } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import TwoCirclesLoader from "../../../../../assets/loaders/TwoCirclesLoader";
import defaultProfileImg from "../../../../../assets/images/defaultAvatar.svg";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";

const EditProfilePicModal = ({ user, onSave, onClose }) => {
  const [profilePic, setProfilePic] = useState(
    user?.HrisUserInfo?.user_pic || defaultProfileImg
  );
  const [previewUrl, setPreviewUrl] = useState(
    user?.HrisUserInfo?.user_pic || defaultProfileImg
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (file) {
        setProfilePic(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target.result);
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        setUploading(false);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setUploading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      setUploading(true);
      await onSave(profilePic);
      setTimeout(() => {
        setShowConfirm(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error?.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg font-avenir-medium text-gray-900">
            Edit Profile Picture
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Current Profile Pic */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={previewUrl || defaultProfileImg}
                alt="Profile"
                className="w-32 h-32 sm:w-50 sm:h-50 rounded-full object-cover border-1 border-gray-200"
              />
              {uploading && (
                <div className="absolute inset-0 bg-white/50 rounded-full flex items-center justify-center">
                  <TwoCirclesLoader
                    bg={"transparent"}
                    color1={"#bfd1a0"}
                    color2={"#0097b2"}
                    height={30}
                    width={40}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Upload Options */}
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload</p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF (MAX. 5MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".jpeg,.jpg,.png,.heic,.webp"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {uploading ? "Uploading..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
      {showConfirm && (
        <ConfirmModal
          title="Confirm Save"
          message="Are you sure you want to change your profile picture?"
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirm(false)}
          loading={uploading}
        />
      )}
    </div>
  );
};

export default EditProfilePicModal;
