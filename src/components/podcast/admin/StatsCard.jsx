import React from "react";

const StatsCard = ({ label, value, icon, color = "bg-primary" }) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
    <div className={`p-3 rounded-lg ${color} flex-shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-600 font-medium truncate">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default StatsCard;