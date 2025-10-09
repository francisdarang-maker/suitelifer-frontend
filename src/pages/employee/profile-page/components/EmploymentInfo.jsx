import { EyeIcon } from "@heroicons/react/24/outline";
import InfoField from "./InfoField";

const EmploymentInfo = ({ user, loading, onOpen }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatTo12Hour = (timeString) => {
    if (!timeString) return "---";
    const [hourStr, minuteStr] = timeString.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12; // convert 0–23 → 12-hour format
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm font-avenir-black text-gray-900">
          Company-issued Contact Information
        </p>
        <div
          className="flex items-center sm:space-x-2 sm:px-4 py-2 text-sm font-medium text-gray-500 bg-white sm:border sm:border-gray-300 sm:rounded-lg sm:hover:bg-gray-50 transition-colors"
          onClick={onOpen}
        >
          <EyeIcon className="w-4 h-4" />

          <span className="hidden sm:block">View only</span>
        </div>
      </div>

      {/* Single grid, order preserved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField type="email" label="Company Email" value={user?.user_email} />
        <InfoField
        type="phone"
          label="Company Phone Number"
          value={user?.HrisUserInfo?.company_issued_phone_number}
        />
      </div>

      <div className="mt-10 mb-3">
        <p className="text-sm font-avenir-black text-gray-900">Designation</p>
      </div>

      {/* Single grid, order preserved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField
          label="Office"
          value={user?.HrisUserDesignations?.[0]?.CompanyOffice?.office_name}
        />
        <InfoField
          label="Division"
          value={
            user?.HrisUserDesignations?.[0]?.CompanyDivision?.division_name
          }
        />
        <InfoField
          label="Department"
          value={
            user?.HrisUserDesignations?.[0]?.CompanyDepartment?.department_name
          }
        />
        <InfoField
          label="Team"
          value={user?.HrisUserDesignations?.[0]?.CompanyTeam?.team_name}
        />
        <InfoField
          label="Job Position"
          value={user?.HrisUserDesignations?.[0]?.CompanyJobTitle?.job_title}
        />
        <InfoField
          label="Job Level"
          value={user?.HrisUserEmploymentInfo?.HrisUserJobLevel?.job_level_name}
        />
        <InfoField
          label="Employee Type"
          value={
            user?.HrisUserEmploymentInfo?.HrisUserEmploymentType
              ?.employment_type
          }
        />
        <InfoField
          label="Shift"
          value={`${
            user?.HrisUserEmploymentInfo?.HrisUserShiftsTemplate?.shift_name
          } (${formatTo12Hour(
            user?.HrisUserEmploymentInfo?.HrisUserShiftsTemplate?.start_time
          )} 
- 
${formatTo12Hour(
  user?.HrisUserEmploymentInfo?.HrisUserShiftsTemplate?.end_time
)})`}
        />
        <InfoField
          label="Immediate Supervisor"
          value={`${user?.HrisUserDesignations?.[0]?.upline?.HrisUserInfo?.first_name} ${user?.HrisUserDesignations?.[0]?.upline?.HrisUserInfo?.last_name}`}
        />
      </div>

      <div className="mt-10 mb-3">
        <p className="text-sm font-avenir-black text-gray-900">
          Salary Information
        </p>
      </div>

      {/* Single grid, order preserved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField label="Base Pay" value={user?.HrisUserSalary?.base_pay} />
        <InfoField
          label="Type"
          value={
            user?.HrisUserSalary?.HrisUserSalaryAdjustmentType
              ?.salary_adjustment_type
          }
        />
      </div>

      <div className="mt-10 mb-3">
        <p className="text-sm font-avenir-black text-gray-900">
          Employment Timeline
        </p>
      </div>

      {/* Single grid, order preserved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField
          label="Date Hired"
          value={user?.HrisUserEmploymentInfo?.date_hired}
        />
        <InfoField
          label="Date Regularized"
          value={user?.HrisUserEmploymentInfo?.date_regularization}
        />
        <InfoField
          label="Date Offboarded"
          value={user?.HrisUserEmploymentInfo?.date_offboarding}
        />
        <InfoField
          label="Date Separated"
          value={user?.HrisUserEmploymentInfo?.date_separated}
        />
      </div>
    </div>
  );
};

export default EmploymentInfo;
