"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import ContentButtons from "./ContentButtons";
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/axios";

import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import ActionButtons from "../buttons/ActionButtons";
import { useAddAuditLog } from "../../components/admin/UseAddAuditLog";
import { ModalDeleteConfirmation } from "../modals/ModalDeleteConfirmation";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function FAQs() {
  const user = useStore((state) => state.user);

  //Audit Log
  const addLog = useAddAuditLog();

  const [faqs, setFaqs] = useState([]);

  const fetchFaqs = async () => {
    try {
      const response = await api.get("/api/get-all-faqs");
      const fetchedFaqs = response.data.faqs;
      setFaqs(fetchedFaqs);
    } catch (err) {
      console.log("Unable to fetch FAQs", err);
    }
  };

  const [dataUpdated, setDataUpdated] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, [dataUpdated]);

  const [openDialog, setOpenDialog] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState({
    faq_id: "",
    question: "",
    answer: "",
    is_shown: 1,
    createdAt: "",
    createdBy: "",
  });

  const gridRef = useRef();

  const handleSave = async () => {
    // Validation
    if (!currentFAQ.question.trim() || !currentFAQ.answer.trim()) {
      toast.error("Question and Answer are required");
      return;
    }

    if (currentFAQ.is_shown === "" || currentFAQ.is_shown === undefined) {
      toast.error("Please select visibility");
      return;
    }

    try {
      if (currentFAQ.faq_id) {
        // Update existing FAQ
        const response = await api.post("/api/edit-faq", {
          ...currentFAQ,
          user_id: user.id,
        });

        if (response.data?.success) {
          toast.success(response.data.message);
          
          //Log
          addLog({
            action: "UPDATE",
            description: `FAQ (${currentFAQ.question}) has been updated`,
          });

          setDataUpdated(!dataUpdated);
        } else {
          toast.error(response.data.message || "Failed to update FAQ.");
        }
      } else {
        // Add new FAQ
        const newFaq = {
          ...currentFAQ,
          user_id: user.id,
        };
        
        const response = await api.post("/api/add-faq", newFaq);

        if (response.data?.success) {
          toast.success(response.data.message);
          
          //Log
          addLog({
            action: "CREATE",
            description: `A new FAQ (${newFaq.question}) has been added`,
          });

          setDataUpdated(!dataUpdated);
        } else {
          toast.error(response.data.message || "Failed to save FAQ.");
        }
      }

      setCurrentFAQ({ faq_id: "", question: "", answer: "", is_shown: 1 });
      setOpenDialog(false);
    } catch (err) {
      console.error(err.message);
      toast.error("An error occurred while saving the FAQ");
    }
  };

  const handleEdit = (faq) => {
    setCurrentFAQ(faq);
    setOpenDialog(true);
  };

  const handleDeleteClick = (faq_id, question) => {
    setCurrentFAQ({ faq_id, question });
    setDeleteModalOpen(true);
  };

  const handleDelete = async (faq_id, q) => {
    try {
      await api.post("/api/delete-faq", { faq_id });

      //Log
      addLog({
        action: "DELETE",
        description: `FAQ (${q}) has been deleted`,
      });
      
      toast.success("FAQ deleted successfully");
      setDataUpdated((prev) => !prev);
      setDeleteModalOpen(false);
      setCurrentFAQ({ faq_id: "", question: "", answer: "", is_shown: 1 });
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to delete FAQ");
    }
  };

  const handleFaqDetailsChange = (e) => {
    const { name, value } = e.target;
    setCurrentFAQ((prev) => ({ 
      ...prev, 
      [name]: name === 'is_shown' ? parseInt(value) : value 
    }));
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-2">
        <ContentButtons
          icon={<PlusCircleIcon className="size-5" />}
          text="Add FAQ"
          handleClick={() => {
            setOpenDialog(true);
            setCurrentFAQ({ faq_id: "", question: "", answer: "", is_shown: 1 });
          }}
        />
      </div>

      <div
        className="ag-theme-quartz min-w-[600px] lg:w-full"
        style={{ height: "500px", width: "100%" }}
      >
        <AgGridReact
          enableBrowserTooltips={true}
          ref={gridRef}
          rowData={faqs}
          columnDefs={[
            {
              headerName: "Question",
              field: "question",
              flex: 3,
              tooltipField: "question",
              headerClass: "text-primary font-bold bg-gray-100",
              cellStyle: {
                whiteSpace: "normal",
                lineHeight: "1.5",
              },
              autoHeight: true,
            },
            {
              headerName: "Answer",
              field: "answer",
              flex: 4,
              headerClass: "text-primary font-bold bg-gray-100",
              tooltipField: "answer",
              cellStyle: {
                whiteSpace: "normal",
                lineHeight: "1.5",
                padding: "10px",
              },
              autoHeight: true,
              cellRenderer: (params) => {
                return (
                  <div 
                    style={{ 
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      lineHeight: "1.5",
                    }}
                  >
                    {params.value}
                  </div>
                );
              },
            },
            {
              headerName: "Visibility",
              field: "is_shown",
              flex: 1,
              headerClass: "text-primary font-bold bg-gray-100",
              cellRenderer: (params) => {
                const isShown = params.value === 1;
                return (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isShown
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isShown ? "Shown" : "Hidden"}
                  </span>
                );
              },
            },
            {
              headerName: "Date Created",
              field: "createdAt",
              flex: 2,
              headerClass: "text-primary font-bold bg-gray-100",
              valueGetter: (params) =>
                params.data?.created_at
                  ? new Date(params.data.created_at).toLocaleString()
                  : "N/A",
            },
            {
              headerName: "Created By",
              field: "createdBy",
              flex: 2,
              headerClass: "text-primary font-bold bg-gray-100",
            },
            {
              headerName: "Action",
              field: "action",
              flex: 1,
              headerClass: "text-primary font-bold bg-gray-100",
              cellRenderer: (params) => (
                <div className="flex gap-1">
                  <ActionButtons
                    icon={<PencilIcon className="size-5 cursor-pointer" />}
                    handleClick={() => handleEdit(params.data)}
                  />
                  <ActionButtons
                    icon={<TrashIcon className="size-5 cursor-pointer" />}
                    handleClick={() =>
                      handleDeleteClick(
                        params.data.faq_id,
                        params.data.question
                      )
                    }
                  />
                </div>
              ),
            },
          ]}
          defaultColDef={{
            filter: "agTextColumnFilter",
            floatingFilter: true,
            sortable: true,
            cellStyle: {
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            },
          }}
          pagination
          paginationPageSize={10}
          paginationPageSizeSelector={[5, 10, 20, 50]}
          domLayout="autoHeight"
        />
      </div>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <span className="text-xl font-bold">
            {currentFAQ.faq_id ? "Edit FAQ" : "Add FAQ"}
          </span>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Question<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                value={currentFAQ.question}
                onChange={(e) =>
                  setCurrentFAQ({ ...currentFAQ, question: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter the question"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Answer<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={currentFAQ.answer}
                onChange={(e) =>
                  setCurrentFAQ({ ...currentFAQ, answer: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                rows={6}
                placeholder="Enter the answer"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Visibility<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="is_shown"
                required
                value={
                  currentFAQ.is_shown !== undefined ? currentFAQ.is_shown : ""
                }
                onChange={handleFaqDetailsChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="" disabled>
                  -- Select an option --
                </option>
                <option value={1}>Shown</option>
                <option value={0}>Hidden</option>
              </select>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="px-6 py-4">
          <button 
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors" 
            onClick={() => {
              setOpenDialog(false);
              setCurrentFAQ({ faq_id: "", question: "", answer: "", is_shown: 1 });
            }}
          >
            Cancel
          </button>
          <button 
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg" 
            onClick={handleSave}
          >
            {currentFAQ.faq_id ? "Update" : "Save"}
          </button>
        </DialogActions>
      </Dialog>

      <ModalDeleteConfirmation
        isOpen={deleteModalOpen}
        handleClose={() => {
          setDeleteModalOpen(false);
          setCurrentFAQ({ faq_id: "", question: "", answer: "", is_shown: 1 });
        }}
        onConfirm={() => handleDelete(currentFAQ.faq_id, currentFAQ.question)}
        message="Are you sure you want to delete this FAQ?"
      />
    </>
  );
}

export default FAQs;