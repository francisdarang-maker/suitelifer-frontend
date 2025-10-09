import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../../store/authStore";
import { ModalLogout } from "../modals/ModalLogout";
import fullsuitelogo from "../../assets/logos/logo-fs-full.svg";
import defaultProfileImg from "../../assets/images/defaultAvatar.svg";
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
  ArrowUpOnSquareIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { useEffect } from "react";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";

const regularFeatures = [
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

// Suitebite features for employees (only Mood and Points Dashboard remain)
const suitebiteFeaturesForEmployees = [
  { feature_name: "The Suite Vibe", path: "mood", icon: FaceSmileIcon },
  {
    feature_name: "Points Dashboard",
    path: "points-dashboard",
    icon: ChartBarIcon,
  },
  { feature_name: "Cheer a Peer", path: "cheer-a-peer", icon: HeartIcon },
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

// const superAdminFeatures = [
//   {
//     feature_name: "Accounts",
//     path: "super/accounts-management",
//     icon: UsersIcon,
//   },
// ];

const CMSNavigation = ({ user, onCollapseChange }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [isCollapse, setCollapse] = useState(
    JSON.parse(localStorage.getItem("isCollapsed")) ?? false
  );
  const [showTool, setShowTool] = useState(
    JSON.parse(localStorage.getItem("showTools")) ?? true
  );
  const [isLoading, setIsLoading] = useState(true);
  // For PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      setIsLoading(true);
      const isCollaped =
        JSON.parse(localStorage.getItem("isCollapsed")) ?? false;
      const showTools = JSON.parse(localStorage.getItem("showTools")) ?? true;
      setCollapse(isCollaped);
      setShowTool(showTools);
      console.log("useeeer: ", user);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleCollapseBtn = () => {
    const newCollapsedState = !isCollapse;
    localStorage.setItem("isCollapsed", newCollapsedState);
    setCollapse(newCollapsedState);

    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  const handleDisclosureBtn = () => {
    const updatedShowTool = !showTool;
    localStorage.setItem("showTools", updatedShowTool);
    setShowTool(updatedShowTool);
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted PWA install");
        } else {
          console.log("User dismissed PWA install");
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  };

  const displayFeatures = (features, prefixPath) => {
    return features.map((service, index) => {
      // If the service has sub-features, render it as a nested disclosure
      if (service.subFeatures) {
        return (
          <li key={index}>
            <Disclosure as="div" defaultOpen={false}>
              <DisclosureButton className="group cursor-pointer flex w-full items-center justify-between p-3 rounded-lg hover:bg-blue-50">
                <div className="flex items-center gap-3">
                  {service ? (
                    <service.icon className="size-4" />
                  ) : (
                    <Square2StackIcon className="size-4" />
                  )}
                  {!isCollapse && (
                    <span className="no-underline! truncate font-avenir-black text-primary">
                      {service.feature_name}
                    </span>
                  )}
                </div>
                {!isCollapse && (
                  <ChevronDownIcon className="size-4 text-primary group-data-[open]:rotate-180" />
                )}
              </DisclosureButton>
              <DisclosurePanel
                className={`${
                  !isCollapse && "ml-6"
                } mt-1 flex flex-col space-y-1`}
              >
                {service.subFeatures.map((subFeature, subIndex) => (
                  <NavLink
                    key={subIndex}
                    to={`${prefixPath}/${subFeature.path}`}
                    className={({ isActive }) =>
                      isActive
                        ? `bg-primary text-white transition-none p-2 rounded-lg flex items-center gap-3 no-underline ${
                            !isCollapse ? "w-full" : "w-min"
                          }`
                        : `bg-white text-primary transition-none p-2 rounded-lg flex items-center gap-3 no-underline hover:bg-blue-50 ${
                            !isCollapse ? "w-full" : "w-min"
                          }`
                    }
                  >
                    {subFeature ? (
                      <subFeature.icon className="size-3 group-hover:hidden" />
                    ) : (
                      <Square2StackIcon className="size-3 group-hover:hidden" />
                    )}
                    {!isCollapse && (
                      <span className="no-underline! truncate text-sm">
                        {subFeature.feature_name}
                      </span>
                    )}
                  </NavLink>
                ))}
              </DisclosurePanel>
            </Disclosure>
          </li>
        );
      }

      // Regular feature without sub-features
      return (
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
          >
            {service ? (
              <service.icon className="size-4 group-hover:hidden" />
            ) : (
              <Square2StackIcon className="size-4 group-hover:hidden" />
            )}
            {!isCollapse && (
              <span className="no-underline! truncate font-avenir-medium !text-sm">
                {service.feature_name}
              </span>
            )}
          </NavLink>
        </li>
      );
    });
  };

  const handleProfilePage = () => {
    navigate("/app/my-profile");
  };

  if (isLoading) return null;

  return (
    <section>
      <nav
        className={`h-dvh flex flex-col transition-all duration-300  ${
          isCollapse ? "w-20" : "w-50"
        }`}
      >
        <ModalLogout
          isOpen={isOpenModal}
          handleClose={() => setIsOpenModal(false)}
        />
        <section className={`relative ${isCollapse ? "mt-8" : "my-5"}`}>
          <section
            className={`${
              isCollapse ? "flex justify-center mb-2" : "absolute top-3 right-0"
            }`}
            onClick={handleCollapseBtn}
          >
            {isCollapse ? (
              <PanelLeftOpen className="w-5 h-5 text-primary stroke-1 cursor-pointer" />
            ) : (
              <PanelRightOpen className="w-5 h-5 text-primary stroke-1 cursor-pointer" />
            )}
          </section>
          <div className="select-none">
            <div
              className={`relative group mt-3 mx-auto mb-3 rounded-full cursor-pointer ${
                isCollapse ? "size-10 ml-4.5 mb-10" : "mb-3 size-20"
              }`}
              onClick={handleProfilePage}
            >
              <span className="absolute inset-0 -z-10 rounded-full bg-primary opacity-70 scale-0 group-hover:scale-125 group-hover:opacity-0 transition-all duration-500" />
              <span className="absolute inset-0 -z-20 rounded-full bg-primary opacity-40 scale-0 group-hover:scale-175 group-hover:opacity-0 transition-all duration-700" />
              <span className="absolute inset-0 -z-30 rounded-full bg-primary opacity-20 scale-0 group-hover:scale-225 group-hover:opacity-0 transition-all duration-1000" />

              <div className="relative rounded-full border border-gray-200 overflow-hidden w-full h-full">
                <img
                  src={user?.profile_pic || defaultProfileImg}
                  alt="profile picture"
                  className="absolute inset-0 w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>

            {!isCollapse && (
              <>
                <p
                  className="font-avenir-black text-center truncate !text-sm cursor-pointer"
                  onClick={handleProfilePage}
                >
                  {`${user?.first_name ?? "Unknown User"}`}
                </p>
                <p className="!text-xs truncate text-center text-primary">
                  {/* {`@${user.email.split("@")[0]}`} */}
                  {`${user?.id ?? ""}`}
                </p>
              </>
            )}
          </div>
        </section>
        <section className=" flex-1 ">
          <ul className="list-none!">
            {displayFeatures(regularFeatures, "/app")}

            {/* Mood and Points features */}

            <Disclosure as="div" defaultOpen={showTool}>
              <DisclosureButton
                className="group cursor-pointer flex w-full items-center justify-between"
                onClick={handleDisclosureBtn}
              >
                {!isCollapse && (
                  <p className="font-avenir-black text-primary p-3 !text-sm">
                    My Pulse
                  </p>
                )}
                <ChevronDownIcon
                  className={`size-5 text-primary  group-data-[open]:rotate-180 ${
                    isCollapse && "ml-2.5"
                  }`}
                />
              </DisclosureButton>
              <DisclosurePanel
                className={`${!isCollapse && "ml-5"} mt-1 flex flex-col`}
              >
                {displayFeatures(suitebiteFeaturesForEmployees, "/app")}
              </DisclosurePanel>
            </Disclosure>

            {(user.role === "ADMIN" || user.role === "SUPER ADMIN") && (
              <Disclosure as="div" defaultOpen={showTool}>
                <DisclosureButton
                  className="group cursor-pointer flex w-full items-center justify-between"
                  onClick={handleDisclosureBtn}
                >
                  {!isCollapse && (
                    <p className="font-avenir-black text-primary p-3 !text-sm">
                      Admin Tools
                    </p>
                  )}
                  <ChevronDownIcon
                    className={`size-5 text-primary  group-data-[open]:rotate-180 ${
                      isCollapse && "ml-2.5"
                    }`}
                  />
                </DisclosureButton>
                <DisclosurePanel
                  className={`${!isCollapse && "ml-5"} mt-1 flex flex-col`}
                >
                  {displayFeatures(
                    user.role === "SUPER ADMIN"
                      ? [
                          // ...superAdminFeatures,
                          ...adminFeatures,
                        ]
                      : adminFeatures,
                    "/app/admin-tools"
                  )}
                </DisclosurePanel>
              </Disclosure>
            )}
          </ul>
        </section>
        <section className={`p-5 py-7 flex flex-col ${!isCollapse && "gap-4"}`}>
          <div
            className={`${
              isCollapse ? "flex justify-center" : "flex justify-between"
            }`}
          >
            {!isCollapse && (
              <img
                src={fullsuitelogo}
                alt="fullsuitelogo"
                className="w-20 h-auto"
              />
            )}
            <div
              className={`flex items-center justify-center gap-2 ${
                isCollapse && "flex-col gap-5"
              }`}
            >
              {showInstallPrompt && (
                <button className="cursor-pointer" onClick={handleInstallClick}>
                  <ArrowDownTrayIcon className="w-5 h-4 text-primary" />
                </button>
              )}{" "}
              <button
                className="cursor-pointer"
                onClick={() => setIsOpenModal(true)}
              >
                <ArrowUpOnSquareIcon className="w-5 h-5 rotate-90 text-primary" />
              </button>
            </div>
          </div>
        </section>
      </nav>
    </section>
  );
};

export default CMSNavigation;
