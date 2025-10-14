const InfoField = ({ label, value, type = "text" }) => {
  const formatValue = (val, valueType) => {
    if (!val) return "---";

    switch (valueType) {
      case "email":
        return (
          <a
            href={`mailto:${val}`}
            className="text-primary hover:text-primary/90 break-words no-underline"
          >
            {val}
          </a>
        );
      case "phone":
        return (
          <a href={`tel:${val}`} className="text-primary hover:text-primary/90 no-underline">
            {val}
          </a>
        );
      default:
        return val;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-3 border-b border-gray-100 gap-2">
      <span className="text-sm font-medium text-gray-500 sm:min-w-32">
        {label}
      </span>

      <span className="text-sm text-gray-900 break-words text-left sm:text-right sm:flex-1 sm:max-w-[50%]">
        {formatValue(value, type)}
      </span>
    </div>
  );
};

export default InfoField;
