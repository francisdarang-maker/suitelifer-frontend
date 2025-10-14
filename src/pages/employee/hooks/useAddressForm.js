import { useState, useEffect } from "react";
import { useLocationData } from "./useLocationData";

export const useAddressForm = (user, onSave, onClose) => {


    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        permanentAddress: {},
        currentAddress: {},
        sameAsPermanent: false,
        liveOutsidePH: {
            permanent: false,
            current: false,
        },
    });

    const [isInitialized, setIsInitialized] = useState(false);

    const permanentLocation = useLocationData();
    const currentLocation = useLocationData();

    const [selectedLocation, setSelectedLocation] = useState({
        region: { code: "", name: "" },
        province: { code: "", name: "" },
        city: { code: "", name: "" },
        barangay: { code: "", name: "" },
    });

    const [selectedCurrentLocation, setSelectedCurrentLocation] = useState({
        region: { code: "", name: "" },
        province: { code: "", name: "" },
        city: { code: "", name: "" },
        barangay: { code: "", name: "" },
    });



    // Initialize form data with user addresses
    useEffect(() => {
        if (user && !isInitialized) {
            const permanentAddress =
                user?.HrisUserAddresses?.find(
                    (addr) => addr.address_type?.toUpperCase() === "PERMANENT"
                ) || {};

            const currentAddress =
                user?.HrisUserAddresses?.find(
                    (addr) => addr.address_type?.toUpperCase() === "CURRENT"
                ) || {};

            const isPermanentOutsidePH =
                permanentAddress.country &&
                permanentAddress.country.toLowerCase() !== "philippines";

            const isCurrentOutsidePH =
                currentAddress.country &&
                currentAddress.country.toLowerCase() !== "philippines";

            setFormData({
                permanentAddress,
                currentAddress,
                sameAsPermanent: false,
                liveOutsidePH: {
                    permanent: isPermanentOutsidePH,
                    current: isCurrentOutsidePH,
                },
            });

            if (!isPermanentOutsidePH) {
                initializeLocationData(permanentAddress, "permanent");
            }
            if (!isCurrentOutsidePH && currentAddress.regionCode) {
                initializeLocationData(currentAddress, "current");
            }

            setIsInitialized(true);
        }
    }, [user, isInitialized]);


    useEffect(() => {
        const fetchRegionsIfNeeded = async () => {
            try {
                if (
                    !formData.liveOutsidePH.permanent &&
                    permanentLocation.locationData.regions.length === 0
                ) {
                    await permanentLocation.fetchRegions();
                }

                if (
                    !formData.liveOutsidePH.current &&
                    currentLocation.locationData.regions.length === 0
                ) {
                    await currentLocation.fetchRegions();
                }
            } catch (error) {
                console.error("Failed to fetch regions:", error);
            }
        };

        fetchRegionsIfNeeded();
    }, [formData.liveOutsidePH.permanent, formData.liveOutsidePH.current]);


    const initializeLocationData = async (address, type) => {
        try {
            if (permanentLocation.locationData.regions.length === 0) {
                await permanentLocation.fetchRegions();
                await currentLocation.fetchRegions();
            }

            if (type === "permanent") {
                setSelectedLocation({
                    region: { code: address.regionCode, name: address.region },
                    province: { code: address.provinceCode, name: address.province },
                    city: { code: address.cityCode, name: address.city },
                    barangay: { code: address.barangayCode, name: address.barangay },
                });

                if (address.regionCode === "130000000") {
                    await permanentLocation.fetchCitiesForNCR(address.regionCode);
                } else {
                    await permanentLocation.fetchProvinces(address.regionCode);
                    if (address.provinceCode) {
                        await permanentLocation.fetchCities(address.provinceCode);
                        if (address.cityCode) {
                            await permanentLocation.fetchBarangays(address.cityCode);
                        }
                    }
                }
            } else if (type === "current") {
                setSelectedCurrentLocation({
                    region: { code: address.regionCode, name: address.region },
                    province: { code: address.provinceCode, name: address.province },
                    city: { code: address.cityCode, name: address.city },
                    barangay: { code: address.barangayCode, name: address.barangay },
                });

                if (address.regionCode === "130000000") {
                    await currentLocation.fetchCitiesForNCR(address.regionCode);
                } else {
                    await currentLocation.fetchProvinces(address.regionCode);
                    if (address.provinceCode) {
                        await currentLocation.fetchCities(address.provinceCode);
                        if (address.cityCode) {
                            await currentLocation.fetchBarangays(address.cityCode);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error initializing location data:", error);
        }
    };

    const handleRegionChange = (type, regionCode, regionName) => {
        const isNCR = regionCode === "130000000";

        if (type === "permanentAddress") {
            setSelectedLocation({
                region: { code: regionCode, name: regionName },
                province: { code: "", name: "" },
                city: { code: "", name: "" },
                barangay: { code: "", name: "" },
            });
        } else {
            setSelectedCurrentLocation({
                region: { code: regionCode, name: regionName },
                province: { code: "", name: "" },
                city: { code: "", name: "" },
                barangay: { code: "", name: "" },
            });
        }

        handleChange(type, "regionCode", regionCode);
        handleChange(type, "region", regionName);
        handleChange(type, "provinceCode", null);
        handleChange(type, "province", null);
        handleChange(type, "cityCode", null);
        handleChange(type, "city", null);
        handleChange(type, "barangayCode", null);
        handleChange(type, "barangay", null);

        if (isNCR) {
            if (type === "permanentAddress") {
                permanentLocation.fetchCitiesForNCR(regionCode);
            } else {
                currentLocation.fetchCitiesForNCR(regionCode);
            }
        } else {
            if (type === "permanentAddress") {
                permanentLocation.fetchProvinces(regionCode);
            } else {
                currentLocation.fetchProvinces(regionCode);
            }
        }
    };

    const handleProvinceChange = (type, provinceCode, provinceName) => {
        if (type === "permanentAddress") {
            setSelectedLocation((prev) => ({
                ...prev,
                province: { code: provinceCode, name: provinceName },
                city: { code: "", name: "" },
                barangay: { code: "", name: "" },
            }));
        } else {
            setSelectedCurrentLocation((prev) => ({
                ...prev,
                province: { code: provinceCode, name: provinceName },
                city: { code: "", name: "" },
                barangay: { code: "", name: "" },
            }));
        }

        handleChange(type, "provinceCode", provinceCode);
        handleChange(type, "province", provinceName);
        handleChange(type, "cityCode", null);
        handleChange(type, "city", null);
        handleChange(type, "barangayCode", null);
        handleChange(type, "barangay", null);

        if (type === "permanentAddress") {
            permanentLocation.fetchCities(provinceCode);
        } else {
            currentLocation.fetchCities(provinceCode);
        }
    };

    const handleCityChange = (type, cityCode, cityName) => {
        if (type === "permanentAddress") {
            setSelectedLocation((prev) => ({
                ...prev,
                city: { code: cityCode, name: cityName },
                barangay: { code: "", name: "" },
            }));
        } else {
            setSelectedCurrentLocation((prev) => ({
                ...prev,
                city: { code: cityCode, name: cityName },
                barangay: { code: "", name: "" },
            }));
        }

        handleChange(type, "cityCode", cityCode);
        handleChange(type, "city", cityName);
        handleChange(type, "barangayCode", null);
        handleChange(type, "barangay", null);

        if (type === "permanentAddress") {
            permanentLocation.fetchBarangays(cityCode);
        } else {
            currentLocation.fetchBarangays(cityCode);
        }
    };

    const handleBarangayChange = (type, barangayCode, barangayName) => {
        if (type === "permanentAddress") {
            setSelectedLocation((prev) => ({
                ...prev,
                barangay: { code: barangayCode, name: barangayName },
            }));
        } else {
            setSelectedCurrentLocation((prev) => ({
                ...prev,
                barangay: { code: barangayCode, name: barangayName },
            }));
        }

        handleChange(type, "barangayCode", barangayCode);
        handleChange(type, "barangay", barangayName);
    };

    const handleChange = (type, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }));
    };

    const handleSameAsPermanent = (checked) => {
        if (checked) {
            setFormData((prev) => ({
                ...prev,
                sameAsPermanent: true,
                currentAddress: {
                    ...prev.permanentAddress,
                    address_type: "CURRENT",
                },
                liveOutsidePH: {
                    ...prev.liveOutsidePH,
                    current: prev.liveOutsidePH.permanent,
                },
            }));
            currentLocation.setLocationData({ ...permanentLocation.locationData });
            setSelectedCurrentLocation({ ...selectedLocation });
        } else {
            setFormData((prev) => ({
                ...prev,
                sameAsPermanent: false,
            }));
        }
    };

    const handleLiveOutsidePH = (type, checked) => {
        const addressKey = type === "permanentAddress" ? "permanent" : "current";

        if (checked) {
            const emptyAddress = {
                country: "",
                regionCode: null,
                region: "",
                provinceCode: null,
                province: "",
                cityCode: null,
                city: "",
                barangayCode: null,
                barangay: "",
                postal_code: "",
                street: "",
                building_num: "",
            };

            setFormData((prev) => {
                const updated = {
                    ...prev,
                    liveOutsidePH: {
                        ...prev.liveOutsidePH,
                        [addressKey]: true,
                    },
                    [type]: { ...prev[type], ...emptyAddress },
                };

                if (type === "permanentAddress" && prev.sameAsPermanent) {
                    updated.liveOutsidePH.current = true;
                    updated.currentAddress = { ...updated.permanentAddress };
                }

                return updated;
            });

            if (type === "permanentAddress") {
                setSelectedLocation({
                    region: { code: "", name: "" },
                    province: { code: "", name: "" },
                    city: { code: "", name: "" },
                    barangay: { code: "", name: "" },
                });
            } else {
                setSelectedCurrentLocation({
                    region: { code: "", name: "" },
                    province: { code: "", name: "" },
                    city: { code: "", name: "" },
                    barangay: { code: "", name: "" },
                });
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                liveOutsidePH: {
                    ...prev.liveOutsidePH,
                    [addressKey]: false,
                },
                [type]: {
                    ...prev[type],
                    country: "Philippines",
                    regionCode: null,
                    region: "",
                    provinceCode: null,
                    province: "",
                    cityCode: null,
                    city: "",
                    barangayCode: null,
                    barangay: "",
                },
            }));
        }
    };



    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        try {
            setLoading(true);

            const prepareAddressPayload = (address, addressTypeLiveOutsidePH) => {
                if (addressTypeLiveOutsidePH) {
                    return {
                        ...address,
                        regionCode: null,
                        provinceCode: null,
                        cityCode: null,
                        barangayCode: null,
                    };
                }
                return address;
            };

            console.log("permanentAddress: ", prepareAddressPayload(formData.permanentAddress, formData.liveOutsidePH.permanent));
            console.log("currentAddress: ", prepareAddressPayload(formData.currentAddress, formData.liveOutsidePH.current));

            await onSave?.([
                prepareAddressPayload(formData.permanentAddress),
                prepareAddressPayload(formData.currentAddress),
            ]);

            onClose?.();
        } catch (error) {
            console.error("Failed to update address: ", error);
        } finally {
            setLoading(false);
        }
    };


    return {
        formData,
        selectedLocation,
        selectedCurrentLocation,
        permanentLocationData: permanentLocation.locationData,
        currentLocationData: currentLocation.locationData,
        handleRegionChange,
        handleProvinceChange,
        handleCityChange,
        handleBarangayChange,
        handleChange,
        handleSameAsPermanent,
        handleLiveOutsidePH,
        handleSubmit,
        loading,
    };
};