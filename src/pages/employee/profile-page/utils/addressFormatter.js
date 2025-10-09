export const formatAddressesPayload = (data) => {
  if (!Array.isArray(data)) return { addresses: [] };

  const getAddr = (type) =>
    data.find((a) => a.address_type?.toUpperCase() === type) || {};

  const current = getAddr("CURRENT");
  const permanent = getAddr("PERMANENT");

  return {
    addresses: [
      {
        user_address_id: current.user_address_id || null,
        building_num: current.building_num || null,
        street: current.street || null,
        barangay: current.barangay || null,
        barangayCode: current.barangayCode || null,
        city: current.city || null,
        cityCode: current.cityCode || null,
        postal_code: current.postal_code || null,
        province: current.province || null,
        provinceCode: current.provinceCode || null,
        region: current.region || null,
        regionCode: current.regionCode || null,
        country: current.country || null,
        address_type: "CURRENT",
      },
      {
        user_address_id: permanent.user_address_id || null,
        building_num: permanent.building_num || null,
        street: permanent.street || null,
        barangay: permanent.barangay || null,
        barangayCode: permanent.barangayCode || null,
        city: permanent.city || null,
        cityCode: permanent.cityCode || null,
        postal_code: permanent.postal_code || null,
        province: permanent.province || null,
        provinceCode: permanent.provinceCode || null,
        region: permanent.region || null,
        regionCode: permanent.regionCode || null,
        country: permanent.country || null,
        address_type: "PERMANENT",
      },
    ],
  };
};
