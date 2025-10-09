import api from "../../utils/axios";

export const editEmployeePersonalDetailsSuiteliferAPI = async (
    user_id,
    updatedData
) => {
    try {
        const response = await api.patch(
            `/api/users/personal-details`,
            { user_id, updatedData }
        );

        console.log(
            "Employee Personal Details updated successfully:",
            response,
        );

        return response;
    } catch (error) {
        console.error("Failed to update Employee Personal Details:", error);
        throw error;
    }
};