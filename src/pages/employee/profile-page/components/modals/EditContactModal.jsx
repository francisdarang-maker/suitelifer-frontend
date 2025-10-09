import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmModal from './ConfirmModal';

const EditContactModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    personal_email: user?.HrisUserInfo?.personal_email || '',
    contact_number: user?.HrisUserInfo?.contact_number || '',
  });

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      setLoading(true);

      await onSave(formData);

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
    <div className="fixed inset-0  bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full ">
        <div className="flex justify-between items-center  border-b p-6 border-gray-200 sticky top-0">
          <p className="text-lg font-avenir-medium text-gray-900">Edit Contact Info</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Email *
            </label>
            <input
              type="email"
              name="personal_email"
              value={formData.personal_email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Phone Number *
            </label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              maxLength={13}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
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
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default EditContactModal;