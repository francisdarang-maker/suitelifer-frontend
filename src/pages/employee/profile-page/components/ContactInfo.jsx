import { PencilIcon } from "@heroicons/react/24/outline";
import InfoField from "./InfoField";

const ContactInfo = ({
  user,
  loading,
  onEditContact,
  onEditEmergencyContacts,
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Personal Contact */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-avenir-black text-gray-900">
            Contact Info
          </p>
          <button
            onClick={onEditContact}
            className="flex items-center sm:space-x-2 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white sm:border sm:border-gray-300 sm:rounded-lg sm:hover:bg-gray-50 transition-colors  cursor-pointer"
          >
            <PencilIcon className="w-4 h-4" />
            <span className="hidden sm:block">Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-15">
          <InfoField
            label="Personal Email"
            value={user?.HrisUserInfo?.personal_email}
            type="email"
          />
          <InfoField
            label="Personal Phone Number"
            value={user?.HrisUserInfo?.contact_number}
            type="phone"
          />
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-avenir-black text-gray-900">
            Emergency Contacts
          </p>
          <button
            onClick={onEditEmergencyContacts}
            className="flex items-center sm:space-x-2 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white sm:border sm:border-gray-300 sm:rounded-lg sm:hover:bg-gray-50 transition-colors  cursor-pointer"
          >
            <PencilIcon className="w-4 h-4" />
            <span className="hidden sm:block">Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user.HrisUserEmergencyContacts &&
          user.HrisUserEmergencyContacts.length > 0 ? (
            [...user.HrisUserEmergencyContacts]
              .sort((a, b) =>
                a.full_name.localeCompare(b.full_name, "en", {
                  sensitivity: "base",
                })
              )
              .map((contact, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-4"
                >
                  <InfoField label="Full Name" value={contact.full_name} />
                  <InfoField
                    label="Relationship"
                    value={contact.relationship}
                  />
                  <InfoField
                    label="Contact Number"
                    value={contact.contact_number}
                    type="phone"
                  />
                </div>
              ))
          ) : (
            <p className="text-gray-500 text-center py-4 col-span-2">
              No emergency contacts added
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
