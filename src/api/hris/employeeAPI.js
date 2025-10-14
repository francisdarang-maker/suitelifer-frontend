import hrisAPI from "../../utils/hrisAPI";

export const fetchEmployeeDetailsAPI = async ({ user_id }) => {
    try {
        
        // console.log("Fetching user details for user_id:", user_id);
        const response = await hrisAPI.get(`/api/hris-user-accounts/${user_id}`);
        console.log("User details fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user details:", error);
        return 404;
    }
};



export const editEmployeePersonalDetailsAPI = async (
  user_id,
  personalDetails
) => {
  try {
    const response = await hrisAPI.patch(
      `/api/hris-user-accounts/${user_id}/personal-details`,
      personalDetails
    );

    console.log(
      "Employee Personal Details updated successfully:",
      response.data.updatedUserInfo
    );

    return response.data.updatedUserInfo;
  } catch (error) {
    console.error("Failed to update Employee Personal Details:", error);
    throw error;
  }
};




export const editEmployeeAddressesAPI = async (user_id, addresses) => {
  try {
    const response = await hrisAPI.patch(
      `/api/hris-user-accounts/${user_id}/addresses`,
      addresses
    );

    console.log(
      "Employee addresses updated successfully:",
      response.data.updatedAddresses
    );

    return response.data.updatedAddresses;
  } catch (error) {
    console.error("Failed to update Employee addresses:", error);
    throw error;
  }
};



export const editEmployeeContactInfoAPI = async (user_id, contactInfo) => {
  try {
    const response = await hrisAPI.patch(
      `/api/hris-user-accounts/${user_id}/contact-info`,
      contactInfo
    );

    console.log(
      "Employee contact info updated successfully:",
      response.data.updatedUserInfo
    );

    return response.data.updatedUserInfo;
  } catch (error) {
    console.error("Failed to update Employee contact info:", error);
    throw error;
  }
};



export const editEmployeeEmergencyContactsAPI = async (
  user_id,
  emergency_contacts
) => {
  try {
    const response = await hrisAPI.patch(
      `/api/hris-user-accounts/${user_id}/emergency-contacts`,
      emergency_contacts
    );

    console.log(
      "Employee emergency contacts updated successfully:",
      response.data.updatedEmergencyContacts
    );

    return response.data;
  } catch (error) {
    console.error("Failed to update Employee emergency contacts:", error);
    throw error;
  }
};
