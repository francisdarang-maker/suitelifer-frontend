import React from "react";

const EmptyState = ({ title, description, icon, action }) => (
  <div className="text-center py-12 px-4">
    {icon && (
      <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
        {icon}
      </div>
    )}
    <p className="text-lg text-primary font-semibold mb-2">{title}</p>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;