import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { GraduationCap, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

import type {
  TrainingCategory,
  TrainingModule,
} from "@/redux/features/TrainingModule/traininModuleApi";

import { fetchStartDate } from "@/redux/features/TrainingModule/trainingModuleSlice";

import {
  fetchMyReviews,
  saveTrainingReview,
} from "@/redux/features/TrainingReview/trainingReviewSlice";

import TrainingDateModal from "@/components/training/TrainingDateModal";
import type { Department, SubDepartment } from "@/components/training/types";

import {
  DAY_INFO,
  DAY_INFO_PRESALES,
  type ModuleKey,
} from "@/components/training/constants";

import TrainingPageHeader from "@/components/training/TrainingPageHeader";
import TrainingTable from "@/components/training/TrainingTable";
import ReviewModal from "@/components/training/review/ReviewModal";
import type { ReviewFormValues } from "@/components/training/review/useReviewForm";

import AddModuleModal from "@/components/training/AddModuleModal";
import ModuleListModal from "@/components/training/ModuleListModal";
import TrainingTrackTable from "@/components/training/TrainingTrackTable";
import TrainingTablePreSales from "@/components/training/TrainingTablePreSales";

import AddQuestionsModal from "@/components/training/GoogleMap/AddQuestionsModal";

// Renders children on document.body so parent overflow/transform/z-index
// can never clip or hide the modal.
function ModalPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export default function TrainingManager() {
  const dispatch = useAppDispatch();

  // Redux state
  const { currentEmployee } = useAppSelector((state: any) => state.user);

  const startDate = useAppSelector(
    (state: any) => state.trainingModule.startDate,
  );

  const reviews = useAppSelector((state) => state.trainingReview.reviews);

  // Permissions
  const isSuperAdmin = currentEmployee?.access_role === "SUPER_ADMIN";

  const canAddTrainingModule =
    isSuperAdmin ||
    (currentEmployee?.department_name === "HR" &&
      currentEmployee?.subDepartment_name === "Ops & Admin" &&
      (currentEmployee?.role_name === "Admin Manager" ||
        currentEmployee?.role === "Admin Manager"));

  const canViewTrackTable =
    canAddTrainingModule || currentEmployee?.access_role === "HR";

  // Local states
  const [view, setView] = useState<"main" | "track">("main");
  const [department, setDepartment] = useState<Department>("");
  const [subDepartment, setSubDepartment] = useState<SubDepartment>("");
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showMapQuery, setShowMapQuery] = useState(false);

  const [leadModal, setLeadModal] = useState<{
    category: TrainingCategory;
    moduleKey: ModuleKey;
  } | null>(null);

  // Training program check
  const hasProgram =
    subDepartment === "presales" || subDepartment === "telesales";

  // Fetch reviews
  useEffect(() => {
    if (hasProgram) {
      dispatch(fetchMyReviews(subDepartment));
    }
  }, [dispatch, hasProgram, subDepartment]);

  // Fetch training start date
  useEffect(() => {
    if (hasProgram && department && subDepartment) {
      dispatch(
        fetchStartDate({
          department,
          subDepartment,
        }),
      );
    }
  }, [dispatch, hasProgram, department, subDepartment]);

  // Save review
  const saveReview = async (day: number, values: ReviewFormValues) => {
    await dispatch(
      saveTrainingReview({
        department,
        subDepartment,
        day,
        moduleName: (subDepartment === "presales"
          ? DAY_INFO_PRESALES
          : DAY_INFO)[day].module,
        ...values,
      }),
    ).unwrap();

    setActiveDay(null);
  };

  // Module uploaded
  const handleModuleUploaded = (m: TrainingModule) => {
    setDepartment(m.department as Department);
    setSubDepartment(m.subDepartment as SubDepartment);
    setShowAddModule(false);

    if (m.moduleKey) {
      setLeadModal({
        category: m.category,
        moduleKey: m.moduleKey,
      });
    }
  };

  // Training date saved
  const handleDateSaved = (d: Department, s: SubDepartment) => {
    setDepartment(d);
    setSubDepartment(s);
    setShowDateModal(false);

    dispatch(
      fetchStartDate({
        department: d,
        subDepartment: s,
      }),
    );
  };

  // Department change
  const handleDepartmentChange = (value: Department) => {
    setDepartment(value);
    setSubDepartment("");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col gap-4 overflow-hidden bg-white px-4 pb-4 pt-0 md:px-6 md:pb-6 md:pt-0">
      {/* HEADER */}
      <div className="shrink-0">
        <TrainingPageHeader
          department={department}
          subDepartment={subDepartment}
          onDepartmentChange={handleDepartmentChange}
          onSubDepartmentChange={setSubDepartment}
          onAdd={() => {
            console.log("Add Training Module clicked");
            setShowAddModule(true);
          }}
          onAddDate={() => setShowDateModal(true)}
          onAddMapQuery={() => setShowMapQuery(true)}
          showAdd={canAddTrainingModule}
          showAddDate={canAddTrainingModule}
          showAddMapQuery={canAddTrainingModule}
          showTrack={canViewTrackTable}
          onTrack={() =>
            setView((prev) => (prev === "track" ? "main" : "track"))
          }
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex min-h-0 flex-1 flex-col">
        {view === "track" ? (
          <div className="min-h-0 flex-1 overflow-auto">
            <TrainingTrackTable />
          </div>
        ) : (
          <>
            {/* SELECT DEPARTMENT */}
            {!department && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                <GraduationCap
                  size={40}
                  className="mx-auto mb-4 text-green-600"
                />
                <h3 className="text-lg font-bold text-slate-800">
                  Select Department
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Select a department and sub department to view the training
                  schedule.
                </p>
              </div>
            )}

            {/* SELECT SUB DEPARTMENT */}
            {department === "sales" && !subDepartment && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
                <Users size={35} className="mx-auto mb-3 text-green-600" />
                <h3 className="font-bold text-slate-800">
                  Select Sub Department
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Choose Pre-Sales or Tele-Sales to view the training program.
                </p>
              </div>
            )}

            {/* TRAINING TABLES */}
            {hasProgram &&
              (subDepartment === "presales" ? (
                <TrainingTablePreSales
                  subDepartment={subDepartment}
                  reviews={reviews}
                  startDate={startDate}
                  onOpenReview={setActiveDay}
                  onOpenLead={(category, moduleKey) =>
                    setLeadModal({ category, moduleKey })
                  }
                />
              ) : (
                <TrainingTable
                  subDepartment={subDepartment}
                  reviews={reviews}
                  startDate={startDate}
                  onOpenReview={setActiveDay}
                  onOpenLead={(category, moduleKey) =>
                    setLeadModal({ category, moduleKey })
                  }
                />
              ))}
          </>
        )}
      </div>

      {/* REVIEW MODAL */}
      {activeDay !== null && (
        <ModalPortal>
          <ReviewModal
            key={activeDay}
            day={activeDay}
            initial={reviews[activeDay]}
            onSave={saveReview}
            onClose={() => setActiveDay(null)}
          />
        </ModalPortal>
      )}

      {/* ADD MODULE MODAL */}
      {showAddModule && (
        <ModalPortal>
          <AddModuleModal
            defaultDepartment={department}
            defaultSubDepartment={subDepartment}
            defaultCategory="lead_video"
            onUploaded={handleModuleUploaded}
            onClose={() => setShowAddModule(false)}
          />
        </ModalPortal>
      )}

      {/* TRAINING DATE MODAL */}
      {showDateModal && (
        <ModalPortal>
          <TrainingDateModal
            defaultDepartment={department}
            defaultSubDepartment={subDepartment}
            onSaved={handleDateSaved}
            onClose={() => setShowDateModal(false)}
          />
        </ModalPortal>
      )}

      {/* GOOGLE MAP QUESTIONS MODAL */}
      {showMapQuery && (
        <ModalPortal>
          <AddQuestionsModal
            open={showMapQuery}
            onClose={() => setShowMapQuery(false)}
            departments={[{ value: "sales", label: "Sales" }]}
            subDepartments={{
              sales: [
                { value: "presales", label: "Pre-Sales" },
                { value: "telesales", label: "Tele-Sales" },
              ],
            }}
            modules={[{ value: "google_maps", label: "Google Maps" }]}
          />
        </ModalPortal>
      )}

      {/* MODULE LIST MODAL */}
      {leadModal && department && subDepartment && (
        <ModalPortal>
          <ModuleListModal
            department={department}
            subDepartment={subDepartment}
            category={leadModal.category}
            moduleKey={leadModal.moduleKey}
            onClose={() => setLeadModal(null)}
          />
        </ModalPortal>
      )}
    </div>
  );
}
