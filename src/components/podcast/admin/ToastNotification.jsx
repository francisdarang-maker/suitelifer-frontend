import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ToastNotification = ({ open, message, type = "success", action, onClose }) => {
  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
    error: <XCircleIcon className="h-6 w-6 text-red-600" />,
    info: <InformationCircleIcon className="h-6 w-6 text-blue-600" />,
    warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
  };

  const textColors = {
    success: "text-green-900",
    error: "text-red-900",
    info: "text-blue-900",
    warning: "text-yellow-900",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end justify-end pointer-events-none">
      <Transition
        show={open}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className={`pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg ${bgColors[type]}`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">{icons[type]}</div>
              <div className="ml-3 w-0 flex-1">
                <p className={`text-sm font-medium ${textColors[type]}`}>
                  {message}
                </p>
                {action && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={action.onClick}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                    >
                      {action.label}
                    </button>
                  </div>
                )}
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default ToastNotification;