import { useContext, useEffect, useState } from "react";
import { editEmployeeAddressesAPI, editEmployeeContactInfoAPI, editEmployeeEmergencyContactsAPI, editEmployeePersonalDetailsAPI, fetchEmployeeDetailsAPI } from "../../../api/hris/employeeAPI";
import { EmployeeDetailsContext } from "../context/EmployeeDetailsContext";
import { useStore } from "../../../store/authStore";
import { getUserFromCookie } from "../../../utils/cookie";
import { editEmployeePersonalDetailsSuiteliferAPI } from "../../../api/suitelifer/employeeSuiteliferAPI";

import { useQuery } from "@tanstack/react-query";
export const useFetchEmployeeDetailsAPI = (userId) => {
    const {
        setUser,
        setLoading,
        setPersonalInfo,
        setDesignations,
        setEmploymentInfo,
        setSalaryInfo,
        setHr201,
        setGovernmentIds,
        setAddresses,
        setEmergencyContacts,
        setNotFound,
    } = useContext(EmployeeDetailsContext);

    const {
        data,
        error,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["employee-details", userId],
        queryFn: async () => {
            if (!userId) return null;
            const data = await fetchEmployeeDetailsAPI({ user_id: userId });
            return data;
        },
        enabled: !!userId, // only fetch when userId exists
        staleTime: 5 * 60 * 1000, // optional: cache for 5 min
    });

    // Sync fetched data into context
    useEffect(() => {
        setLoading(isLoading);

        if (isError) {
            console.error("Failed to fetch user details:", error);
            setLoading(false);
            return;
        }

        if (data === 404) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        if (data?.user) {
            const user = data.user;

            setUser(user);
            setPersonalInfo(user.HrisUserInfo);
            setDesignations(user.HrisUserDesignations?.[0] || {});
            setEmploymentInfo(user.HrisUserEmploymentInfo);
            setSalaryInfo(user.HrisUserSalary);
            setHr201(user.HrisUserHr201);
            setGovernmentIds(user.HrisUserGovernmentIds);
            setAddresses(user.HrisUserAddresses);
            setEmergencyContacts(user.HrisUserEmergencyContacts);
        }
    }, [data, isLoading, isError, error]);

    return {
        data,
        error,
        isLoading,
        isError,
        refetch, // 🔁 allows manual reload
    };
};


//edit personal details

export const useEditEmployeePersonalDetailsAPI = () => {
    const { setUser, setPersonalInfo } = useContext(EmployeeDetailsContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const editEmployeePersonalDetails = async (user_id, personalDetails) => {
        setLoading(true);
        setError(null);

        try {
            // Update employee record
            const updatedUserInfo = await editEmployeePersonalDetailsAPI(
                user_id,
                personalDetails
            );

            // Refresh employee data (the edited user's data)
            const refreshedData = await fetchEmployeeDetailsAPI({ user_id });

            if (refreshedData !== 404 && refreshedData.user) {
                setUser(refreshedData.user);
                setPersonalInfo(refreshedData.user.HrisUserInfo || null);
            }

            // Get the currently logged-in user from cookie
            // const cookieUser = await getUserFromCookie();

            // If the currently logged-in user is the one being edited → update global store
            // if (cookieUser && cookieUser.user_id === user_id) {
            //     setUserGlobal(refreshedData.user);
            // }

            console.log(
                "Employee Personal Details updated successfully:",
                updatedUserInfo
            );
            return updatedUserInfo;
        } catch (err) {
            console.error("Failed to update Employee Personal Details:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { editEmployeePersonalDetails, loading, error };
};


//edit personal details - SL

export const useEditEmployeePersonalDetailsSuiteliferAPI = () => {
    const { setUser, setPersonalInfo } = useContext(EmployeeDetailsContext);
    const { user: loggedInUser, setUser: setUserGlobal } = useStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const editEmployeePersonalDetailsSuitelifer = async (user_id, updatedData) => {
        setLoading(true);
        setError(null);

        try {
            // Update employee record
            const updatedUserInfo = await editEmployeePersonalDetailsSuiteliferAPI(
                user_id,
                updatedData
            );

            // Refresh employee data (the edited user's data)
            const refreshedData = await fetchEmployeeDetailsAPI({ user_id });

            if (refreshedData !== 404 && refreshedData.user) {
                setUser(refreshedData.user);
                setPersonalInfo(refreshedData.user.HrisUserInfo || null);
            }

            // Get the currently logged-in user from cookie
            const cookieUser = await getUserFromCookie();

            // If the currently logged-in user is the one being edited → update global store
            if (cookieUser && cookieUser.user_id === user_id) {
                setUserGlobal(refreshedData.user);
            }

            console.log(
                "Employee Personal Details updated successfully -sl:",
                updatedUserInfo
            );
            return updatedUserInfo;
        } catch (err) {
            console.error("Failed to update Employee Personal Details -sl:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { editEmployeePersonalDetailsSuitelifer, loading, error };
};


//edit addresses

export const useEditEmployeeAddressesAPI = () => {
    const { setUser, setAddresses } = useContext(EmployeeDetailsContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const editEmployeeAddresses = async (user_id, addresses) => {
        setLoading(true);
        setError(null);

        try {
            const updatedAddresses = await editEmployeeAddressesAPI(
                user_id,
                addresses
            );

            const refreshedData = await fetchEmployeeDetailsAPI({ user_id });

            if (refreshedData !== 404 && refreshedData.user) {
                setUser(refreshedData.user);
                setAddresses(refreshedData.user.HrisUserAddresses || []);
            }



            console.log("Employee Addresses updated successfully:", updatedAddresses);
            return updatedAddresses;
        } catch (err) {
            console.error("Failed to update Employee Addresses:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { editEmployeeAddresses, loading, error };
};


//edit contac info

export const useEditEmployeeContactInfoAPI = () => {
    const { setUser, setPersonalInfo } = useContext(EmployeeDetailsContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const editEmployeeContactInfo = async (user_id, contactInfo) => {
        setLoading(true);
        setError(null);

        try {
            const updatedUserInfo = await editEmployeeContactInfoAPI(user_id, {
                personal_email: contactInfo.personal_email,
                contact_number: contactInfo.contact_number,
            });

            const refreshedData = await fetchEmployeeDetailsAPI({ user_id });

            if (refreshedData !== 404 && refreshedData.user) {
                setUser(refreshedData.user);
                setPersonalInfo(refreshedData.user.HrisUserInfo || null);
            }

            console.log(
                "Employee Contact Info updated successfully:",
                updatedUserInfo
            );
            return updatedUserInfo;
        } catch (err) {
            console.error("Failed to update Employee Contact Info:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { editEmployeeContactInfo, loading, error };
};




//edit emergency contacts

export const useEditEmployeeEmergencyContactsAPI = () => {
    const { setUser, setEmergencyContacts } = useContext(EmployeeDetailsContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const editEmployeeEmergencyContacts = async (user_id, emergency_contacts) => {
        setLoading(true);
        setError(null);

        try {
            const updatedContacts = await editEmployeeEmergencyContactsAPI(
                user_id,
                emergency_contacts
            );

            const refreshedData = await fetchEmployeeDetailsAPI({ user_id });

            if (refreshedData !== 404 && refreshedData.user) {
                setUser(refreshedData.user);
                setEmergencyContacts(
                    refreshedData.user.HrisUserEmergencyContacts || []
                );
            }


            console.log(
                "Employee Emergency Contacts updated successfully:",
                updatedContacts
            );
            return updatedContacts;
        } catch (err) {
            console.error("Failed to update Employee Emergency Contacts:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { editEmployeeEmergencyContacts, loading, error };
};