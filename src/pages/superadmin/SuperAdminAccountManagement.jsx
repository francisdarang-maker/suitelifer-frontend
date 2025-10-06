import React, { useRef, useMemo, useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import api from "../../utils/axios";
import ModalUserManagement from "../../components/modals/ModalUserManagement";
import toast from "react-hot-toast";
import formatTimestamp from "../../utils/formatTimestamp";
import {
  UsersIcon,
  ShieldCheckIcon,
  ClockIcon,
  IdentificationIcon,
  CheckBadgeIcon,
  XMarkIcon,
  StarIcon,
  UserCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { useStore } from "../../store/authStore";
import { useAddAuditLog } from "../../components/admin/UseAddAuditLog";
import "./SuperAdminAccountManagement.css";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const SuperAdminAccountManagement = () => {
  const addLog = useAddAuditLog();
  const gridRef = useRef(null);
  const user = useStore((state) => state.user);

  const getRoleIcon = (userType) => {
    switch (userType) {
      case "SUPER ADMIN":
        return { icon: StarIcon, gradient: "from-[#0097B2] to-[#00B8D4]" };
      case "ADMIN":
        return { icon: ShieldCheckIcon, gradient: "from-[#0097B2] to-[#0081A7]" };
      case "EMPLOYEE":
        return { icon: IdentificationIcon, gradient: "from-gray-400 to-gray-500" };
      default:
        return { icon: IdentificationIcon, gradient: "from-gray-400 to-gray-500" };
    }
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: "USER",
        flex: 2.5,
        field: "fullName",
        cellRenderer: (params) => {
          const roleInfo = getRoleIcon(params.data.userType);
          const RoleIcon = roleInfo.icon;

          return (
            <div className="flex items-center gap-3 py-2">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleInfo.gradient} flex items-center justify-center text-white shadow-md`}
              >
                <RoleIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">
                  {params.data.fullName}
                </span>
                <span className="text-xs text-gray-500">
                  {params.data.userEmail}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: "STATUS",
        field: "isVerified",
        flex: 1.2,
        cellRenderer: (params) => {
          const isVerified = params.data.isVerified === 1;

          return (
            <div className="flex flex-col gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                  isVerified
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {isVerified ? (
                  <>
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Verified
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-3.5 h-3.5" />
                    Pending
                  </>
                )}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "ROLE",
        field: "userType",
        flex: 1.5,
        cellRenderer: (params) => (
          <select
            id={params.data.userId}
            value={params.data.userType}
            onChange={(e) => confirmTypeChange(params.data, e.target.value)}
            className="w-full px-4 py-2 text-sm font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-white hover:border-gray-300 transition-all cursor-pointer shadow-sm"
          >
            <option
              value="SUPER ADMIN"
              disabled={user.email !== "infosec@fullsuite.ph"}
            >
              Super Admin
            </option>
            <option
              value="ADMIN"
              disabled={
                user.email === "infosec@fullsuite.ph"
                  ? false
                  : params.data.userType === "SUPER ADMIN"
              }
            >
              Admin
            </option>
            <option
              value="EMPLOYEE"
              disabled={
                user.email === "infosec@fullsuite.ph"
                  ? false
                  : params.data.userType === "SUPER ADMIN"
              }
            >
              Employee
            </option>
          </select>
        ),
      },
      {
        headerName: "ACCOUNT STATUS",
        field: "isActive",
        flex: 1.5,
        cellRenderer: (params) => (
          <select
            value={params.data.isActive}
            onChange={(e) => confirmStatusChange(params.data, e.target.value)}
            className={`w-full px-4 py-2 text-sm font-medium border-2 rounded-xl focus:ring-2 focus:border-transparent bg-white transition-all cursor-pointer shadow-sm ${
              params.data.isActive === 1
                ? "border-emerald-200 text-emerald-700 focus:ring-emerald-500 hover:border-emerald-300"
                : "border-red-200 text-red-700 focus:ring-red-500 hover:border-red-300"
            }`}
          >
            <option value={1}>✓ Active</option>
            <option value={0}>✕ Disabled</option>
          </select>
        ),
      },
      {
        headerName: "JOINED",
        flex: 1.5,
        field: "createdAt",
        cellRenderer: (params) => {
          const date = formatTimestamp(params.data.createdAt).fullDate;
          return (
            <div className="flex items-center gap-2 text-gray-600">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{date}</span>
            </div>
          );
        },
      },
    ],
    [user.email]
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: false,
    }),
    []
  );

  const [userAccounts, setUserAccounts] = useState([]);

  const fetchUserAccounts = async () => {
    try {
      const response = await api.get("api/users");
      setUserAccounts(response.data.users);
    } catch (err) {
      console.log("Unable to fetch User Accounts", err);
    }
  };

  const confirmTypeChange = (data, value) => {
    if (data.userType === value) return;

    let title, message;

    if (data.userType === "EMPLOYEE" && value === "ADMIN") {
      title = `Make ${data.fullName} as an ${value}?`;
      message =
        "This grants the user access to content management features. Their role can be changed later if needed.";
    } else {
      title = `Change ${data.fullName}'s role to ${value}?`;
      message =
        "This removes the user's access to content management features. Their admin privileges can be reassigned at any time.";
    }

    modal.onConfirm = () => {
      addLog({
        action: "UPDATE",
        description: `${data.fullName}'s role has been updated from ${data.userType} to ${value}`,
      });
      handleTypeChange(value, data.userId);
    };

    setModal((m) => ({ ...m, isOpen: true, title, message }));
  };

  const handleTypeChange = async (userType, accountId) => {
    try {
      const response = await api.patch("/api/users/type", {
        userType,
        accountId,
      });
      if (response.status === 200) toast.success("Role Updated Successfully");
    } catch (err) {
      console.log("Unable to Update User Type", err);
    } finally {
      window.location.reload();
      setModal((m) => defaultModalDetails);
    }
  };

  const confirmStatusChange = (data, value) => {
    if (data.isActive === Number(value)) return;

    let title, message;

    if (data.isActive === 1 && Number(value) === 0) {
      title = `Disable ${data.fullName}'s account?`;
      message =
        "This prevents the user from accessing the system. The account can be reactivated later if needed.";
    } else {
      title = `Reactivate ${data.fullName}'s account?`;
      message =
        "This restores the user's access to the system. The account can be disabled again at any time.";
    }

    modal.onConfirm = () => {
      addLog({
        action: "UPDATE",
        description: `${data.fullName}'s account has been ${
          data.isActive === 1 && Number(value) === 0
            ? "disabled"
            : "reactivated"
        }`,
      });
      handleStatusChange(Number(value), data.userId);
    };

    setModal((m) => ({ ...m, isOpen: true, title, message }));
  };

  const handleStatusChange = async (isActive, accountId) => {
    try {
      const response = await api.patch("/api/users/status", {
        isActive,
        accountId,
      });
      if (response.status === 200) toast.success("Status Updated Successfully");
    } catch (err) {
      console.log("Unable to Update Status", err);
    } finally {
      window.location.reload();
      setModal((m) => defaultModalDetails);
    }
  };

  const handleClose = () => setModal(defaultModalDetails);

  const defaultModalDetails = {
    isOpen: false,
    isDelete: false,
    title: "",
    message: "",
  };

  const [modal, setModal] = useState(defaultModalDetails);

  useEffect(() => {
    fetchUserAccounts();
  }, []);

  const statsCards = [
    {
      label: "Total Users",
      value: userAccounts.length,
      icon: UsersIcon,
      gradient: "from-[#0097B2] via-[#00B8D4] to-[#00D4E8]",
      bgGradient: "from-[#E6F7FA] to-[#CCF0F5]",
    },
    {
      label: "Verified",
      value: userAccounts.filter((account) => account.isVerified).length,
      icon: CheckBadgeIcon,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 to-green-50",
    },
    {
      label: "Pending",
      value: userAccounts.filter((account) => !account.isVerified).length,
      icon: ClockIcon,
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
      bgGradient: "from-amber-50 to-orange-50",
    },
    {
      label: "Active",
      value: userAccounts.filter((account) => account.isActive).length,
      icon: CheckCircleIcon,
      gradient: "from-[#0097B2] via-[#00AAC7] to-[#00BED8]",
      bgGradient: "from-[#E6F7FA] to-[#D9F3F7]",
    },
    {
      label: "Disabled",
      value: userAccounts.filter((account) => !account.isActive).length,
      icon: XMarkIcon,
      gradient: "from-rose-500 via-red-500 to-pink-500",
      bgGradient: "from-rose-50 to-red-50",
    },
    {
      label: "Admins",
      value: userAccounts.filter((account) => account.userType === "ADMIN")
        .length,
      icon: ShieldCheckIcon,
      gradient: "from-[#006B85] via-[#0081A7] to-[#0097B2]",
      bgGradient: "from-[#D9F3F7] to-[#CCF0F5]",
    },
    {
      label: "Employees",
      value: userAccounts.filter((account) => account.userType === "EMPLOYEE")
        .length,
      icon: UserCircleIcon,
      gradient: "from-slate-500 via-gray-500 to-zinc-500",
      bgGradient: "from-slate-50 to-gray-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <UsersIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Account Management
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl rounded-2xl p-6 border border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden`}
              >
                <div className="relative z-10">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p
                      className={`text-3xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Section */}
      <div className="px-8 pb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  User Directory
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {userAccounts.length} registered users in the system
                </p>
              </div>
            </div>
          </div>

          {/* AG Grid */}
          <div className="ag-theme-quartz p-6">
            <AgGridReact
              ref={gridRef}
              rowData={userAccounts}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={15}
              domLayout="autoHeight"
              paginationPageSizeSelector={[15, 25, 50]}
              rowHeight={70}
              getRowClass={(params) =>
                params.data && params.data.userEmail === user.email
                  ? "superadmin-current-user-row"
                  : ""
              }
            />
          </div>
        </div>
      </div>

      <ModalUserManagement
        isOpen={modal.isOpen}
        isDelete={modal.isDelete}
        onConfirm={modal.onConfirm}
        onClose={handleClose}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};

export default SuperAdminAccountManagement;