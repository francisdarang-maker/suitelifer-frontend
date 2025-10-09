const ConfirmModal = ({ title, message, onConfirm, onCancel, loading }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <p className="text-lg text-gray-900">{title}</p>
        <p className="text-gray-600 text-sm">{message}</p>

        <div className="flex justify-end gap-3 pt-4">
          <button
            disabled={loading}
            onClick={onCancel}
            className="text-sm px-3 py-2 rounded-lg border border-gray-300 text-gray-600 disabled:border-gray-200 disabled:text-gray-200 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={onConfirm}
            className="text-sm px-3 py-2 rounded-lg bg-primary disabled:bg-primary/50 text-white hover:bg-primary/90 transition"
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
