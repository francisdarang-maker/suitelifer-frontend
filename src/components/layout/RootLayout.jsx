import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeAside from "../../components/employee/EmployeeAside";
import logoFull from "../../assets/logos/logo-fs-full.svg";
import { Bars2Icon } from "@heroicons/react/20/solid";
import EmployeeDrawer from "../../components/employee/EmployeeDrawer";
import CMSNavigation from "../navigation/CMSNavigation";
import CMSTopNavigation from "../navigation/CMSTopNavigation";
import { useStore } from "../../store/authStore";

const RootLayout = () => {
  const drawerRef = useRef();
  const user = useStore((state) => state.user);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleDrawer = (location) => {
    drawerRef.current.style.top = location;
  };

  const handleSidebarCollapse = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

return (
  <section className="flex flex-col lg:flex-row h-screen gap-4 max-w-[1800px] mx-auto px-4 lg:px-0 overflow-hidden">
    {/* Drawer (mobile) */}
    <section
      className="px-6 bg-white fixed -top-full left-0 right-0 z-50 transition-all duration-300"
      ref={drawerRef}
    >
      <EmployeeDrawer onClose={handleDrawer} user={user} />
    </section>

    {/* Left Sidebar - Made smaller */}
    <section
      className={` 
        hidden lg:block overflow-y-auto transition-all duration-300 
        ${isSidebarCollapsed ? "w-16 flex-shrink-0" : "w-[210px] flex-shrink-0"}
      `}
    >
      <CMSNavigation user={user} onCollapseChange={handleSidebarCollapse} />
    </section>

    {/* Top bar (mobile only) */}
    <section className="lg:hidden flex justify-between pt-5 px-2">
      <div className="w-20 h-auto">
        <img src={logoFull} alt="fullsuite" className="w-full h-full" />
      </div>
      <Bars2Icon
        className="w-9 h-9 rounded-full p-2 text-primary cursor-pointer hover:bg-gray-100"
        onClick={() => handleDrawer("0%")}
      />
    </section>

    {/* Main Content */}
    <section
      className={`
        flex-1 h-screen flex flex-col min-w-0 transition-all duration-300
        ${isSidebarCollapsed ? "lg:ml-0" : ""}
      `}
    >
      <CMSTopNavigation />
      <main className="flex-1 min-h-0 overflow-y-auto w-full">
        <Outlet />
      </main>
    </section>

    {/* Right Sidebar - Kept at 300px */}
    <section className="hidden lg:flex-shrink-0 lg:block lg:w-[300px] overflow-y-auto">
      <EmployeeAside />
    </section>
  </section>
);
};

export default RootLayout;
