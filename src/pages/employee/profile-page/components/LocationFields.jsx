const LocationFields = ({
  type,
  formData,
  locationData,
  selectedLocation,
  isCurrentAddressDisabled,
  isOutsidePH,
  handleChange,
  handleRegionChange,
  handleProvinceChange,
  handleCityChange,
  handleBarangayChange,
}) => {
  const isNCR = selectedLocation.region.code === "130000000";

  if (isOutsidePH) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            value={formData[type]?.country || ""}
            onChange={(e) => handleChange(type, "country", e.target.value)}
            disabled={isCurrentAddressDisabled }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
            placeholder="Enter country"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region/State
          </label>
          <input
            type="text"
            value={formData[type]?.region || ""}
            onChange={(e) => handleChange(type, "region", e.target.value)}
            disabled={isCurrentAddressDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
            placeholder="Enter region or state"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province
          </label>
          <input
            type="text"
            value={formData[type]?.province || ""}
            onChange={(e) => handleChange(type, "province", e.target.value)}
            disabled={isCurrentAddressDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
            placeholder="Enter province"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={formData[type]?.city || ""}
            onChange={(e) => handleChange(type, "city", e.target.value)}
            disabled={isCurrentAddressDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barangay/District
          </label>
          <input
            type="text"
            value={formData[type]?.barangay || ""}
            onChange={(e) => handleChange(type, "barangay", e.target.value)}
            disabled={isCurrentAddressDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
            placeholder="Enter barangay or district"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            value={formData[type]?.postal_code || ""}
            onChange={(e) => handleChange(type, "postal_code", e.target.value)}
            disabled={isCurrentAddressDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
            placeholder="Enter postal code"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <input
            type="text"
            value={formData[type]?.street || ""}
            onChange={(e) => handleChange(type, "street", e.target.value)}
            disabled={isCurrentAddressDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
            placeholder="Enter street"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Building/House No.
          </label>
          <input
            type="text"
            value={formData[type]?.building_num || ""}
            onChange={(e) => handleChange(type, "building_num", e.target.value)}
            disabled={isCurrentAddressDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
            placeholder="Enter building/house number"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <input
          type="text"
          value={formData[type]?.country || "Philippines"}
          onChange={(e) => handleChange(type, "country", e.target.value)}
          disabled={isCurrentAddressDisabled || !isOutsidePH}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region
        </label>
        <select
          value={formData[type]?.regionCode || ""}
          onChange={(e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const regionName = selectedOption.getAttribute("data-name");
            handleRegionChange(type, e.target.value, regionName);
          }}
          disabled={isCurrentAddressDisabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
        >
          <option value="">Select Region</option>
          {locationData.regions.map((region) => (
            <option
              key={region.code}
              value={region.code}
              data-name={region.name}
              //   selected={formData[type]?.regionCode === region.code}
            >
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {!isNCR && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province
          </label>
          <select
            value={formData[type]?.provinceCode || ""}
            onChange={(e) => {
              const selectedOption = e.target.options[e.target.selectedIndex];
              const provinceName = selectedOption.getAttribute("data-name");
              handleProvinceChange(type, e.target.value, provinceName);
            }}
            disabled={!formData[type]?.regionCode || isCurrentAddressDisabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
          >
            <option value="">Select Province</option>
            {locationData.provinces.map((province) => (
              <option
                key={province.code}
                value={province.code}
                data-name={province.name}
                // selected={formData[type]?.provinceCode === province.code}
              >
                {province.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isNCR ? "City/Municipality" : "City/Municipality"}
        </label>
        <select
          value={formData[type]?.cityCode || ""}
          onChange={(e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const cityName = selectedOption.getAttribute("data-name");
            handleCityChange(type, e.target.value, cityName);
          }}
          disabled={
            (!formData[type]?.provinceCode && !isNCR) ||
            !formData[type]?.regionCode ||
            isCurrentAddressDisabled
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
        >
          <option value="">Select City/Municipality</option>
          {locationData.cities.map((city) => (
            <option
              key={city.code}
              value={city.code}
              data-name={city.name}
              //   selected={formData[type]?.cityCode === city.code}
            >
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barangay
        </label>
        <select
          value={formData[type]?.barangayCode || ""}
          onChange={(e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const barangayName = selectedOption.getAttribute("data-name");
            handleBarangayChange(type, e.target.value, barangayName);
          }}
          disabled={!formData[type]?.cityCode || isCurrentAddressDisabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
        >
          <option value="">Select Barangay</option>
          {locationData.barangays.map((barangay) => (
            <option
              key={barangay.code}
              value={barangay.code}
              data-name={barangay.name}
              //   selected={formData[type]?.barangayCode === barangay.code}
            >
              {barangay.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Postal Code
        </label>
        <input
          type="text"
          value={formData[type]?.postal_code || ""}
          onChange={(e) => handleChange(type, "postal_code", e.target.value)}
          disabled={isCurrentAddressDisabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street
        </label>
        <input
          type="text"
          value={formData[type]?.street || ""}
          onChange={(e) => handleChange(type, "street", e.target.value)}
          disabled={isCurrentAddressDisabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Building/House No.
        </label>
        <input
          type="text"
          value={formData[type]?.building_num || ""}
          onChange={(e) => handleChange(type, "building_num", e.target.value)}
          disabled={isCurrentAddressDisabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-primary/10 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default LocationFields;
