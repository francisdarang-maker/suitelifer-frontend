import { useState } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "./ConfirmModal";

const EditEmergencyContactsModal = ({ user, onSave, onClose }) => {
  const [contacts, setContacts] = useState(
    user?.HrisUserEmergencyContacts || []
  );

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const addContact = () => {
    setContacts((prev) => [
      ...prev,
      { full_name: "", relationship: "", contact_number: "" },
    ]);
  };

  const updateContact = (index, field, value) => {
    setContacts((prev) =>
      prev.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    );
  };

  const removeContact = (index) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      setLoading(true);

      const validContacts = contacts
        .filter(
          (contact) =>
            contact.full_name && contact.relationship && contact.contact_number
        )
        .map((contact) => ({
          full_name: contact.full_name.trim(),
          contact_number: contact.contact_number.trim(),
          relationship: contact.relationship.trim(),
        }));

      await onSave({ emergencyContacts: validContacts });

      setTimeout(() => {
        setShowConfirm(false);
        onClose();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error?.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-black/40  flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <p className="text-lg font-avenir-medium text-gray-900">
            Edit Emergency Contacts
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 space-y-4 relative"
              >
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-primary/90"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={contact.full_name}
                      onChange={(e) =>
                        updateContact(index, "full_name", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship *
                    </label>
                    <input
                      type="text"
                      value={contact.relationship}
                      onChange={(e) =>
                        updateContact(index, "relationship", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      value={contact.contact_number}
              maxLength={13}

                      onChange={(e) =>
                        updateContact(index, "contact_number", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}

            {contacts.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                {user?.HrisUserEmergencyContacts.length < 1
                  ? "No emergency contacts added"
                  : "No emergency contacts"}
              </p>
            )}
          </div>

          {/* Add Contact Button */}
          <button
            type="button"
            onClick={addContact}
            disabled={contacts.length > 4}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed  disabled:border-gray-100 disabled:text-gray-300 border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            {contacts.length < 5 ? (
              <>
                <PlusIcon className="w-5 h-5" />
                <span>Add Emergency Contact</span>
              </>
            ) : (
              <span>You can only add up to 5 contacts.</span>
            )}
          </button>

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
      {showConfirm && (
        <ConfirmModal
          title="Confirm Save"
          message="Are you sure you want to save these changes?"
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default EditEmergencyContactsModal;
