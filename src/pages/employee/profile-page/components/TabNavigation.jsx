const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-primary/20">
      <nav
        className="flex flex-nowrap space-x-8 px-6 overflow-x-auto scrollbar-hide"
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-primary/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
