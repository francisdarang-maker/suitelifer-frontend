import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";

const BatchImportModal = ({ open, onClose, onImport }) => {
  const [urls, setUrls] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = async () => {
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length === 0) return;

    setIsProcessing(true);
    await onImport(urlList);
    setIsProcessing(false);
    setUrls("");
  };

  const handleClose = () => {
    if (!isProcessing) {
      setUrls("");
      onClose();
    }
  };

  const urlCount = urls.split("\n").filter((url) => url.trim().length > 0).length;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Dimmed overlay (no blur) */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 transition-opacity" />
        </Transition.Child>

        {/* Dialog container */}
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900 flex items-center gap-2"
                  >
                    <DocumentArrowUpIcon className="h-6 w-6 text-blue-600" />
                    Batch Import Spotify Episodes
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Body */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Paste multiple Spotify episode or playlist URLs below, one per
                    line. The system will automatically validate and import them.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-medium mb-1">
                      💡 Tips for batch import:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Each URL must be on a separate line</li>
                      <li>Duplicate episodes will be automatically skipped</li>
                      <li>Invalid URLs will be reported after import</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spotify URLs ({urlCount} detected)
                    </label>
                    <textarea
                      value={urls}
                      onChange={(e) => setUrls(e.target.value)}
                      disabled={isProcessing}
                      placeholder={`https://open.spotify.com/episode/...\nhttps://open.spotify.com/playlist/...\nhttps://open.spotify.com/episode/...`}
                      className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>

                  {urlCount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">
                        Ready to import:
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                        {urlCount} URL{urlCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isProcessing || urlCount === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>Import {urlCount} Episode{urlCount !== 1 ? "s" : ""}</>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BatchImportModal;
