import { useState } from "react";
import logoFull from "../../assets/logos/logo-fs-full.svg";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { NavLink, useNavigate } from "react-router-dom";
import {
  NewspaperIcon,
  CalendarIcon,
  Bars3BottomLeftIcon,
  Square2StackIcon,
  ClipboardIcon,
  ArrowPathRoundedSquareIcon,
  ChevronDownIcon,
  BookOpenIcon,
  FaceSmileIcon,
  TableCellsIcon,
  ChartBarIcon,
  HeartIcon,
  ShoppingBagIcon,
  ClipboardDocumentIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";
import { ModalLogout } from "../modals/ModalLogout";
import { useStore } from "../../store/authStore";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import defaultProfileImg from "../../assets/images/defaultAvatar.svg";

const regularServices = [
  { feature_name: "Blogs Feed", path: "blogs-feed", icon: NewspaperIcon },
  { feature_name: "My Blogs", path: "my-blogs", icon: ClipboardIcon },
  {
    feature_name: "Threads",
    path: "threads",
    icon: ArrowPathRoundedSquareIcon,
  },
  { feature_name: "Events", path: "company-events", icon: CalendarIcon },
  { feature_name: "Courses", path: "courses", icon: BookOpenIcon },
  {
    feature_name: "Personality Test",
    path: "personality-test",
    icon: ClipboardDocumentIcon,
  },
];

const suitebiteFeaturesForMobile = [
  { feature_name: "Mood", path: "mood", icon: FaceSmileIcon },
  {
    feature_name: "Points Dashboard",
    path: "points-dashboard",
    icon: ChartBarIcon,
  },
  {
    feature_name: "Cheer a Peer",
    path: "cheer-a-peer",
    icon: HeartIcon,
  },
  {
    feature_name: "The Gift Suite",
    path: "suitebite/shop",
    icon: ShoppingBagIcon,
  },
];

const adminFeatures = [
  { feature_name: "Content", path: "contents", icon: Bars3BottomLeftIcon },
  { feature_name: "Events", path: "events", icon: CalendarIcon },
  { feature_name: "The Gift Suite", path: "suitebite", icon: ShoppingBagIcon },
  { feature_name: "Courses", path: "courses", icon: BookOpenIcon },
  {
    feature_name: "Personality Test",
    path: "personality-test",
    icon: ClipboardDocumentIcon,
  },
  {
    feature_name: "Audit Logs",
    path: "audit-logs",
    icon: TableCellsIcon,
  },
];

const EmployeeDrawer = ({ onClose, user }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isCollapse, setCollapse] = useState(false);
  const [showTool, setShowTool] = useState(
    JSON.parse(localStorage.getItem("showTools")) ?? true
  );
  const navigate = useNavigate();

  const handleProfilePage = () => {
    navigate("/app/my-profile");
  };

  const handleDisclosureBtn = () => {
    const updatedShowTool = !showTool;
    localStorage.setItem("showTools", updatedShowTool);
    setShowTool(updatedShowTool);
  };

  const handleClose = () => {
    if (onClose) {
      onClose("-100%");
    }
  };

  const displayFeatures = (features, prefixPath) => {
    return features.map((service, index) => (
      <li key={index}>
        <NavLink
          to={`${prefixPath}/${service.path}`}
          className={({ isActive }) =>
            isActive
              ? `bg-primary text-white transition-none p-3 rounded-lg flex items-center gap-3 no-underline ${
                  !isCollapse ? "w-full" : "w-min"
                }`
              : `bg-white text-primary transition-none p-3 rounded-lg flex items-center gap-3 no-underline hover:bg-blue-50 ${
                  !isCollapse ? "w-full" : "w-min"
                }`
          }
          onClick={handleClose}
        >
          <service.icon className="size-4 group-hover:hidden" />
          {!isCollapse && (
            <span className="truncate font-avenir-medium text-sm">
              {service.feature_name}
            </span>
          )}
        </NavLink>
      </li>
    ));
  };

  return (
    <nav className="lg:hidden relative h-screen flex flex-col">
      <ModalLogout
        isOpen={isOpenModal}
        handleClose={() => setIsOpenModal(false)}
      />

      {/* HEADER (fixed, non-scrollable) */}
      <section className="flex justify-between items-center pt-5 pb-3  border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="w-20 h-auto">
          <img src={logoFull} alt="fullsuite" className="w-full h-full" />
        </div>

        <div
          className="flex w-9 h-9 rounded-full justify-center items-center cursor-pointer text-primary
        hover:bg-gray-100"
        >
          <XMarkIcon
            className="!w-6 !h-6  rounded-full"
            onClick={handleClose}
          />
        </div>
      </section>

      {/* SCROLLABLE CONTENT */}
      <section className="flex-1 overflow-y-auto pr-4 pb-24">
        <ul className="space-y-1 mt-3 !list-none">
          {/* Regular Services */}
          {regularServices.map((service, index) => (
            <li key={index}>
              <NavLink
                to={`/app/${service.path}`}
                className={({ isActive }) =>
                  isActive
                    ? "bg-primary text-white transition-none p-3 rounded-lg flex items-center gap-3 no-underline"
                    : "bg-white text-primary transition-none p-3 rounded-lg flex items-center gap-3 no-underline hover:bg-blue-50"
                }
                onClick={handleClose}
              >
                <service.icon className="size-4" />
                <span className="truncate font-avenir-medium text-sm ">
                  {service.feature_name}
                </span>
              </NavLink>
            </li>
          ))}

          {/* My Pulse (Suitebite) */}
          <Disclosure as="div" defaultOpen={true}>
            {({ open }) => (
              <>
                <DisclosureButton className="group flex w-full justify-between items-center p-3 cursor-pointer">
                  <p className="font-avenir-black text-primary text-sm">
                    My Pulse
                  </p>
                  <ChevronDownIcon
                    className={`size-5 text-primary transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </DisclosureButton>

                <DisclosurePanel className="ml-3 flex flex-col space-y-1">
                  {suitebiteFeaturesForMobile.map((feature, index) => (
                    <NavLink
                      key={index}
                      to={`/app/${feature.path}`}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-white p-3 rounded-lg flex items-center gap-3 no-underline"
                          : "bg-white text-primary p-3 rounded-lg flex items-center gap-3 no-underline hover:bg-blue-50"
                      }
                      onClick={handleClose}
                    >
                      <feature.icon className="size-4" />
                      <span className="truncate font-avenir-medium text-sm">
                        {feature.feature_name}
                      </span>
                    </NavLink>
                  ))}
                </DisclosurePanel>
              </>
            )}
          </Disclosure>

          {/* Admin Tools */}
          {(user.role === "ADMIN" || user.role === "SUPER ADMIN") && (
            <Disclosure as="div" defaultOpen={showTool}>
              <DisclosureButton
                className="group flex w-full justify-between items-center p-3 cursor-pointer"
                onClick={handleDisclosureBtn}
              >
                <p className="font-avenir-black text-primary text-sm">
                  Admin Tools
                </p>
                <ChevronDownIcon
                  className={`size-5 text-primary transition-transform duration-200 ${
                    showTool ? "rotate-180" : ""
                  }`}
                />
              </DisclosureButton>
              <DisclosurePanel className="ml-3 flex flex-col space-y-1">
                {displayFeatures(adminFeatures, "/app/admin-tools")}
              </DisclosurePanel>
            </Disclosure>
          )}
        </ul>
      </section>

      {/* FIXED LOGOUT BUTTON */}
      <section className="mt-auto p-5 bg-white flex justify-between items-center border-t border-gray-200 text-sm">
        {/* Profile section */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            handleProfilePage();
            handleClose();
          }}
        >
          <img
            src={user?.profile_pic || defaultProfileImg}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <span className="text-gray-700 font-medium">
            {user?.first_name
              ? user.first_name.length > 20
                ? user.first_name.slice(0, 20) + "…"
                : user.first_name
              : "User"}
          </span>
        </div>

        {/* Logout section */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setIsOpenModal(true);
            handleClose();
          }}
        >
          <ArrowUpOnSquareIcon className="w-5 h-5 rotate-90 text-primary" />
        </div>
      </section>
    </nav>
  );
};

export default EmployeeDrawer;
