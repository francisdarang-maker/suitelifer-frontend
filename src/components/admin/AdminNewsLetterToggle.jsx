import NewsArticle from "./NewsArticle";
import Issues from "./Issues";
import PageToggle from "../buttons/PageToggle";
import SuiteLetterLayout01 from "../../assets/images/suiteletter-section-layout-01.png";
import SuiteLetterLayout02 from "../../assets/images/suiteletter-section-layout-02.png";
import SuiteLetterLayout03 from "../../assets/images/suiteletter-section-layout-03.png";
import SuiteLetterLayout04 from "../../assets/images/suiteletter-section-layout-04.png";
import SuiteLetterLayout05 from "../../assets/images/suiteletter-section-layout-05.png";
import SuiteLetterLayout06 from "../../assets/images/suiteletter-section-layout-06.png";
import SuiteLetterLayout07 from "../../assets/images/suiteletter-section-layout-07.png";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import ContentButtons from "./ContentButtons";
import {
  CheckCircleIcon,
  BookmarkSquareIcon,
  InformationCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  MinusCircleIcon,
  RectangleStackIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import emptyIllustration from "../../assets/images/empty-illustration.svg";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popper,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import YearFilterDropDown from "./NewsletterFilter";
import React, { useState, useEffect, useRef, useMemo } from "react";
import api from "../../utils/axios";
import formatTimestamp from "../../utils/formatTimestamp";
import { ArrowLeft, Sparkles, Calendar, FileText, Notebook } from "lucide-react";
import ActionButtons from "../buttons/ActionButtons";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import ContentEditor from "../cms/ContentEditor";
import { useNavigate } from "react-router-dom";
import NewsletterHeader from "../newsletter/NewsletterHeader";
import { useAddAuditLog } from "./UseAddAuditLog";
import ConfirmationDialog from "./ConfirmationDialog";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function AdminNewsLetterToggle() {
  const addLog = useAddAuditLog();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isUnPublishModalOpen, setIsUnPublishModalOpen] = useState(false);
  const [sectionsNewsletterByMonth, setSectionsNewsletterByMonth] = useState([]);
  const user = useStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedMonthlyIssue, setSelectedMonthlyIssue] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(Date.now());
  const [currentPublishedIssue, setCurrentPublishedIssue] = useState({});
  const [oldestIssue, setOldestIssue] = useState({});
  const [issues, setIssues] = useState([]);
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [newslettersByMonth, setNewslettersByMonth] = useState([]);
  const [openIssueDialog, setOpenIssueDialog] = useState(false);
  const [isOpenArticleForm, setIsOpenArticleForm] = useState(false);
  const [prevClickedIssue, setPrevClickedIssue] = useState({});
  const [openSuiteletterLayoutInfoDialog, setOpenSuiteletterLayoutInfoDialog] = useState(false);

  const defaultArticleDetails = {
    newsletterId: "",
    title: "",
    article: "",
    pseudonym: "",
    section: 0,
  };

  const [articleDetails, setArticleDetails] = useState(defaultArticleDetails);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  
  const [selectedYear, setSelectedYear] = useState(currentYear);

  let initMonth = currentMonth + 1;
  let initYear = currentYear;
  if (initMonth > 12) {
    initMonth = 1;
    initYear += 1;
  }

  const [currentIssue, setCurrentIssue] = useState({
    issueId: "",
    month: initMonth,
    year: initYear,
  });

  const yearOptions = useMemo(() => {
    return currentMonth === 12 ? [currentYear, currentYear + 1] : [currentYear];
  }, [currentMonth, currentYear]);

  const monthOptions = useMemo(() => {
    if (currentMonth === 12) {
      if (currentIssue.year === currentYear) return [12];
      if (currentIssue.year === currentYear + 1) return [1];
      return [];
    }
    if (currentIssue.year === currentYear) {
      return Array.from({ length: 12 - currentMonth + 1 }, (_, i) => currentMonth + i);
    }
    if (currentIssue.year > currentYear) {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return [];
  }, [currentIssue.year, currentMonth, currentYear]);

  const handleSaveIssue = async () => {
    if (!currentIssue.month || !currentIssue.year) {
      toast.error("Please select both month and year.");
      return;
    }
    if (currentIssue.month < currentMonth) {
      toast.error("You cannot select a month in the past.");
      return;
    }
    if (currentIssue.year < currentYear) {
      toast.error("You cannot select a year in the past.");
      return;
    }
    if (currentIssue.month > 12 || currentIssue.month < 1) {
      toast.error("Invalid month selected.");
      return;
    }
    if (currentIssue.year < 2000) {
      toast.error("Invalid year selected.");
      return;
    }

    const newIssue = { ...currentIssue, userId: user.id };
    
    try {
      const response = await api.post("/api/issues", newIssue);
      if (response.data?.success) {
        toast.success(response.data.message);
        addLog({
          action: "CREATE",
          description: `New issue for ${getMonthName(currentIssue.month)} ${currentIssue.year} has been created`,
        });
      } else {
        toast.error(response.data.message || "Failed to save issue.");
      }
    } catch (err) {
      if (err.response?.data?.month && err.response?.data?.year) {
        toast.error(`Issue for ${getMonthName(err.response.data.month)} ${err.response.data.year} already exists.`);
        return;
      } else {
        toast.error("An error occurred while saving. Please try again.");
      }
    }

    setSelectedYear(currentIssue.year);
    setUpdateTrigger(Date.now());
    setIsNewestFirst(true);
    setOpenIssueDialog(false);
  };

  const fetchNewsLettersByMonth = async (issueId) => {
    try {
      const response = await api.get("/api/newsletter?issueId=" + issueId);
      const fetchedNewslettersByMonth = response.data.newsletters;
      
      const sortedNewsletters = [...fetchedNewslettersByMonth].sort((a, b) => {
        const aNum = Number(a.section);
        const bNum = Number(b.section);
        const inRange = (n) => n >= 1 && n <= 7;

        if (inRange(aNum) && inRange(bNum)) return aNum - bNum;
        else if (inRange(aNum)) return -1;
        else if (inRange(bNum)) return 1;
        else return aNum - bNum;
      });

      setNewslettersByMonth(sortedNewsletters);

      const sectionsOfThisNewsletter = [
        ...new Set(
          fetchedNewslettersByMonth
            .map((newsletter) => newsletter.section)
            .filter((section) => section !== 0)
        ),
      ];
      setSectionsNewsletterByMonth(sectionsOfThisNewsletter);

      setSelectedMonthlyIssue((prev) => ({
        ...prev,
        articleCount: fetchedNewslettersByMonth.length,
        assigned: fetchedNewslettersByMonth.filter((newsletter) => newsletter.section > 0).length,
        unassigned: fetchedNewslettersByMonth.filter((newsletter) => newsletter.section === 0).length,
      }));

      setIssues((prev) =>
        prev.map((issue) =>
          issue.issueId === issueId
            ? {
                ...issue,
                articleCount: fetchedNewslettersByMonth.length,
                assigned: fetchedNewslettersByMonth.filter((newsletter) => newsletter.section > 0).length,
                unassigned: fetchedNewslettersByMonth.filter((newsletter) => newsletter.section === 0).length,
              }
            : issue
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const gridRef = useRef();

  const fetchIssuesByYear = async (year, isNewestFirst = true) => {
    try {
      const response = await api.get("/api/issues?year=" + year);
      let issues = response.data.issues;
      if (!isNewestFirst) issues = issues.slice().reverse();
      setIssues(issues);
    } catch (err) {
      console.log(err);
    }
  };

  const handleMonthClick = (monthlyIssue) => {
    setSelectedMonthlyIssue(monthlyIssue);
    fetchNewsLettersByMonth(monthlyIssue.issueId);
  };

  const handleAddEditArticle = (e) => {
    setEditingData(null);
    setIsOpenArticleForm(true);
  };

  const handleSortToggle = () => {
    setIsNewestFirst((prev) => !prev);
    fetchIssuesByYear(selectedYear, !isNewestFirst);
  };

  const fetchCurrentIssue = async () => {
    try {
      const response = await api.get("/api/issues/current");
      setCurrentPublishedIssue(response.data.currentIssue);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchOldestIssue = async () => {
    try {
      const response = await api.get("/api/issues/oldest");
      setOldestIssue(response.data.oldestIssue);
    } catch (err) {
      console.log(err);
    }
  };

  function getMonthName(monthNumber) {
    return months[monthNumber - 1];
  }

  useEffect(() => {
    fetchIssuesByYear(selectedYear);
    fetchCurrentIssue();
    fetchOldestIssue();
  }, [selectedYear, updateTrigger]);

  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const refTitle = useRef();
  const refDesc = useRef();

  useEffect(() => {
    if (refTitle.current) {
      refTitle.current.innerHTML = blogTitle;
      refDesc.current.innerHTML = blogDescription;
    }
  }, [blogTitle, blogDescription]);

  const handlePublishIssue = async () => {
    try {
      const response = await api.patch("/api/issues", { issueId: selectedMonthlyIssue.issueId }, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        toast.success(`${getMonthName(selectedMonthlyIssue.month)} ${selectedMonthlyIssue.year} issue published successfully.`);
        setUpdateTrigger(Date.now());
        setSelectedMonthlyIssue(null);
        setIsOpenArticleForm(false);
      } else {
        toast.error(response.data.message || "Failed to publish issue.");
      }
      addLog({
        action: "CREATE",
        description: `${getMonthName(selectedMonthlyIssue.month)} ${selectedMonthlyIssue.year} issue has been published`,
      });
    } catch (error) {
      console.error("Error publishing issue:", error);
      toast.error("An error occurred while publishing the issue. Please try again.");
    }
  };

  const handleUnPublishIssue = async () => {
    try {
      const response = await api.patch("/api/issues/unpublish", { issueId: selectedMonthlyIssue.issueId }, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.data.success) {
        toast.success(`${getMonthName(selectedMonthlyIssue.month)} ${selectedMonthlyIssue.year} issue unpublished successfully.`);
        setUpdateTrigger(Date.now());
        setSelectedMonthlyIssue(null);
        setIsOpenArticleForm(false);
      } else {
        toast.error(response.data.message || "Failed to unpublish issue.");
      }
      addLog({
        action: "UPDATE",
        description: `${getMonthName(selectedMonthlyIssue.month)} ${selectedMonthlyIssue.year} issue has been unpublished`,
      });
    } catch (error) {
      console.error("Error unpublishing issue:", error);
      toast.error("An error occurred while unpublishing the issue. Please try again.");
    }
  };

  const [editingData, setEditingData] = useState(null);

  const handleBackAfterSubmitForm = () => {
    setEditingData(null);
    setUpdateTrigger(Date.now());
    handleMonthClick(prevClickedIssue);
    setIsOpenArticleForm(false);
  };

  const [newsletterDetails, setNewsletterDetails] = useState({});
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  const handleEditClick = (article) => {
    setEditingData(article);
    setIsOpenArticleForm(true);
  };

  const handleDeleteClick = (article) => {
    setNewsletterDetails(article);
    setDeleteModalIsOpen(true);
  };

  const [updateTableTrigger, setUpdateTableTrigger] = useState(Date.now());
  
  useEffect(() => {
    if (updateTableTrigger) {
      fetchNewsLettersByMonth(newsletterDetails.issueId);
    }
  }, [updateTableTrigger]);

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/api/newsletter`, {
        data: {
          newsletterId: newsletterDetails.newsletterId,
          images: newsletterDetails.images,
        },
      });

      addLog({
        action: "DELETE",
        description: `Article "${newsletterDetails.title}" has been deleted`,
      });

      if (response.data.success) {
        toast.success("Article deleted successfully.");
        setUpdateTableTrigger(Date.now());
        setDeleteModalIsOpen(false);
      } else {
        toast.error(response.data.message || "Failed to delete article.");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("An error occurred while deleting the article.");
    }
  };

  const [confirmBackModalOpen, setConfirmBackModalOpen] = useState(false);

  const layoutImages = [
    SuiteLetterLayout01, SuiteLetterLayout02, SuiteLetterLayout03,
    SuiteLetterLayout04, SuiteLetterLayout05, SuiteLetterLayout06,
    SuiteLetterLayout07,
  ];
  const [currentLayoutImagesIndex, setLayoutImagesIndex] = useState(0);

  const handlePrev = () => {
    setLayoutImagesIndex((prev) => (prev === 0 ? layoutImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setLayoutImagesIndex((prev) => (prev === layoutImages.length - 1 ? 0 : prev + 1));
  };

  // Calculate total issues and stats
  const totalIssues = issues.length;
  const publishedIssues = issues.filter(i => i.is_published).length;
  const totalArticles = issues.reduce((sum, i) => sum + (i.articleCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {(!selectedMonthlyIssue || selectedMonthlyIssue.month === undefined) && !isOpenArticleForm ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary rounded-lg shadow-lg">
                  <Notebook className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Newsletter Management
                </h1>
              </div>
              <p className="text-slate-600 ml-14">Create, manage, and publish newsletter issues</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Issues</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalIssues}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <NewspaperIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Published</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{publishedIssues}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Articles</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalArticles}</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Currently Published Issue */}
            {currentPublishedIssue && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Currently Published Issue</h3>
                <div
                  onClick={() => {
                    handleMonthClick(currentPublishedIssue);
                    setPrevClickedIssue(currentPublishedIssue);
                  }}
                  className="bg-primary text-white p-6 rounded-2xl cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1 border border-primary"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-2xl font-bold">
                      {getMonthName(currentPublishedIssue.month)} {currentPublishedIssue.year}
                    </h3>
                    <div className="flex gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <RectangleStackIcon className="h-5 w-5" />
                        <span className="font-medium">{currentPublishedIssue.articleCount} articles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span className="font-medium">{currentPublishedIssue.assigned}/7 assigned</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MinusCircleIcon className="h-5 w-5" />
                        <span className="font-medium">{currentPublishedIssue.unassigned} unassigned</span>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            )}

            {/* All Issues Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900">All Issues</h3>
                  <InformationCircleIcon
                    ref={anchorRef}
                    onClick={() => setOpen((prev) => !prev)}
                    className="w-5 h-5 text-slate-400 cursor-pointer hover:text-blue-600 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
                    <YearFilterDropDown
                      startYear={oldestIssue.year}
                      endYear={currentYear}
                      selectedYear={selectedYear}
                      onYearChange={setSelectedYear}
                    />
                  </div>

                  <button
                    onClick={handleSortToggle}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {isNewestFirst ? <ArrowDownIcon className="h-4 w-4" /> : <ArrowUpIcon className="h-4 w-4" />}
                    {isNewestFirst ? "Newest first" : "Oldest first"}
                  </button>

                  <button
                    onClick={() => {
                      setOpenIssueDialog(true);
                      setCurrentIssue({ issueId: "", month: "", year: "" });
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    Add New Issue
                  </button>
                </div>
              </div>

              {/* Issues Grid */}
              {issues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {issues.map((issue) => (
                    <div
                      key={issue.issueId}
                      onClick={() => {
                        handleMonthClick(issue);
                        setPrevClickedIssue(issue);
                      }}
                      className="group bg-white border-2 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
                      style={{
                        borderColor: issue.is_published
                          ? "#10b981"
                          : issue.assigned >= 7
                          ? "#0097A7"
                          : "#F57C00",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: issue.is_published
                              ? "#10b981"
                              : issue.assigned >= 7
                              ? "#0097A7"
                              : "#F57C00",
                          }}
                        />
                        <h3 className="text-xl font-bold text-slate-900">{getMonthName(issue.month)}</h3>
                        {issue.is_published && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                            Published
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <RectangleStackIcon className="h-4 w-4" />
                          <span>{issue.articleCount} articles</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>{issue.assigned}/7 assigned</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <MinusCircleIcon className="h-4 w-4" />
                          <span>{issue.unassigned} unassigned</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          Created {formatTimestamp(issue.issueCreatedAt).fullDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <img src={emptyIllustration} alt="No issues" className="w-auto h-40 mx-auto mb-6 opacity-50" />
                  <p className="text-slate-600 text-lg font-medium">No issues for {selectedYear}</p>
                  <p className="text-slate-500 text-sm mt-2">Create your first issue to get started</p>
                </div>
              )}
            </div>

            {/* Legend Popper */}
            <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start">
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Paper className="p-4 mt-2 rounded-xl shadow-xl border border-slate-200">
                  <p className="font-bold mb-3 text-sm text-slate-900">LEGEND</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs text-slate-600">Currently Published</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#0097A7]" />
                      <span className="text-xs text-slate-600">Complete/Ready to Publish</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#F57C00]" />
                      <span className="text-xs text-slate-600">In Progress/Incomplete</span>
                    </div>
                  </div>
                </Paper>
              </ClickAwayListener>
            </Popper>

            {/* Add Issue Dialog */}
            <Dialog open={openIssueDialog} onClose={() => {}} fullWidth maxWidth="sm" disableEscapeKeyDown>
              <DialogTitle className="text-xl font-bold">
                {currentIssue.issueId ? "Edit Issue" : "Add New Issue"}
              </DialogTitle>
              <DialogContent>
                <div className="space-y-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Year<span className="text-red-600">*</span>
                    </label>
                    <select
                      value={currentIssue.year}
                      onChange={(e) =>
                        setCurrentIssue({
                          ...currentIssue,
                          year: parseInt(e.target.value),
                          month: "",
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="" hidden>Select year</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Month<span className="text-red-600">*</span>
                    </label>
                    <select
                      value={currentIssue.month}
                      onChange={(e) =>
                        setCurrentIssue({
                          ...currentIssue,
                          month: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="" hidden>Select month</option>
                      {monthOptions.map((monthNumber) => (
                        <option key={monthNumber} value={monthNumber}>
                          {months[monthNumber - 1]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </DialogContent>
              <DialogActions className="p-6">
                <button
                  onClick={() => setOpenIssueDialog(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveIssue}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Save Issue
                </button>
              </DialogActions>
            </Dialog>
          </>
        ) : selectedMonthlyIssue && !isOpenArticleForm ? (
          <>
            {/* Issue Details View */}
            <div className="mb-6">
              <button
                onClick={() => handleMonthClick(null)}
                className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-medium group-hover:underline">Back to all issues</span>
              </button>

              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: selectedMonthlyIssue.is_published
                          ? "#10b981"
                          : selectedMonthlyIssue.assigned >= 7
                          ? "#0097A7"
                          : "#F57C00",
                      }}
                    />
                    <h2 className="text-3xl font-bold text-slate-900">
                      {getMonthName(selectedMonthlyIssue.month)} {selectedMonthlyIssue.year}
                    </h2>
                    {selectedMonthlyIssue.is_published && (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                        Published
                      </span>
                    )}
                    <InformationCircleIcon
                      onClick={() => setOpenSuiteletterLayoutInfoDialog(true)}
                      className="w-5 h-5 text-slate-400 cursor-pointer hover:text-blue-600 transition-colors"
                    />
                  </div>

                  <div className="flex gap-3">
                    {!prevClickedIssue.is_published ? (
                      <button
                        onClick={() => setIsPublishModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                      >
                        <BookmarkSquareIcon className="w-5 h-5" />
                        Publish Issue
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsUnPublishModalOpen(true)}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                      >
                        <BookmarkSquareIcon className="w-5 h-5" />
                        Unpublish Issue
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Articles</p>
                    <p className="text-3xl font-bold text-slate-900">{selectedMonthlyIssue.articleCount}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-sm font-medium text-slate-600 mb-1">Assigned</p>
                    <p className="text-3xl font-bold text-slate-900">{selectedMonthlyIssue.assigned}/7</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                    <p className="text-sm font-medium text-slate-600 mb-1">Unassigned</p>
                    <p className="text-3xl font-bold text-slate-900">{selectedMonthlyIssue.unassigned}</p>
                  </div>
                </div>

                <button
                  onClick={handleAddEditArticle}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  Add New Article
                </button>
              </div>
            </div>

            {/* Articles Cards */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Articles</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {newslettersByMonth.length} article{newslettersByMonth.length !== 1 ? 's' : ''} in this issue
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                      <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">{selectedMonthlyIssue.assigned} Assigned</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100">
                      <MinusCircleIcon className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">{selectedMonthlyIssue.unassigned} Unassigned</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {newslettersByMonth.length > 0 ? (
                  <div className="space-y-4">
                    {newslettersByMonth.map((article, index) => (
                      <div
                        key={article.newsletterId}
                        className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                                  {article.title}
                                </h4>
                                <p className="text-sm text-slate-600 line-clamp-2">
                                  {article.article?.replace(/<[^>]+>/g, "")}
                                </p>
                              </div>
                            </div>
                            
                            {/* Article Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 ml-13">
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">{article.pseudonym || "N/A"}</span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(article.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              
                              <div>
                                {article.section === 0 ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                                    Unassigned
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                    Section {article.section}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(article)}
                              className="p-2.5 hover:bg-blue-50 rounded-lg transition-all group/btn"
                              title="Edit article"
                            >
                              <PencilIcon className="w-5 h-5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(article)}
                              className="p-2.5 hover:bg-red-50 rounded-lg transition-all group/btn"
                              title="Delete article"
                            >
                              <TrashIcon className="w-5 h-5 text-red-600 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium mb-1">No articles yet</p>
                    <p className="text-slate-500 text-sm">Add your first article to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
              open={isPublishModalOpen}
              onClose={() => setIsPublishModalOpen(false)}
              onConfirm={async () => {
                setIsPublishModalOpen(false);
                await handlePublishIssue();
              }}
              title={`Publish ${getMonthName(selectedMonthlyIssue.month)} ${selectedMonthlyIssue.year} issue?`}
              description="This will publish the issue and make it visible to the public. Are you sure you want to proceed?"
              confirmLabel="Publish"
              cancelBtnClass="p-2 px-4 cursor-pointer rounded-lg hover:bg-gray-200 duration-500 text-gray-700"
              confirmBtnClass="p-2 px-4 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 duration-500 text-white"
            />

            <ConfirmationDialog
              open={isUnPublishModalOpen}
              onClose={() => setIsUnPublishModalOpen(false)}
              onConfirm={async () => {
                setIsUnPublishModalOpen(false);
                await handleUnPublishIssue();
              }}
              title={`Unpublish ${getMonthName(selectedMonthlyIssue.month)} ${selectedMonthlyIssue.year} issue?`}
              description="This will unpublish the issue and hide it from the public. Are you sure you want to proceed?"
              confirmLabel="Unpublish"
              cancelBtnClass="p-2 px-4 cursor-pointer rounded-lg hover:bg-gray-200 duration-500 text-gray-700"
              confirmBtnClass="p-2 px-4 cursor-pointer rounded-lg bg-red-700 hover:bg-red-800 duration-500 text-white"
            />

            <ConfirmationDialog
              open={deleteModalIsOpen}
              onClose={() => setDeleteModalIsOpen(false)}
              onConfirm={handleDelete}
              title="Delete this article?"
              description={`"${newsletterDetails.title}" will be permanently deleted. Are you sure you want to proceed?`}
              confirmLabel="Delete"
              cancelBtnClass="p-2 px-4 cursor-pointer rounded-lg hover:bg-gray-200 duration-500 text-gray-700"
              confirmBtnClass="p-2 px-4 cursor-pointer rounded-lg bg-red-700 hover:bg-red-800 duration-500 text-white"
            />
          </>
        ) : (
          <>
            {/* Article Form */}
            <div className="mb-6">
              <button
                onClick={() => setConfirmBackModalOpen(true)}
                className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-medium group-hover:underline">Back to issue</span>
              </button>

              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-slate-900">
                      {!editingData ? "Add New Article" : "Edit Article"}
                    </h2>
                    <InformationCircleIcon
                      onClick={() => setOpenSuiteletterLayoutInfoDialog(true)}
                      className="w-5 h-5 text-slate-400 cursor-pointer hover:text-blue-600 transition-colors"
                    />
                  </div>
                </div>

                <ContentEditor
                  sectionsNewsletterByMonth={sectionsNewsletterByMonth}
                  handleBackAfterSubmitForm={handleBackAfterSubmitForm}
                  editingData={editingData}
                  type="newsletter"
                  issueId={selectedMonthlyIssue.issueId}
                  user={user}
                />
              </div>
            </div>

            <ConfirmationDialog
              open={confirmBackModalOpen}
              onClose={() => setConfirmBackModalOpen(false)}
              onConfirm={async () => {
                await handleMonthClick(prevClickedIssue);
                setIsOpenArticleForm(false);
                setConfirmBackModalOpen(false);
              }}
              title={`Cancel ${editingData ? "editing" : "adding"} this article?`}
              description="This will discard any unsaved changes. Are you sure you want to proceed?"
              confirmLabel="Discard Changes"
              cancelBtnClass="p-2 px-4 cursor-pointer rounded-lg hover:bg-gray-200 duration-500 text-gray-700"
              confirmBtnClass="p-2 px-4 cursor-pointer rounded-lg bg-red-700 hover:bg-red-800 duration-500 text-white"
            />
          </>
        )}

        {/* Layout Info Dialog */}
        <Dialog
          open={openSuiteletterLayoutInfoDialog}
          onClose={() => setOpenSuiteletterLayoutInfoDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle className="text-xl font-bold">
            <div className="flex items-center gap-2">
              <InformationCircleIcon className="w-6 h-6 text-blue-600" />
              Suiteletter Section Layout
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="py-4">
              <p className="text-sm text-slate-600 mb-4">
                Preview the newsletter layout. Articles will appear in the section you assign (1–7).
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    You can't publish the issue until <strong>all 7 sections</strong> have assigned articles.
                    The issue will <strong className="text-red-700">not be visible to the public</strong> until then.
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src={layoutImages[currentLayoutImagesIndex]}
                  alt={`Layout ${currentLayoutImagesIndex + 1}`}
                  className="w-full border border-slate-200 rounded-xl shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium text-slate-700"
                >
                  ← Previous
                </button>
                <span className="text-sm text-slate-600">
                  Layout {currentLayoutImagesIndex + 1} of {layoutImages.length}
                </span>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium text-slate-700"
                >
                  Next →
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default AdminNewsLetterToggle;