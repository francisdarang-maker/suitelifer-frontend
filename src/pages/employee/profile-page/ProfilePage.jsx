// ProfilePage.jsx
import { useState, useEffect, useContext } from "react";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInfo from "./components/PersonalInfo";
import AddressInfo from "./components/AddressInfo";
import ContactInfo from "./components/ContactInfo";
import TabNavigation from "./components/TabNavigation";
import EditProfilePicModal from "./components/modals/EditProfilePicModal";
import EditPersonalDetailsModal from "./components/modals/EditPersonalDetailsModal";
import EditAddressModal from "./components/modals/EditAddressModal";
import EditContactModal from "./components/modals/EditContactModal";
import EditEmergencyContactsModal from "./components/modals/EditEmergencyContactsModal";
import EmploymentInfo from "./components/EmploymentInfo";
import ViewOnlyModal from "./components/modals/ViewOnlyModal";
import {
  useEditEmployeeAddressesAPI,
  useEditEmployeeContactInfoAPI,
  useEditEmployeeEmergencyContactsAPI,
  useEditEmployeePersonalDetailsAPI,
  useEditEmployeePersonalDetailsSuiteliferAPI,
  useFetchEmployeeDetailsAPI,
} from "../hooks/useEmployeeAPI";
import { EmployeeDetailsContext } from "../context/EmployeeDetailsContext";
import { useStore } from "../../../store/authStore";
import Documents from "./components/Documents";
import toast from "react-hot-toast";
import { sanitizeData } from "./utils/sanitizeData";
import { toYMDLocal } from "./utils/dateFormatter";
import { InfoIcon } from "lucide-react";
import api from "../../../utils/axios";
import { formatAddressesPayload } from "./utils/addressFormatter";
import Remittances from "./components/Remittances";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal");
  // const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const userLoggedIn = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  useFetchEmployeeDetailsAPI(userLoggedIn?.id);

  const {
    user: currentUser,
    personalInfo,
    loading,
    emergencyContacts,
  } = useContext(EmployeeDetailsContext);

  const { editEmployeePersonalDetails } = useEditEmployeePersonalDetailsAPI();
  const { editEmployeePersonalDetailsSuitelifer } =
    useEditEmployeePersonalDetailsSuiteliferAPI();
  const { editEmployeeAddresses, loading: addressLoading } =
    useEditEmployeeAddressesAPI();

  const { editEmployeeContactInfo } = useEditEmployeeContactInfoAPI();
  const { editEmployeeEmergencyContacts } =
    useEditEmployeeEmergencyContactsAPI();

  useEffect(() => {
    if (activeModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [activeModal]);

  const handleUpdateUser = (updatedData) => {
    // setCurrentUser((prev) => ({ ...prev, ...updatedData }));
  };

  const handleUpdatePersonalDetails = async (data) => {
    const user_id = currentUser?.user_id;
    if (!user_id) return toast.error("User ID not found.");

    try {
      console.log("user_id: ", user_id);
      console.log("personal details data (raw): ", data);

      const normalize = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === "string") {
          return value.trim().toLowerCase();
        }
        return value;
      };

      const cleanValue = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === "string" && value.trim() === "") return null;
        return value;
      };

      const changedFields = {};

      const fieldMap = {
        first_name: data.firstName,
        middle_name: data.middleName,
        last_name: data.lastName,
        nickname: data.nickname,
        extension_name: data.extensionName,
        sex: data.sex,
        gender: data.gender,
        birthdate: toYMDLocal(data?.birthdate),
        birth_place: data.birthplace,
        nationality: data.nationality,
        civil_status: data.civilStatus,
        height_cm: data.heightCm,
        weight_kg: data.weightKg,
        blood_type: data.bloodType,
      };

      Object.entries(fieldMap).forEach(([key, value]) => {
        const cleaned = cleanValue(value);
        const current = personalInfo?.[key] ?? null;

        if (normalize(cleaned) !== normalize(current)) {
          changedFields[key] = cleaned;
        }
      });

      console.log("Changed fields only: ", changedFields);

      if (Object.keys(changedFields).length === 0) {
        toast("No changes in Personal Info.", {
          icon: <InfoIcon className="w-4 h-4" />,
        });
        return;
      }
      const cleanData = sanitizeData(changedFields);

      const response = await editEmployeePersonalDetailsSuitelifer(
        user_id,
        cleanData
      );
      await editEmployeePersonalDetails(user_id, cleanData);

      console.log("resspooonnssee: ", response);

      if (response?.data?.success && response?.data?.accessToken) {
        const newToken = response.data.accessToken;

        localStorage.setItem("token", newToken);

        setUser({
          ...userLoggedIn,
          first_name: data.firstName,
          last_name: data.lastName,
        });
      }

      toast.success(`Personal Info updated successfully!`);
    } catch (err) {
      toast.error(`Failed to update Personal Details. Please try again.`);
    }
  };

  const handleUpdateProfilePicture = async (profilePic) => {
    const user_id = currentUser?.user_id;
    if (!user_id) return toast.error("User ID not found.");
    let generatedImageUrl;

    try {
      if (profilePic) {
        const formData = new FormData();
        formData.append("file", profilePic);

        const uploadResponse = await api.post(
          "/api/upload-image/profile",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("uploaded response: ", uploadResponse);
        generatedImageUrl = uploadResponse.data.imageUrl;
      }

      console.log("generated image url: ", generatedImageUrl);

      const response = await editEmployeePersonalDetailsSuitelifer(user_id, {
        profile_pic: generatedImageUrl || null,
      });

      await editEmployeePersonalDetails(user_id, {
        user_pic: generatedImageUrl || null,
      });

      console.log("resspooonnssee: ", response);

      if (response?.data?.success && response?.data?.accessToken) {
        const newToken = response.data.accessToken;

        localStorage.setItem("token", newToken);

        setUser({ ...userLoggedIn, profile_pic: generatedImageUrl });
      }

      toast.success("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Encountered an error while uploading. Try again later.");
    }
  };

  const handleUpdateAddresses = async (data) => {
    const user_id = currentUser?.user_id;
    if (!user_id) return toast.error("User ID not found.");

    try {
      console.log("Raw form data:", data);

      const payload = { addresses: data };

      console.log("paylooooad: ", payload);

      const response = await editEmployeeAddresses(user_id, payload);
      console.log("responseeee: ", response);

      toast.success("Addresses updated successfully!");
    } catch (err) {
      console.error(err);

      toast.error(`Failed to update addresses. Please try again.`);
    }
  };

  const handleUpdateContactInfo = async (data) => {
    const user_id = currentUser?.user_id;
    if (!user_id) return toast.error("User ID not found.");

    try {
      console.log("user_id: ", user_id);
      console.log("personal contact info (raw): ", data);

      const normalize = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === "string") {
          return value.trim().toLowerCase();
        }
        return value;
      };

      const cleanValue = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === "string" && value.trim() === "") return null;
        return value;
      };

      const changedFields = {};

      const fieldMap = {
        contact_number: data.contact_number,
        personal_email: data.personal_email,
      };

      Object.entries(fieldMap).forEach(([key, value]) => {
        const cleaned = cleanValue(value);
        const current = personalInfo?.[key] ?? null;

        if (normalize(cleaned) !== normalize(current)) {
          changedFields[key] = cleaned;
        }
      });

      console.log("Changed fields only: ", changedFields);

      if (Object.keys(changedFields).length === 0) {
        toast("No changes in Contact Info.", {
          icon: <InfoIcon className="w-4 h-4" />,
        });
        return;
      }
      const cleanData = sanitizeData(changedFields);

      await editEmployeeContactInfo(user_id, cleanData);

      toast.success(`Contact Info updated successfully!`);
    } catch (err) {
      toast.error(`Failed to update Contact Info. Please try again.`);
    }
  };
  const handleUpdateEmergencyContacts = async (data) => {
    console.log("e-contactssssss: ", data);

    const user_id = currentUser?.user_id;
    if (!user_id) return alert("User ID not found.");

    try {
      const normalize = (value) =>
        (value ?? "").toString().trim().toLowerCase();

      const hasEmptyNameOrNumber = data.emergencyContacts.some(
        (c) =>
          (!normalize(c.full_name) || !normalize(c.contact_number)) &&
          normalize(c.relationship)
      );

      if (hasEmptyNameOrNumber) {
        toast("Some contacts have missing name or number.", {
          icon: <InfoIcon className="w-4 h-4" />,
        });
        return;
      }

      const hasChanges =
        data.emergencyContacts.length !== emergencyContacts.length ||
        data.emergencyContacts.some((newContact, idx) => {
          const oldContact = emergencyContacts[idx] || {};
          return (
            normalize(newContact.full_name) !==
              normalize(oldContact.full_name) ||
            normalize(newContact.contact_number) !==
              normalize(oldContact.contact_number) ||
            normalize(newContact.relationship) !==
              normalize(oldContact.relationship)
          );
        });

      if (!hasChanges) {
        toast("No changes in Emergency Contacts.", {
          icon: <InfoIcon className="w-4 h-4" />,
        });
        return;
      }

      const cleanPayload = {
        emergencyContacts: data.emergencyContacts
          .filter(
            (c) =>
              c.full_name?.trim() &&
              c.contact_number?.trim() &&
              c.relationship?.trim()
          )
          .map((c) => ({
            name: c.full_name.trim(),
            contactNumber: c.contact_number.trim(),
            relationship: c.relationship.trim(),
          })),
      };

      console.log("Clean payload:", cleanPayload);

      const response = await editEmployeeEmergencyContacts(
        user_id,
        cleanPayload
      );
      console.log("responseeee: ", response);

      toast.success(`Emergency Contacts updated successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update Emergency Contacts. Please try again.`);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Details" },
    { id: "address", label: "Address" },
    { id: "contact", label: "Contact Info" },
    { id: "employment", label: "Employment Info" },
    { id: "remittances", label: "Remittances" },
    { id: "documents", label: "Documents" },
  ];

  const modals = {
    profilePic: (
      <EditProfilePicModal
        user={currentUser}
        onSave={handleUpdateProfilePicture}
        onClose={() => setActiveModal(null)}
      />
    ),
    personalDetails: (
      <EditPersonalDetailsModal
        user={currentUser}
        onSave={handleUpdatePersonalDetails}
        onClose={() => setActiveModal(null)}
      />
    ),
    address: (
      <EditAddressModal
        user={currentUser}
        onSave={handleUpdateAddresses}
        onClose={() => setActiveModal(null)}
      />
    ),
    contact: (
      <EditContactModal
        user={currentUser}
        onSave={handleUpdateContactInfo}
        onClose={() => setActiveModal(null)}
      />
    ),
    emergencyContacts: (
      <EditEmergencyContactsModal
        user={currentUser}
        onSave={handleUpdateEmergencyContacts}
        onClose={() => setActiveModal(null)}
      />
    ),
    viewOnlyEmploymentInfo: (
      <ViewOnlyModal
        onClose={() => setActiveModal(null)}
        description="If you think some fields are missing or incorrect, contact Culture and People Team."
      />
    ),
    viewOnlyDocuments: (
      <ViewOnlyModal
        onClose={() => setActiveModal(null)}
        description="If you believe this is not your Google Drive folder or something seems incorrect, please contact the Culture and People Team."
      />
    ),
    viewOnlyRemittances: (
      <ViewOnlyModal
        onClose={() => setActiveModal(null)}
        description="If you think some fields are missing or incorrect, contact Culture and People Team."
      />
    ),
  };

  if (loading) {
    return (
      <>
        <section className="hidden md:block min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="rounded-full bg-gray-200 h-35 w-35"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex gap-5 mt-5 mb-10 items-start w-3/4">
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="my-5 h-6 bg-gray-200 rounded w-2/8"></div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="h-10 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-10 bg-gray-200 rounded w-full mb-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="block md:hidden min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white p-6">
              <div className="animate-pulse">
                <div className="flex flex-col items-center space-x-4 mb-8 mt-0">
                  <div className="relative rounded-full bg-gray-200 h-35 w-35 mb-3"></div>
                  <div className="flex flex-col space-y-3 items-center">
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>

                <div className="flex gap-5 mt-5 mb-10 items-start">
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="my-5 h-6 bg-gray-200 rounded w-2/8"></div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="h-10 bg-gray-200 rounded w-full mb-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!currentUser) {
    return (
      <section className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              No Profile Data Available
            </h2>
            <p className="text-gray-500">
              Please check back later or contact support.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="min-h-screen">
        <div className="max-w-4xl mx-auto ">
          <div className="bg-white overflow-hidden">
            <ProfileHeader
              user={currentUser}
              onEditProfilePic={() => setActiveModal("profilePic")}
            />

            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="p-6">
              {activeTab === "personal" && (
                <PersonalInfo
                  user={currentUser}
                  onEdit={() => setActiveModal("personalDetails")}
                />
              )}
              {activeTab === "address" && (
                <AddressInfo
                  user={currentUser}
                  onEdit={() => setActiveModal("address")}
                />
              )}
              {activeTab === "contact" && (
                <ContactInfo
                  user={currentUser}
                  onEditContact={() => setActiveModal("contact")}
                  onEditEmergencyContacts={() =>
                    setActiveModal("emergencyContacts")
                  }
                />
              )} {activeTab === "remittances" && (
                <Remittances
                  user={currentUser}
                  onOpen={() => setActiveModal("viewOnlyRemittances")}
                />
              )}
              {activeTab === "employment" && (
                <EmploymentInfo
                  user={currentUser}
                  onOpen={() => setActiveModal("viewOnlyEmploymentInfo")}
                />
              )}
              {activeTab === "documents" && (
                <Documents
                  user={currentUser}
                  onOpen={() => setActiveModal("viewOnlyDocuments")}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Render Active Modal */}
      {activeModal && modals[activeModal]}
    </>
  );
};

export default ProfilePage;
