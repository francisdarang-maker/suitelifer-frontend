import { PencilIcon } from "@heroicons/react/24/outline";
import InfoField from "./InfoField";

const AddressInfo = ({ user, loading, onEdit }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  const permanentAddress = user?.HrisUserAddresses?.find(
    (addr) => addr.address_type === "PERMANENT"
  );
  const currentAddress = user?.HrisUserAddresses?.find(
    (addr) => addr.address_type === "CURRENT"
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-md font-avenir-black text-gray-900">Addresses</p>
        <button
          onClick={onEdit}
          className="flex items-center sm:space-x-2 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white sm:border sm:border-gray-300 sm:rounded-lg sm:hover:bg-gray-50 transition-colors"
        
        >
          <PencilIcon className="w-4 h-4" />
          <span className="hidden sm:block">Edit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-sm font-avenir-medium text-primary">
            Permanent Address
          </p>
          <InfoField
            label="Building/House No."
            value={permanentAddress?.building_num}
          />
          <InfoField label="Street" value={permanentAddress?.street} />
          <InfoField label="Barangay" value={permanentAddress?.barangay} />
          <InfoField label="City" value={permanentAddress?.city} />
          <InfoField label="Province" value={permanentAddress?.province} />
          <InfoField label="Region" value={permanentAddress?.region} />
          <InfoField label="Country" value={permanentAddress?.country} />
          <InfoField
            label="Postal Code"
            value={permanentAddress?.postal_code}
          />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-avenir-medium text-primary">
            Current Address
          </p>
          <InfoField
            label="Building/House No."
            value={currentAddress?.building_num}
          />
          <InfoField label="Street" value={currentAddress?.street} />
          <InfoField label="Barangay" value={currentAddress?.barangay} />
          <InfoField label="City" value={currentAddress?.city} />
          <InfoField label="Province" value={currentAddress?.province} />
          <InfoField label="Region" value={currentAddress?.region} />
          <InfoField label="Country" value={currentAddress?.country} />
          <InfoField label="Postal Code" value={currentAddress?.postal_code} />
        </div>
      </div>
    </div>
  );
};

export default AddressInfo;
