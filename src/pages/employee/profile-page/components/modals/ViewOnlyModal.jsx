// components/modals/EditPersonalDetailsModal.jsx
import { XMarkIcon } from "@heroicons/react/24/outline";

const ViewOnlyModal = ({ onClose, title ='View only', description="This is for view only." }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <p className="text-lg font-avenir-medium text-gray-900">{title}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-gray-600 leading-relaxed">
           {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyModal;
