import { createContext, useState } from "react";

export const EmployeeDetailsContext = createContext();

export const EmployeeDetailsProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [employmentInfo, setEmploymentInfo] = useState(null);
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [hr201, setHr201] = useState(null);
  const [governmentIds, setGovernmentIds] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    personalInfo,
    setPersonalInfo,
    designations,
    setDesignations,
    employmentInfo,
    setEmploymentInfo,
    salaryInfo,
    setSalaryInfo,
    hr201,
    setHr201,
    governmentIds,
    setGovernmentIds,
    addresses,
    setAddresses,
    emergencyContacts,
    setEmergencyContacts,
    jobDetails,
    setJobDetails,
    notFound,
    setNotFound,
  };

  return (
    <EmployeeDetailsContext.Provider value={value}>
      {children}
    </EmployeeDetailsContext.Provider>
  );
};
