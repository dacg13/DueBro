"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Subject, type AcademicTerm, type Deadline } from "@/types";
import { SubjectCard } from "@/features/subjects/components/SubjectCard";
import { AddSubjectDialog } from "@/features/subjects/components/AddSubjectDialog";
import { SubjectDetailModal } from "@/features/subjects/components/SubjectDetailModal";
import { AcademicTermsDialog } from "@/features/academic-terms/components/AcademicTermsDialog";
import { AddDeadlineDialog } from "@/features/deadlines/components/AddDeadlineDialog";
import { CreateClassGroupDialog } from "@/features/class-groups/components/CreateClassGroupDialog";
import { getClassGroupsAction, type ClassGroupWithMemberCount } from "@/server/actions/class-groups";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { resolveCurrentTerm } from "@/server/domain/academic-terms";
import {
  BookOpen,
  Plus,
  Calendar,
  ChevronDown,
  ChevronUp,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Initial demonstration data matching real courses
const INITIAL_DEMO_TERMS: AcademicTerm[] = [
  {
    id: "term-fall-2026",
    userId: "demo-user",
    name: "Fall 2026",
    startDate: "2026-09-01",
    endDate: "2026-12-20",
    isCurrent: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "term-spring-2026",
    userId: "demo-user",
    name: "Spring 2026",
    startDate: "2026-01-15",
    endDate: "2026-05-15",
    isCurrent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const INITIAL_DEMO_SUBJECTS: Subject[] = [
  {
    id: "sub-cs101",
    termId: "term-fall-2026",
    userId: "demo-user",
    name: "CS101 Algorithms",
    color: "#5B6EF5",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub-math201",
    termId: "term-fall-2026",
    userId: "demo-user",
    name: "MATH201 Linear Algebra",
    color: "#2DB5A5",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub-phys150",
    termId: "term-fall-2026",
    userId: "demo-user",
    name: "PHYS150 Mechanics",
    color: "#E0A030",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub-eng110",
    termId: "term-spring-2026",
    userId: "demo-user",
    name: "ENG110 Technical Writing",
    color: "#8E51DA",
    archived: true,
    archivedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const INITIAL_DEMO_DEADLINES: Deadline[] = [
  {
    id: "dl-1",
    userId: "demo-user",
    subjectId: "sub-cs101",
    termId: "term-fall-2026",
    title: "Dynamic Programming Problem Set 4",
    type: "assignment",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    dueTime: "23:59",
    priority: "high",
    status: "in_progress",
    progress: 50,
    estimatedEffortHours: 4.5,
    location: null,
    notes: null,
    tags: [],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    sharedDeadlineId: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dl-2",
    userId: "demo-user",
    subjectId: "sub-math201",
    termId: "term-fall-2026",
    title: "Midterm Exam: Vector Spaces",
    type: "exam",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    dueTime: "10:00",
    priority: "critical",
    status: "not_started",
    progress: 0,
    estimatedEffortHours: 8.0,
    location: "Hall B, Room 204",
    notes: null,
    tags: [],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    sharedDeadlineId: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dl-3",
    userId: "demo-user",
    subjectId: "sub-phys150",
    termId: "term-fall-2026",
    title: "Lab Report 3",
    type: "lab",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0],
    dueTime: "17:00",
    priority: "medium",
    status: "not_started",
    progress: 25,
    estimatedEffortHours: 2.0,
    location: "Physics Lab 102",
    notes: null,
    tags: [],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    sharedDeadlineId: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function SubjectsPage() {
  const router = useRouter();
  const [terms, setTerms] = useState<AcademicTerm[]>(INITIAL_DEMO_TERMS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_DEMO_SUBJECTS);
  const [deadlines, setDeadlines] = useState<Deadline[]>(INITIAL_DEMO_DEADLINES);
  const [classGroups, setClassGroups] = useState<ClassGroupWithMemberCount[]>([]);

  // Term filter state (defaults to current term)
  const currentTerm = useMemo(() => resolveCurrentTerm(terms), [terms]);
  const [selectedTermId, setSelectedTermId] = useState<string>("all");

  // Collapsible archived toggle
  const [showArchived, setShowArchived] = useState(false);

  // Modals state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<Subject | null>(null);
  const [isSubjectDetailOpen, setIsSubjectDetailOpen] = useState(false);
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupSubjectId, setGroupSubjectId] = useState<string | undefined>(undefined);

  useEffect(() => {
    getClassGroupsAction().then((res) => {
      if (res.data) setClassGroups(res.data);
    });
  }, []);

  // Term lookup map
  const termMap = useMemo(() => {
    const map = new Map<string, AcademicTerm>();
    terms.forEach((t) => map.set(t.id, t));
    return map;
  }, [terms]);

  // Active vs Archived filtering
  const activeSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (s.archived) return false;
      if (selectedTermId !== "all" && s.termId !== selectedTermId) return false;
      return true;
    });
  }, [subjects, selectedTermId]);

  const archivedSubjects = useMemo(() => {
    return subjects.filter((s) => s.archived);
  }, [subjects]);

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setIsAddSubjectOpen(true);
  };

  const handleOpenDetail = (sub: Subject) => {
    setSelectedSubjectDetail(sub);
    setIsSubjectDetailOpen(true);
  };

  const handleAddDeadlineForSubject = () => {
    setIsAddDeadlineOpen(true);
  };

  const handleShareWithClassmates = (subject: Subject) => {
    const existingGroup = classGroups.find((g) => g.mySubjectId === subject.id);
    if (existingGroup) {
      router.push(`/groups/${existingGroup.group.id}`);
    } else {
      setGroupSubjectId(subject.id);
      setIsCreateGroupOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Subjects & Courses</h1>
            {currentTerm && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20">
                {currentTerm.name}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Organize coursework, manage semester courses, and track course-specific workloads.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => setIsTermsOpen(true)}
            className="gap-1.5"
          >
            <Calendar className="w-4 h-4 text-text-tertiary" />
            Terms
          </Button>

          <Button
            onClick={() => {
              setEditingSubject(null);
              setIsAddSubjectOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Term Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider shrink-0 mr-1">
          Filter by Term:
        </span>
        <button
          type="button"
          onClick={() => setSelectedTermId("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
            selectedTermId === "all"
              ? "bg-accent-subtle text-accent font-semibold border border-accent/30"
              : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
          )}
        >
          All Terms
        </button>

        {terms.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedTermId(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
              selectedTermId === t.id
                ? "bg-accent-subtle text-accent font-semibold border border-accent/30"
                : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
            )}
          >
            <span>{t.name}</span>
            {t.isCurrent && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Active Subjects Grid */}
      {activeSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No active subjects found"
          description={
            selectedTermId !== "all"
              ? "There are no courses assigned to this academic term. Add a subject or select 'All Terms'."
              : "You haven't added any subjects yet. Create your courses with distinct color tokens to start organizing deadlines."
          }
          actionLabel="Add Subject"
          onAction={() => {
            setEditingSubject(null);
            setIsAddSubjectOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              term={termMap.get(subject.termId)}
              deadlines={deadlines}
              onClick={handleOpenDetail}
              onEdit={handleOpenEdit}
              onDeleteSuccess={(id) => setSubjects((prev) => prev.filter((s) => s.id !== id))}
            />
          ))}
        </div>
      )}

      {/* Archived Subjects Section */}
      {archivedSubjects.length > 0 && (
        <div className="pt-4 border-t border-border-default space-y-3">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4 text-text-tertiary" />
            <span>Archived Subjects ({archivedSubjects.length})</span>
            {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showArchived && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
              {archivedSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  term={termMap.get(subject.termId)}
                  deadlines={deadlines}
                  onClick={handleOpenDetail}
                  onEdit={handleOpenEdit}
                  onDeleteSuccess={(id) => setSubjects((prev) => prev.filter((s) => s.id !== id))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subject Detail Modal */}
      <SubjectDetailModal
        subject={selectedSubjectDetail}
        term={selectedSubjectDetail ? termMap.get(selectedSubjectDetail.termId) : null}
        deadlines={deadlines}
        isOpen={isSubjectDetailOpen}
        onClose={() => setIsSubjectDetailOpen(false)}
        onAddDeadline={handleAddDeadlineForSubject}
        onOpenDeadlineDetail={() => {}}
        mappedGroupId={
          selectedSubjectDetail
            ? classGroups.find((g) => g.mySubjectId === selectedSubjectDetail.id)?.group.id
            : null
        }
        onShareWithClassmates={handleShareWithClassmates}
      />

      {/* Add / Edit Subject Dialog */}
      <AddSubjectDialog
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        terms={terms}
        initialData={editingSubject}
        onSuccess={(saved) => {
          setSubjects((prev) => {
            const exists = prev.some((s) => s.id === saved.id);
            if (exists) {
              return prev.map((s) => (s.id === saved.id ? saved : s));
            }
            return [saved, ...prev];
          });
        }}
      />

      {/* Academic Terms Dialog */}
      <AcademicTermsDialog
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        terms={terms}
        onTermsChange={(updatedTerms) => setTerms(updatedTerms)}
      />

      {/* Add Deadline Dialog (when triggered from subject detail) */}
      <AddDeadlineDialog
        isOpen={isAddDeadlineOpen}
        onClose={() => setIsAddDeadlineOpen(false)}
        subjects={subjects}
        onSuccess={(newDeadline) => {
          setDeadlines((prev) => [newDeadline, ...prev]);
        }}
      />

      {/* Create Class Group Dialog */}
      <CreateClassGroupDialog
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        subjects={subjects}
        preselectedSubjectId={groupSubjectId}
        onSuccess={(newGroupId) => {
          getClassGroupsAction().then((res) => {
            if (res.data) setClassGroups(res.data);
          });
          router.push(`/groups/${newGroupId}`);
        }}
      />
    </div>
  );
}
