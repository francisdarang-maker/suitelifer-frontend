import { useState } from "react";


 const BASE_URL = "https://psgc.gitlab.io/api";

export const useLocationData = () => {
  const [locationData, setLocationData] = useState({
    regions: [],
    provinces: [],
    cities: [],
    barangays: [],
  });

  const fetchRegions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/regions/`);
      const data = await response.json();
      setLocationData((prev) => ({ ...prev, regions: data }));
      return data;
    } catch (error) {
      console.error("Error fetching regions:", error);
      return [];
    }
  };

  const fetchProvinces = async (regionCode) => {
    try {
      const response = await fetch(`${BASE_URL}/regions/${regionCode}/provinces/`);
      const data = await response.json();
      setLocationData((prev) => ({
        ...prev,
        provinces: data,
        cities: [],
        barangays: [],
      }));
      return data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      return [];
    }
  };

  const fetchCities = async (provinceCode) => {
    try {
      const response = await fetch(`${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
      const data = await response.json();
      setLocationData((prev) => ({ ...prev, cities: data, barangays: [] }));
      return data;
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  };

  const fetchCitiesForNCR = async (regionCode) => {
    try {
      const response = await fetch(`${BASE_URL}/regions/${regionCode}/cities-municipalities/`);
      const data = await response.json();
      setLocationData((prev) => ({ ...prev, cities: data, barangays: [] }));
      return data;
    } catch (error) {
      console.error("Error fetching cities for NCR:", error);
      return [];
    }
  };

  const fetchBarangays = async (cityCode) => {
    try {
      const response = await fetch(`${BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
      const data = await response.json();
      setLocationData((prev) => ({ ...prev, barangays: data }));
      return data;
    } catch (error) {
      console.error("Error fetching barangays:", error);
      return [];
    }
  };

  return {
    locationData,
    setLocationData,
    fetchRegions,
    fetchProvinces,
    fetchCities,
    fetchCitiesForNCR,
    fetchBarangays,
  };
};