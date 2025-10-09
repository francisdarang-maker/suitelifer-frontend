// components/PersonalInfo.jsx
import { PencilIcon } from "@heroicons/react/24/outline";
import InfoField from "./InfoField";

const PersonalInfo = ({ user, loading, onEdit }) => {
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

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center ">
        <p className="text-sm font-avenir-black text-gray-900">
          Personal Details
        </p>
        <button
          onClick={onEdit}
          className="flex items-center sm:space-x-2 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white sm:border sm:border-gray-300 sm:rounded-lg sm:hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <PencilIcon className="w-4 h-4" />
          <span className="hidden sm:block">Edit</span>
        </button>
      </div>

      {/* Single grid, order preserved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField
          label="Full Name"
          value={`${user?.HrisUserInfo?.first_name || ""} ${user?.HrisUserInfo?.middle_name || ""} ${user?.HrisUserInfo?.last_name || ""} ${user?.HrisUserInfo?.extension_name || ""}`}
        /> 
        <InfoField label="Nickname" value={user?.HrisUserInfo?.nickname} />
        <InfoField label="Sex" value={user?.HrisUserInfo?.sex} />
        <InfoField label="Gender" value={user?.HrisUserInfo?.gender} />
        <InfoField
          label="Birthdate"
          value={new Date(user?.HrisUserInfo?.birthdate).toLocaleDateString()}
        />
        <InfoField label="Age" value={calculateAge(user?.HrisUserInfo?.birthdate)} />
        <InfoField label="Birthplace" value={user?.HrisUserInfo?.birth_place} />
        <InfoField label="Civil Status" value={user?.HrisUserInfo?.civil_status} />
        <InfoField label="Height" value={user?.HrisUserInfo?.height_cm && `${user?.HrisUserInfo?.height_cm} cm`} />
        <InfoField label="Weight" value={user?.HrisUserInfo?.weight_kg && `${user?.HrisUserInfo?.weight_kg} kg`} />
        <InfoField label="Nationality" value={user?.HrisUserInfo?.nationality} />
        <InfoField label="Blood Type" value={user?.HrisUserInfo?.blood_type} />
      </div>
    </div>
  );
};

export default PersonalInfo;
