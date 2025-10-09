import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAddressForm } from "../../../hooks/useAddressForm";
import LocationFields from "../LocationFields";
import ConfirmModal from "./ConfirmModal";
import { useState } from "react";

const EditAddressModal = ({ user, onSave, onClose }) => {
  const {
    formData,
    selectedLocation,
    selectedCurrentLocation,
    permanentLocationData,
    currentLocationData,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
    handleChange,
    handleSameAsPermanent,
    handleLiveOutsidePH,
    handleSubmit,
    loading,
  } = useAddressForm(user, onSave, onClose);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmSave = async () => {
    try {
      setIsSubmitting(true);
      await handleSubmit();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleOpenConfirmModal = () => {
    setShowConfirm(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <p className="text-lg font-avenir-medium text-gray-900">
            Edit Addresses
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-md font-avenir-medium text-primary pb-2">
                Permanent Address
              </p>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="permanentOutsidePH"
                  checked={formData.liveOutsidePH.permanent}
                  onChange={(e) =>
                    handleLiveOutsidePH("permanentAddress", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300 accent-primary"
                />
                <label
                  htmlFor="permanentOutsidePH"
                  className="text-sm text-gray-700"
                >
                  Outside PH
                </label>
              </div>

              <LocationFields
                type="permanentAddress"
                formData={formData}
                locationData={permanentLocationData}
                selectedLocation={selectedLocation}
                isCurrentAddressDisabled={false}
                isOutsidePH={formData.liveOutsidePH.permanent}
                handleChange={handleChange}
                handleRegionChange={handleRegionChange}
                handleProvinceChange={handleProvinceChange}
                handleCityChange={handleCityChange}
                handleBarangayChange={handleBarangayChange}
              />
            </div>

            <div className="space-y-4">
              {" "}
              <p className="text-md font-avenir-medium text-primary pb-2">
                Current Address
              </p>
              <div className="flex justify-between items-center  mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="currentOutsidePH"
                    checked={formData.liveOutsidePH.current}
                    onChange={(e) =>
                      handleLiveOutsidePH("currentAddress", e.target.checked)
                    }
                    disabled={formData.sameAsPermanent}
                    className="w-4 h-4 rounded border-gray-300 accent-primary"
                  />
                  <label
                    htmlFor="currentOutsidePH"
                    className="text-sm text-gray-700"
                  >
                    Outside PH
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sameAsPermanent"
                    checked={formData.sameAsPermanent}
                    onChange={(e) => handleSameAsPermanent(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-primary"
                  />
                  <label
                    htmlFor="sameAsPermanent"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Same as permanent
                  </label>
                </div>
              </div>
              <LocationFields
                type="currentAddress"
                formData={formData}
                locationData={currentLocationData}
                selectedLocation={selectedCurrentLocation}
                isCurrentAddressDisabled={formData.sameAsPermanent}
                isOutsidePH={formData.liveOutsidePH.current}
                handleChange={handleChange}
                handleRegionChange={handleRegionChange}
                handleProvinceChange={handleProvinceChange}
                handleCityChange={handleCityChange}
                handleBarangayChange={handleBarangayChange}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleOpenConfirmModal}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
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
          onCancel={() => !isSubmitting && setShowConfirm(false)}
          loading={isSubmitting}
        />
      )}
    </div>
  );
};

export default EditAddressModal;
