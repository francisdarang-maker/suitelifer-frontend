import { EyeIcon } from "@heroicons/react/24/outline";
import InfoField from "./InfoField";

const Remittances = ({ user, loading, onOpen }) => {
const getGovIdNumber = (typeName) => {
  if (!user?.HrisUserGovernmentIds) return "";

  // Special case for PhilCare
  if (
    typeName.toLowerCase() === "philcare" &&
    user?.HrisUserEmploymentInfo?.HrisUserEmploymentStatus?.employment_status?.toLowerCase() ===
      "probationary"
  ) {
    return "Eligible upon regularization";
  }

  const match = user.HrisUserGovernmentIds.find(
    (id) =>
      id.HrisUserGovernmentIdType?.government_id_name?.toLowerCase() ===
      typeName.toLowerCase()
  );

  return match?.government_id_number || "";
};


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
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-avenir-black text-gray-900">
          Government Remittances
        </p>
        <div
          className="flex items-center sm:space-x-2 sm:px-4 py-2 text-sm font-medium text-gray-500 bg-white sm:border sm:border-gray-300 sm:rounded-lg sm:hover:bg-gray-50 transition-colors  cursor-pointer"
          onClick={onOpen}
        >
          <EyeIcon className="w-4 h-4" />

          <span className="hidden sm:block">View only</span>
        </div>
      </div>

      {/* ID List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField label="TIN" value={getGovIdNumber("TIN")} />
        <InfoField label="SSS" value={getGovIdNumber("SSS")} />
        <InfoField label="PHIC" value={getGovIdNumber("PHIC")} />
        <InfoField label="HDMF" value={getGovIdNumber("HDMF")} />
        <InfoField label="UnionBank" value={getGovIdNumber("UnionBank")} />
        <InfoField label="PhilCare" value={getGovIdNumber("PhilCare")} />
      </div>
    </div>
  );
};

export default Remittances;
