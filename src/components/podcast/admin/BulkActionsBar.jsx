import { TrashIcon, ArrowDownTrayIcon, CheckIcon } from "@heroicons/react/24/outline";

const BulkActionsBar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkExport,
}) => {
  const isAllSelected = selectedCount === totalCount;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckIcon className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} selected
          </span>
        </div>
        
        <button
          onClick={onSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {isAllSelected ? "Deselect all" : `Select all ${totalCount}`}
        </button>

        <button
          onClick={onClearSelection}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Clear selection
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onBulkExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export Selected
        </button>

        <button
          onClick={onBulkDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <TrashIcon className="h-4 w-4" />
          Delete Selected
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;