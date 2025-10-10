import React from "react";
import Button from "./Button";

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon,
  variant = "danger",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          {icon && <div className="mb-4">{icon}</div>}
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>
          <div className="flex gap-3 w-full">
            <Button 
              onClick={onClose} 
              variant="secondary"
              className="flex-1"
            >
              {cancelLabel}
            </Button>
            <Button 
              onClick={onConfirm} 
              variant={variant}
              className="flex-1"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;