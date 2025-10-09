// components/modals/EditPersonalDetailsModal.jsx
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "./ConfirmModal";

const EditPersonalDetailsModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: user?.HrisUserInfo?.first_name || "",
    middleName: user?.HrisUserInfo?.middle_name || "",
    lastName: user?.HrisUserInfo?.last_name || "",
    extensionName: user?.HrisUserInfo?.extension_name || "",
    nickname: user?.HrisUserInfo?.nickname || "",
    sex: user?.HrisUserInfo?.sex || "",
    gender: user?.HrisUserInfo?.gender || "",
    birthdate: user?.HrisUserInfo?.birthdate || "",
    birthplace: user?.HrisUserInfo?.birth_place || "",
    civilStatus: user?.HrisUserInfo?.civil_status || "",
    heightCm: user?.HrisUserInfo?.height_cm || "",
    weightKg: user?.HrisUserInfo?.weight_kg || "",
    nationality: user?.HrisUserInfo?.nationality || "",
    bloodType: user?.HrisUserInfo?.blood_type || "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };
  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      const updatedData = {
        ...formData,
        height: formData.heightCm ? Number(formData.heightCm) : null,
        weight: formData.weightKg ? Number(formData.weightKg) : null,
      };

      await onSave(updatedData);

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

  const sexOptions = ["Male", "Female"];
  const genderOptions = [
    "Cisgender",
    "Transgender",
    "Non-binary",
    "Genderqueer",
    "Agender",
    "Genderfluid",
    "Intersex",
    "Bigender",
    "Pangender",
    "Gender non-conforming",
  ];
  const civilStatusOptions = [
    "Single",
    "Married",
    "Widowed",
    "Divorced",
    "Separated",
    "Civil Union",
  ];
  const bloodTypeOptions = [
    "A",
    "A+",
    "A-",
    "B",
    "B+",
    "B-",
    "AB",
    "AB+",
    "AB-",
    "O",
    "O+",
    "O-",
    "Unknown",
  ];

  return (
    <div className="fixed inset-0  bg-black/40  flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <p className="text-lg font-avenir-medium text-gray-900">
            Edit Personal Details
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extension Name
              </label>
              <input
                type="text"
                name="extensionName"
                value={formData.extensionName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nickname
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {sexOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthdate
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthplace
              </label>
              <input
                type="text"
                name="birthplace"
                value={formData.birthplace}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Civil Status
              </label>
              <select
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {civilStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                name="heightCm"
                value={formData.heightCm}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Type
              </label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                {bloodTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

export default EditPersonalDetailsModal;
