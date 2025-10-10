import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CommandLineIcon } from "@heroicons/react/24/outline";

const KeyboardShortcutsHelper = ({ open, onClose }) => {
  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: ["Ctrl", "K"], description: "Focus search box" },
        { keys: ["Esc"], description: "Clear selection" },
      ],
    },
    {
      category: "Actions",
      items: [
        { keys: ["Ctrl", "N"], description: "Add new episode" },
        { keys: ["Ctrl", "/"], description: "Show keyboard shortcuts" },
      ],
    },
  ];

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const formatKey = (key) => {
    if (key === "Ctrl") return modKey;
    if (key === "Esc") return "Esc";
    return key;
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ✨ Blurred background overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Added backdrop-blur for blur effect */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        {/* Centered modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-2"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-2"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md p-6 text-left align-middle shadow-2xl transition-all border border-white/30">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900 flex items-center gap-2"
                  >
                    <CommandLineIcon className="h-6 w-6 text-blue-600" />
                    Keyboard Shortcuts
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Shortcut List */}
                <div className="space-y-6">
                  {shortcuts.map((section) => (
                    <div key={section.category}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        {section.category}
                      </h4>
                      <div className="space-y-2">
                        {section.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2"
                          >
                            <span className="text-sm text-gray-600">
                              {item.description}
                            </span>
                            <div className="flex items-center gap-1">
                              {item.keys.map((key, i) => (
                                <Fragment key={i}>
                                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                                    {formatKey(key)}
                                  </kbd>
                                  {i < item.keys.length - 1 && (
                                    <span className="text-gray-400">+</span>
                                  )}
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Press {modKey} + / to toggle this dialog
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default KeyboardShortcutsHelper;
