"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRightLeft,
  Ban,
  Camera,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileText,
  ImagePlus,
  Loader2,
  MessageCircle,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eyebrow,
  LedgerButton,
  Mono,
  StageBadge,
  WhatsAppIcon,
} from "@/components/ledger";
import { LeadWhatsAppChatDrawer } from "@/components/whatsapp/lead-whatsapp-chat-drawer";
import { CreateInvoiceModal } from "@/components/leads/create-invoice-modal";
import { InvoiceCard } from "@/components/leads/invoice-card";
import { SaveAsTemplateDialog } from "@/components/invoices/templates/save-as-template-dialog";
import { TemplatePickerDialog } from "@/components/invoices/templates/template-picker-dialog";
import { LeadNotes } from "@/components/leads/lead-notes";
import { FollowupActionCard } from "@/components/followup-card/followup-action-card";
import {
  activityAccentColor,
  activityFallbackDescription,
  activityLabel,
  isResolutionActivity,
  statusChangeTransition,
} from "@/lib/activity-presentation";
import { useLookupMaps } from "@/hooks/use-lookup-maps";
import { fetchLeads, moveLeadStage, updateLeadNotes } from "@/lib/api/leads";
import {
  createActivity,
  fetchLeadActivities,
  updateActivity,
} from "@/lib/api/activities";
import {
  cancelFollowUp,
  createFollowUp,
  fetchLeadFollowUps,
  markFollowUpDone,
  rescheduleFollowUp,
} from "@/lib/api/followups";
import { CancelFollowupDialog } from "@/components/leads/cancel-followup-dialog";
import { RescheduleFollowupDialog } from "@/components/leads/reschedule-followup-dialog";
import { fetchLeadInvoices } from "@/lib/api/invoices";
import {
  ACCEPTED_ATTACHMENT_FILE_TYPES,
  MAX_ATTACHMENT_FILE_SIZE_BYTES,
  deleteAttachment,
  fetchAttachmentsBatch,
  uploadAttachment,
} from "@/lib/api/attachments";
import {
  ActivityAttachmentStrip,
  ActivityAttachmentViewer,
} from "@/components/leads/activity-attachments";
import type { Attachment } from "@/lib/types/attachment";
import type { Lead } from "@/lib/types/lead";
import type { ActivityType, LeadActivity } from "@/lib/types/activity";
import {
  ACTIVITY_TYPE_LABELS,
  EDITABLE_ACTIVITY_TYPES,
} from "@/lib/types/activity";
import type { LeadFollowUp } from "@/lib/types/followup";
import type { Invoice } from "@/lib/types/invoice";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRupees(value: string | number): string {
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(isoString);
}

function getPriorityLabel(priority: number): string {
  if (priority === 1) return "High";
  if (priority === 2) return "Medium";
  return "Low";
}

function getPriorityClass(priority: number): string {
  if (priority === 1) return "bg-red-100 text-red-700";
  if (priority === 2) return "bg-amber-100 text-amber-700";
  return "bg-muted text-muted-foreground";
}

const ACTIVITY_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "call", label: "📞 Call" },
  { value: "whatsapp", label: "💬 WhatsApp" },
  { value: "note", label: "📝 Note" },
  { value: "meeting", label: "🤝 Meeting" },
];

// Activity icon — colour is driven by Ledger tokens so the timeline
// matches the rest of the system (stage hues for call/meeting, WhatsApp
// green via --wa, follow-done for payments).
function activityColor(type: ActivityType): string {
  switch (type) {
    case "call":
      return "var(--stage-new-fg)";
    case "whatsapp":
      return "var(--wa)";
    case "meeting":
      return "var(--stage-visit-fg)";
    case "payment_recorded":
      return "var(--follow-done)";
    case "payment_edited":
      return "var(--follow-unset)";
    case "payment_voided":
      return "var(--follow-overdue)";
    case "payment_moved":
      return "var(--stage-new-fg)";
    default:
      return "var(--color-text-muted)";
  }
}

function ActivityIcon({ type }: { type: ActivityType }) {
  const cls = "h-3.5 w-3.5";
  return (
    <span style={{ color: activityColor(type) }} className="inline-flex">
      {type === "call" && <Phone className={cls} />}
      {type === "whatsapp" && <MessageCircle className={cls} />}
      {type === "meeting" && <Users className={cls} />}
      {type === "payment_recorded" && <Receipt className={cls} />}
      {type === "payment_edited" && <Pencil className={cls} />}
      {type === "payment_voided" && <Ban className={cls} />}
      {type === "payment_moved" && <ArrowRightLeft className={cls} />}
      {type !== "call" &&
        type !== "whatsapp" &&
        type !== "meeting" &&
        type !== "payment_recorded" &&
        type !== "payment_edited" &&
        type !== "payment_voided" &&
        type !== "payment_moved" && <FileText className={cls} />}
    </span>
  );
}

// Tile wrapper — §14.4. 34×34 circular tint by activity colour, mixed
// against the warm surface so it stays calm against the row background.
function ActivityIconTile({ type }: { type: ActivityType }) {
  const color = activityColor(type);
  return (
    <span
      className="mt-0.5 flex h-[34px] w-[34px] shrink-0 items-center justify-center"
      style={{
        color,
        background: `color-mix(in oklch, ${color} 13%, var(--color-surface))`,
        border: `1px solid color-mix(in oklch, ${color} 24%, var(--color-border))`,
        borderRadius: "50%",
      }}
    >
      <ActivityIcon type={type} />
    </span>
  );
}

// Two-letter initials for the customer avatar tile (§14.5). Falls back
// to a single "?" for unknown customers so the avatar tile never goes
// blank.
function initialsOf(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "?";
  const first = parts[0][0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + second).toUpperCase() || "?";
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}

// Shared form input style — reads Ledger surface tokens so inputs sit
// flush against panels. Uses --color-surface (slightly lighter than
// --color-bg) for the field so dropdowns and inline forms stay visible
// against the warm paper background.
const inputCls =
  "w-full rounded-[var(--ledger-radius-control)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-[13.5px] text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/30 placeholder:text-[color:var(--color-text-faint)]";

// ─── Main component ──────────────────────────────────────────────────────────

export default function LeadDetailClient({ leadId }: { leadId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stageMap, isLoading: isLoadingStages } = useLookupMaps();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [reschedulingFollowUp, setReschedulingFollowUp] = useState<LeadFollowUp | null>(null);
  const [cancellingFollowUp, setCancellingFollowUp] = useState<LeadFollowUp | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Drawer / modal
  // const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [saveAsTemplateInvoice, setSaveAsTemplateInvoice] = useState<Invoice | null>(null);

  // Activity form
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>("note");
  const [activityDesc, setActivityDesc] = useState("");
  const [activitySubmitting, setActivitySubmitting] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [activityFiles, setActivityFiles] = useState<File[]>([]);
  const [activityFilesError, setActivityFilesError] = useState<string | null>(null);
  const activityCameraInputRef = useRef<HTMLInputElement | null>(null);
  const activityFileInputRef = useRef<HTMLInputElement | null>(null);

  // Attachments per activity (from batch fetch) + viewer state
  const [attachmentsByActivity, setAttachmentsByActivity] = useState<
    Record<string, Attachment[]>
  >({});
  const [viewer, setViewer] = useState<{ activityId: string; index: number } | null>(
    null
  );

  // Inline edit state — only set for user-created (editable) activities
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editType, setEditType] = useState<ActivityType>("note");
  const [editDesc, setEditDesc] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editFilesError, setEditFilesError] = useState<string | null>(null);
  const editCameraInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Follow-up form
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState("");
  const [isMovingStage, setIsMovingStage] = useState(false);
  const [stageMoveError, setStageMoveError] = useState<string | null>(null);
  const [stageMoveSuccess, setStageMoveSuccess] = useState<string | null>(null);


  const stageOptions = useMemo(
    () =>
      Object.values(stageMap).sort((a, b) => {
        if (a.position === b.position) {
          return a.name.localeCompare(b.name);
        }
        return a.position - b.position;
      }),
    [stageMap]
  );

  // Earliest pending follow-up powers the FollowupActionCard slot at the
  // top of the page. Null when the lead has no open follow-up — in that
  // case the slot collapses to a "[Set a follow-up]" affordance.
  const openFollowup = useMemo<LeadFollowUp | null>(
    () =>
      followUps
        .filter((f) => f.status === "pending")
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        )[0] ?? null,
    [followUps],
  );

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [leadsData, activitiesData, followUpsData, invoicesData] =
        await Promise.all([
          fetchLeads(),
          fetchLeadActivities(leadId),
          fetchLeadFollowUps(leadId),
          fetchLeadInvoices(leadId, true),
        ]);

      setLead(leadsData.find((l) => l.id === leadId) ?? null);
      setActivities(
        [...activitiesData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setFollowUps(
        [...followUpsData].sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        )
      );
      setInvoices(invoicesData);

      const activityIds = activitiesData.map((a) => a.id);
      if (activityIds.length > 0) {
        try {
          const grouped = await fetchAttachmentsBatch("lead_activity", activityIds);
          setAttachmentsByActivity(grouped);
        } catch {
          // Attachment fetch failure is non-fatal — timeline still renders
          setAttachmentsByActivity({});
        }
      } else {
        setAttachmentsByActivity({});
      }
    } catch (err) {
      setLoadError(extractErrorMessage(err, "Unable to load lead details."));
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (lead?.stageId) {
      setSelectedStageId(lead.stageId);
    }
  }, [lead]);

  useEffect(() => {
    const invoiceId = searchParams.get("invoice");
    const isEdit = searchParams.get("edit") === "1";
    if (!invoiceId || !isEdit || invoices.length === 0) return;

    const target = invoices.find((inv) => inv.id === invoiceId);
    if (!target) return;

    setEditingInvoice(target);
    setIsInvoiceModalOpen(true);

    // Remove params so a refresh doesn't re-open the modal
    const url = new URL(window.location.href);
    url.searchParams.delete("invoice");
    url.searchParams.delete("edit");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [searchParams, invoices, router]);

  const refreshActivities = useCallback(async () => {
    const data = await fetchLeadActivities(leadId);
    setActivities(
      [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
    const activityIds = data.map((a) => a.id);
    if (activityIds.length > 0) {
      try {
        const grouped = await fetchAttachmentsBatch("lead_activity", activityIds);
        setAttachmentsByActivity(grouped);
      } catch {
        // non-fatal
      }
    } else {
      setAttachmentsByActivity({});
    }
  }, [leadId]);

  const refreshFollowUps = useCallback(async () => {
    const data = await fetchLeadFollowUps(leadId);
    setFollowUps(
      [...data].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
    );
  }, [leadId]);

  const refreshInvoices = useCallback(async () => {
    const data = await fetchLeadInvoices(leadId, true);
    setInvoices(data);
  }, [leadId]);

  const handleInvoiceModalClose = useCallback(() => {
    setIsInvoiceModalOpen(false);
    setEditingInvoice(null);
  }, []);

  const handleInvoiceModalSuccess = useCallback(async () => {
    await refreshInvoices();
  }, [refreshInvoices]);

  const handleCreateInvoice = useCallback(() => {
    setEditingInvoice(null);
    setPendingTemplateId(null);
    setIsInvoiceModalOpen(true);
  }, []);

  const handleCreateFromTemplate = useCallback(() => {
    setTemplatePickerOpen(true);
  }, []);

  const handleTemplatePicked = useCallback((templateId: string) => {
    setTemplatePickerOpen(false);
    setEditingInvoice(null);
    setPendingTemplateId(templateId);
    setIsInvoiceModalOpen(true);
  }, []);

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    setEditingInvoice(invoice);
    setPendingTemplateId(null);
    setIsInvoiceModalOpen(true);
  }, []);

  const handleSaveInvoiceAsTemplate = useCallback((invoice: Invoice) => {
    setSaveAsTemplateInvoice(invoice);
  }, []);

  const handleSaveNotes = useCallback(async (notes: string) => {
    const updated = await updateLeadNotes(leadId, notes);
    if (updated) {
      setLead(updated);
      return;
    }

    setLead((prev) => (prev ? { ...prev, notes } : prev));
  }, [leadId]);

  // ─── Submit handlers ───────────────────────────────────────────────────────

  const handleActivityFilesAdded = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    if (list.length === 0) return;

    const accepted: File[] = [];
    let rejection: string | null = null;
    for (const file of list) {
      if (!ACCEPTED_ATTACHMENT_FILE_TYPES.includes(file.type)) {
        rejection = "Only JPG, PNG, or PDF files are allowed.";
        continue;
      }
      if (file.size > MAX_ATTACHMENT_FILE_SIZE_BYTES) {
        rejection = "Each file must be 10MB or less.";
        continue;
      }
      accepted.push(file);
    }

    setActivityFiles((prev) => {
      const combined = [...prev, ...accepted];
      if (combined.length > 10) {
        rejection = "Maximum 10 files per activity.";
        return combined.slice(0, 10);
      }
      return combined;
    });
    setActivityFilesError(rejection);
  };

  const removeActivityFileAt = (index: number) => {
    setActivityFiles((prev) => prev.filter((_, i) => i !== index));
    setActivityFilesError(null);
  };

  const resetActivityForm = () => {
    setShowActivityForm(false);
    setActivityDesc("");
    setActivityType("note");
    setActivityError(null);
    setActivityFiles([]);
    setActivityFilesError(null);
  };

  const handleActivitySubmit = async () => {
    if (!activityDesc.trim()) return;
    setActivitySubmitting(true);
    setActivityError(null);
    try {
      const created = await createActivity(leadId, {
        type: activityType,
        description: activityDesc.trim(),
      });

      if (activityFiles.length > 0) {
        for (const file of activityFiles) {
          try {
            await uploadAttachment("lead_activity", created.id, file);
          } catch (uploadErr) {
            // Surface partial-failure but don't roll back the activity
            setActivityError(
              extractErrorMessage(uploadErr, "Some attachments failed to upload.")
            );
          }
        }
      }

      resetActivityForm();
      await refreshActivities();
    } catch (err) {
      setActivityError(extractErrorMessage(err, "Unable to log activity."));
    } finally {
      setActivitySubmitting(false);
    }
  };

  const handleAttachmentDelete = useCallback(
    async (attachmentId: string) => {
      await deleteAttachment(attachmentId);
      setAttachmentsByActivity((prev) => {
        const next: Record<string, Attachment[]> = {};
        for (const [id, list] of Object.entries(prev)) {
          next[id] = list.filter((a) => a.id !== attachmentId);
        }
        return next;
      });
    },
    []
  );

  const startEditActivity = (a: LeadActivity) => {
    if (!EDITABLE_ACTIVITY_TYPES.has(a.type)) return;
    setEditingActivityId(a.id);
    setEditType(a.type);
    setEditDesc(a.description);
    setEditError(null);
    setEditFiles([]);
    setEditFilesError(null);
  };

  const cancelEditActivity = () => {
    setEditingActivityId(null);
    setEditError(null);
    setEditFiles([]);
    setEditFilesError(null);
  };

  const handleEditFilesAdded = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    if (list.length === 0) return;

    const existingCount =
      (editingActivityId
        ? attachmentsByActivity[editingActivityId]?.length ?? 0
        : 0) + editFiles.length;

    const accepted: File[] = [];
    let rejection: string | null = null;
    for (const file of list) {
      if (!ACCEPTED_ATTACHMENT_FILE_TYPES.includes(file.type)) {
        rejection = "Only JPG, PNG, or PDF files are allowed.";
        continue;
      }
      if (file.size > MAX_ATTACHMENT_FILE_SIZE_BYTES) {
        rejection = "Each file must be 10MB or less.";
        continue;
      }
      accepted.push(file);
    }

    setEditFiles((prev) => {
      const combined = [...prev, ...accepted];
      const total = existingCount - prev.length + combined.length;
      if (total > 10) {
        rejection = "Maximum 10 files per activity.";
        const allowed = Math.max(0, 10 - (existingCount - prev.length));
        return combined.slice(0, allowed);
      }
      return combined;
    });
    setEditFilesError(rejection);
  };

  const removeEditFileAt = (index: number) => {
    setEditFiles((prev) => prev.filter((_, i) => i !== index));
    setEditFilesError(null);
  };

  const handleEditActivitySubmit = async () => {
    if (!editingActivityId || !editDesc.trim()) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateActivity(leadId, editingActivityId, {
        type: editType,
        description: editDesc.trim(),
      });

      if (editFiles.length > 0) {
        for (const file of editFiles) {
          try {
            await uploadAttachment("lead_activity", editingActivityId, file);
          } catch (uploadErr) {
            setEditError(
              extractErrorMessage(uploadErr, "Some attachments failed to upload.")
            );
          }
        }
      }

      setEditingActivityId(null);
      setEditFiles([]);
      setEditFilesError(null);
      await refreshActivities();
    } catch (err) {
      setEditError(extractErrorMessage(err, "Unable to update activity."));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpDate) return;
    setFollowUpSubmitting(true);
    setFollowUpError(null);
    try {
      const scheduledAt = new Date(followUpDate + "T09:00:00").toISOString();
      const input = followUpNote.trim()
        ? { lead_id: leadId, scheduled_at: scheduledAt, note: followUpNote.trim() }
        : { lead_id: leadId, scheduled_at: scheduledAt };
      await createFollowUp(input);
      setFollowUpDate("");
      setFollowUpNote("");
      setShowFollowUpForm(false);
      await refreshFollowUps();
    } catch (err) {
      setFollowUpError(extractErrorMessage(err, "Unable to create follow-up."));
    } finally {
      setFollowUpSubmitting(false);
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      await markFollowUpDone(id, {});
      await refreshFollowUps();
    } catch {
      // silently ignore — list will reflect server state on next refresh
    }
  };

  const handleRescheduleConfirm = async (
    followupId: string,
    input: { scheduledAt: string; note: string | null },
  ) => {
    await rescheduleFollowUp(followupId, {
      scheduled_at: input.scheduledAt,
      note: input.note ?? undefined,
    });
    await refreshFollowUps();
    await refreshActivities();
  };

  const handleCancelConfirm = async (followupId: string, reason: string | null) => {
    await cancelFollowUp(followupId, {
      note: reason ?? undefined,
    });
    await refreshFollowUps();
    await refreshActivities();
  };

  const handleStageChange = async (newStageId: string) => {
    if (!lead || !newStageId || newStageId === lead.stageId) {
      return;
    }

    setIsMovingStage(true);
    setStageMoveError(null);
    setStageMoveSuccess(null);

    try {
      const updatedLead = await moveLeadStage(lead.id, newStageId);
      if (updatedLead) {
        setLead(updatedLead);
        setSelectedStageId(updatedLead.stageId);
        setStageMoveSuccess(
          `Moved to ${updatedLead.stageName ?? stageMap[updatedLead.stageId]?.name ?? "new stage"}`
        );
      } else {
        const nextStage = stageMap[newStageId];
        setLead((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            stageId: newStageId,
            stageName: nextStage?.name ?? prev.stageName,
            stageColor: nextStage?.color ?? prev.stageColor,
          };
        });
        setSelectedStageId(newStageId);
        setStageMoveSuccess(`Moved to ${nextStage?.name ?? "new stage"}`);
      }
    } catch {
      setStageMoveError("Failed to move stage");
    } finally {
      setIsMovingStage(false);
    }
  };

  // ─── Loading / error states ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--color-text-muted)" }}
        />
      </div>
    );
  }

  if (loadError || !lead) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p
          className="text-[13px]"
          style={{ color: "var(--follow-overdue)" }}
        >
          {loadError ?? "Lead not found."}
        </p>
        <Link href="/leads">
          <LedgerButton variant="action" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </LedgerButton>
        </Link>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* ══ LEFT COLUMN ═══════════════════════════════════════════════════════ */}
      <div className="min-w-0 space-y-8">
        {/* Header — §14.2. Breadcrumb · title + stage badge ·
            change-stage select · meta line (value · source · service
            date). The title uses neutral text per §0.1 (terracotta is
            reserved for primary actions). */}
        <div className="space-y-3">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-[13px] font-semibold transition hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Leads
          </Link>

          <div className="flex flex-wrap items-start gap-3">
            <h1
              className="flex-1 text-[28px] font-bold leading-tight tracking-[-0.03em]"
              style={{ color: "var(--color-text)" }}
            >
              {lead.title}
            </h1>
            {(lead.stageName || lead.stageId) ? (
              <StageBadge
                name={lead.stageName ?? stageMap[lead.stageId]?.name ?? lead.stageId}
                color={lead.stageColor ?? stageMap[lead.stageId]?.color ?? null}
                className="shrink-0"
              />
            ) : null}

            <div className="relative w-full sm:w-44">
              <select
                value={selectedStageId}
                onChange={(e) => {
                  const nextStageId = e.target.value;
                  setSelectedStageId(nextStageId);
                  void handleStageChange(nextStageId);
                }}
                className="w-full appearance-none px-3 py-2 pr-9 text-[13px] font-medium"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--ledger-radius-control)",
                  color: "var(--color-text-secondary)",
                }}
                disabled={isLoadingStages || isMovingStage || stageOptions.length === 0}
              >
                <option value="">
                  {isLoadingStages
                    ? "Loading stages..."
                    : isMovingStage
                      ? "Changing..."
                      : "Change Stage"}
                </option>
                {stageOptions.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 size-[14px] -translate-y-1/2"
                strokeWidth={1.8}
                style={{ color: "var(--color-text-faint)" }}
              />
            </div>
          </div>

          {stageMoveError ? (
            <p className="text-[12px]" style={{ color: "var(--follow-overdue)" }}>
              {stageMoveError}
            </p>
          ) : null}

          {stageMoveSuccess ? (
            <p className="text-[12px]" style={{ color: "var(--follow-done)" }}>
              {stageMoveSuccess}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-[13.5px]">
            {lead.estimatedValue ? (
              <Mono
                className="text-[16px] font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {formatRupees(lead.estimatedValue)}
              </Mono>
            ) : null}
            {lead.source ? (
              <span
                className="inline-flex items-center gap-[5px] text-[12.5px] font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                <span
                  aria-hidden
                  className="inline-block size-[6px] rounded-[2px]"
                  style={{ background: "var(--color-text-faint)" }}
                />
                {lead.source}
              </span>
            ) : null}
            {lead.serviceDate ? (
              <Mono
                className="text-[12.5px]"
                style={{ color: "var(--color-text-faint)" }}
              >
                Service: {formatDate(lead.serviceDate)}
              </Mono>
            ) : null}
          </div>
        </div>

        {/* Follow-up action card — top slot. Renders the FollowupActionCard
            when an open pending follow-up exists; otherwise collapses to
            a [Set a follow-up] affordance that toggles the existing form
            further down the page. After resolve we call loadAll() to
            refetch the lead (stage, last_contacted_at) and follow-ups
            (the new pending one, if any). The activity log lives further
            down and rehydrates off the same loadAll(). */}
        {openFollowup ? (
          <FollowupActionCard
            key={openFollowup.id}
            followup={openFollowup}
            lead={lead}
            stages={stageOptions}
            onResolved={() => {
              void loadAll();
            }}
          />
        ) : (
          <div
            className="flex items-center justify-between gap-3 px-4 py-3"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--ledger-radius-card)",
            }}
          >
            <p
              className="text-[13.5px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              No open follow-up.
            </p>
            <LedgerButton
              variant="action"
              size="sm"
              onClick={() => setShowFollowUpForm(true)}
            >
              <Plus className="size-[14px]" strokeWidth={2} />
              Set a follow-up
            </LedgerButton>
          </div>
        )}

        <LeadNotes
          leadId={leadId}
          initialNotes={lead.notes || ""}
          onSave={handleSaveNotes}
        />

        {/* Activity Log — §14.4 timeline */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              className="text-[15px] font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Activity
            </h2>
            <LedgerButton
              variant="action"
              size="sm"
              onClick={() => setShowActivityForm((p) => !p)}
            >
              <Plus className="h-3.5 w-3.5" />
              Log Activity
            </LedgerButton>
          </div>

          {showActivityForm ? (
            <div className="space-y-2 rounded-xl border bg-card p-3">
              {activityError ? (
                <p className="text-[12px]" style={{ color: "var(--follow-overdue)" }}>{activityError}</p>
              ) : null}
              <select
                className={inputCls}
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
              >
                {ACTIVITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <textarea
                className={inputCls}
                rows={2}
                placeholder="Description..."
                value={activityDesc}
                onChange={(e) => setActivityDesc(e.target.value)}
              />

              <input
                ref={activityCameraInputRef}
                type="file"
                accept="image/jpeg,image/png"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  handleActivityFilesAdded(e.target.files);
                  e.target.value = "";
                }}
                disabled={activitySubmitting}
              />
              <input
                ref={activityFileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleActivityFilesAdded(e.target.files);
                  e.target.value = "";
                }}
                disabled={activitySubmitting}
              />

              {activityFiles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activityFiles.map((file, idx) => {
                    const isImg = file.type.startsWith("image/");
                    const previewUrl = isImg ? URL.createObjectURL(file) : null;
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        className="relative h-16 w-16 overflow-hidden rounded-md border border-border bg-muted"
                      >
                        {isImg && previewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="h-full w-full object-cover"
                            onLoad={() => URL.revokeObjectURL(previewUrl)}
                          />
                        ) : (
                          <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
                            <FileText className="h-5 w-5" />
                            PDF
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeActivityFileAt(idx)}
                          disabled={activitySubmitting}
                          className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80 disabled:opacity-50"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {activityFilesError ? (
                <p className="text-[12px]" style={{ color: "var(--follow-overdue)" }}>{activityFilesError}</p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => activityCameraInputRef.current?.click()}
                    disabled={activitySubmitting || activityFiles.length >= 10}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => activityFileInputRef.current?.click()}
                    disabled={activitySubmitting || activityFiles.length >= 10}
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    Attach
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetActivityForm}
                    disabled={activitySubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={activitySubmitting || !activityDesc.trim()}
                    onClick={handleActivitySubmit}
                  >
                    {activitySubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => {
                const atts = attachmentsByActivity[a.id] ?? [];
                // Resolution rows (carry a result_action in payload) and
                // status_change rows are audit-trail entries — never editable.
                const editable =
                  EDITABLE_ACTIVITY_TYPES.has(a.type) && !isResolutionActivity(a);
                const isEditing = editingActivityId === a.id;
                const baseLabel = ACTIVITY_TYPE_LABELS[a.type] ?? a.type;
                const typeLabel = activityLabel(a, baseLabel).toUpperCase();
                const accent = activityAccentColor(a);
                // For status_change rows we prefer the resolved "{from} → {to}"
                // string over the row's existing "Stage moved to X" description.
                const stageTransition = statusChangeTransition(a, stageMap);
                const fallbackDesc = activityFallbackDescription(a);
                const displayDescription =
                  stageTransition ??
                  (a.description && a.description.trim() ? a.description : null);

                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 px-3 py-2.5"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--ledger-radius-card)",
                    }}
                  >
                    <ActivityIconTile type={a.type} />
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          {editError ? (
                            <p className="text-[12px]" style={{ color: "var(--follow-overdue)" }}>{editError}</p>
                          ) : null}
                          <select
                            className={inputCls}
                            value={editType}
                            onChange={(e) =>
                              setEditType(e.target.value as ActivityType)
                            }
                            disabled={editSubmitting}
                          >
                            {ACTIVITY_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          <textarea
                            className={inputCls}
                            rows={2}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            disabled={editSubmitting}
                          />

                          {atts.length > 0 ? (
                            <div>
                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Current attachments
                              </p>
                              <ActivityAttachmentStrip
                                attachments={atts}
                                onOpen={(idx) =>
                                  setViewer({ activityId: a.id, index: idx })
                                }
                              />
                            </div>
                          ) : null}

                          <input
                            ref={editCameraInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              handleEditFilesAdded(e.target.files);
                              e.target.value = "";
                            }}
                            disabled={editSubmitting}
                          />
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              handleEditFilesAdded(e.target.files);
                              e.target.value = "";
                            }}
                            disabled={editSubmitting}
                          />

                          {editFiles.length > 0 ? (
                            <div>
                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                New uploads
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {editFiles.map((file, idx) => {
                                  const isImg = file.type.startsWith("image/");
                                  const previewUrl = isImg
                                    ? URL.createObjectURL(file)
                                    : null;
                                  return (
                                    <div
                                      key={`${file.name}-${idx}`}
                                      className="relative h-16 w-16 overflow-hidden rounded-md border border-border bg-muted"
                                    >
                                      {isImg && previewUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={previewUrl}
                                          alt={file.name}
                                          className="h-full w-full object-cover"
                                          onLoad={() =>
                                            URL.revokeObjectURL(previewUrl)
                                          }
                                        />
                                      ) : (
                                        <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
                                          <FileText className="h-5 w-5" />
                                          PDF
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => removeEditFileAt(idx)}
                                        disabled={editSubmitting}
                                        className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80 disabled:opacity-50"
                                        aria-label={`Remove ${file.name}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          {editFilesError ? (
                            <p className="text-[12px]" style={{ color: "var(--follow-overdue)" }}>{editFilesError}</p>
                          ) : null}

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => editCameraInputRef.current?.click()}
                                disabled={
                                  editSubmitting ||
                                  atts.length + editFiles.length >= 10
                                }
                              >
                                <Camera className="h-3.5 w-3.5" />
                                Photo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => editFileInputRef.current?.click()}
                                disabled={
                                  editSubmitting ||
                                  atts.length + editFiles.length >= 10
                                }
                              >
                                <ImagePlus className="h-3.5 w-3.5" />
                                Attach
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditActivity}
                                disabled={editSubmitting}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={editSubmitting || !editDesc.trim()}
                                onClick={handleEditActivitySubmit}
                              >
                                {editSubmitting ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <Eyebrow style={accent ? { color: accent } : undefined}>
                              {typeLabel}
                            </Eyebrow>
                            {editable ? (
                              <button
                                type="button"
                                onClick={() => startEditActivity(a)}
                                className="-mt-0.5 -mr-1 rounded p-1 transition"
                                style={{ color: "var(--color-text-muted)" }}
                                aria-label="Edit activity"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                          {displayDescription ? (
                            <p
                              className="text-[14px] leading-snug"
                              style={{
                                color: "var(--color-text)",
                                textWrap: "pretty",
                              }}
                            >
                              {displayDescription}
                            </p>
                          ) : fallbackDesc ? (
                            <p
                              className="text-[13px] italic leading-snug"
                              style={{
                                color: "var(--color-text-muted)",
                                textWrap: "pretty",
                              }}
                            >
                              {fallbackDesc}
                            </p>
                          ) : null}
                          <ActivityAttachmentStrip
                            attachments={atts}
                            onOpen={(idx) =>
                              setViewer({ activityId: a.id, index: idx })
                            }
                          />
                          <Mono
                            as="p"
                            className="mt-1 text-[12px]"
                            style={{ color: "var(--color-text-faint)" }}
                          >
                            {timeAgo(a.createdAt)}
                          </Mono>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Invoices */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              className="text-[15px] font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Invoices
            </h2>
            <div className="inline-flex items-center gap-0.5">
              <LedgerButton
                variant="action"
                size="sm"
                onClick={handleCreateInvoice}
                className="rounded-r-none"
              >
                <Plus className="h-3.5 w-3.5" />
                New Invoice
              </LedgerButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label="More invoice options"
                    className="rounded-l-none border-l-0 px-2"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleCreateFromTemplate}>
                    Start from template...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {invoices.length === 0 ? (
            <p className="text-[13.5px]" style={{ color: "var(--color-text-muted)" }}>
              No invoices yet.
            </p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <InvoiceCard
                  key={inv.id}
                  invoice={inv}
                  customerName={lead.customerName ?? "Customer"}
                  onEdit={handleEditInvoice}
                  onSaveAsTemplate={handleSaveInvoiceAsTemplate}
                  onPaymentRecorded={() => {
                    void refreshInvoices();
                  }}
                  onStatusChanged={(updated) => {
                    setInvoices((prev) =>
                      prev.map((i) => (i.id === updated.id ? updated : i))
                    );
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ══ RIGHT SIDEBAR ═════════════════════════════════════════════════════ */}
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        {/* Customer card — §14.5 */}
        <div
          className="space-y-3 p-4"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--ledger-radius-control)",
          }}
        >
          <Eyebrow>Customer</Eyebrow>
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="grid place-items-center text-[15px] font-bold"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--color-accent-soft)",
                color: "var(--color-accent)",
                border: "1px solid color-mix(in oklch, var(--color-accent) 18%, transparent)",
              }}
            >
              {initialsOf(lead.customerName)}
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-[15px] font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {lead.customerName ?? "Unknown Customer"}
              </p>
              <Mono
                as="p"
                className="text-[12.5px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {lead.customerPhone ?? "Phone not available"}
              </Mono>
            </div>
          </div>
          <div className="flex gap-2">
            <LedgerButton
              variant="whatsapp"
              size="md"
              className="flex-1"
              onClick={() => {
                const phone = lead.customerPhone?.replace(/\D/g, "") ?? "";
                if (phone) {
                  window.open(`https://wa.me/${phone}`, "_blank", "noopener,noreferrer");
                }
              }}
              disabled={!lead.customerPhone}
            >
              <WhatsAppIcon size={15} />
              WhatsApp
            </LedgerButton>
            <LedgerButton
              variant="action"
              size="md"
              className="flex-1"
              onClick={
                lead.customerPhone
                  ? () => {
                      window.location.href = `tel:${lead.customerPhone}`;
                    }
                  : undefined
              }
              disabled={!lead.customerPhone}
              title={lead.customerPhone ? undefined : "Phone not available"}
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.8} />
              Call
            </LedgerButton>
          </div>
        </div>

        {/* Follow-ups — §14.5 */}
        <section
          className="space-y-3 p-4"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--ledger-radius-control)",
          }}
        >
          <div className="flex items-center justify-between">
            <Eyebrow>Follow-ups</Eyebrow>
            <button
              type="button"
              onClick={() => setShowFollowUpForm((p) => !p)}
              aria-label={showFollowUpForm ? "Hide follow-up form" : "Add follow-up"}
              className="-mr-1 rounded p-1 transition hover:bg-[var(--color-surface-raised)]"
              style={{ color: "var(--color-text-muted)" }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {showFollowUpForm ? (
            <div className="space-y-2 rounded-lg border border-border bg-muted p-2.5">
              {followUpError ? (
                <p className="text-[12px]" style={{ color: "var(--follow-overdue)" }}>{followUpError}</p>
              ) : null}
              <input
                type="date"
                className={inputCls}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
              <textarea
                className={inputCls}
                rows={2}
                placeholder="Note (optional)"
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFollowUpForm(false);
                    setFollowUpError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={followUpSubmitting || !followUpDate}
                  onClick={handleFollowUpSubmit}
                >
                  {followUpSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : null}

          {followUps.length === 0 ? (
            <p className="text-[12.5px]" style={{ color: "var(--color-text-muted)" }}>
              No follow-ups scheduled.
            </p>
          ) : (
            <div className="space-y-2">
              {followUps.map((fu) => {
                const isDone = fu.status === "done";
                const isCancelled = fu.status === "cancelled";
                const isTerminal = isDone || isCancelled;
                // §14.5: pending follow-ups get a 3px accent left edge,
                // done items use --follow-done, cancelled items go quiet.
                const edgeColor = isDone
                  ? "var(--follow-done)"
                  : isCancelled
                    ? "var(--color-border)"
                    : "var(--color-accent)";
                return (
                  <div
                    key={fu.id}
                    className="relative overflow-hidden p-2.5"
                    style={{
                      background: isTerminal
                        ? "var(--color-surface-raised)"
                        : "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--ledger-radius-control)",
                      opacity: isTerminal ? 0.7 : 1,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: edgeColor,
                      }}
                    />
                    <div className="flex items-start justify-between gap-2 pl-1.5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p
                            className="text-[13px] font-semibold"
                            style={{
                              color: isTerminal
                                ? "var(--color-text-muted)"
                                : "var(--color-text)",
                              textDecoration: isTerminal ? "line-through" : undefined,
                            }}
                          >
                            {formatDate(fu.scheduledAt)}
                          </p>
                          {isCancelled ? (
                            <span
                              className="text-[10px] font-bold uppercase tracking-[0.06em]"
                              style={{
                                background: "var(--follow-overdue-bg)",
                                color: "var(--follow-overdue)",
                                padding: "1px 7px",
                                borderRadius: "var(--ledger-radius-pill)",
                              }}
                            >
                              Cancelled
                            </span>
                          ) : null}
                        </div>
                        {fu.note ? (
                          <p
                            className="mt-0.5 truncate text-[12px]"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {fu.note}
                          </p>
                        ) : null}
                      </div>
                      {isDone ? (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0"
                          style={{ color: "var(--follow-done)" }}
                        />
                      ) : isCancelled ? (
                        <XCircle
                          className="h-4 w-4 shrink-0"
                          style={{ color: "var(--follow-overdue)" }}
                        />
                      ) : (
                        <div className="flex shrink-0 items-center gap-1">
                          <LedgerButton
                            variant="action"
                            size="sm"
                            className="h-6 px-2 text-[12px]"
                            onClick={() => void handleMarkDone(fu.id)}
                          >
                            Mark Done
                          </LedgerButton>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                aria-label="More actions"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => setReschedulingFollowUp(fu)}
                              >
                                Reschedule…
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setCancellingFollowUp(fu)}
                                destructive
                              >
                                Cancel follow-up…
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/*
        <LeadMeetingsSection
          meetings={meetings}
          isLoading={meetingsLoading}
          leadId={leadId}
          customerId={lead.customerId}
          customerName={lead.customerName ?? "Customer"}
          onMeetingCreated={refreshMeetings}
          onStatusChange={handleMeetingStatusChange}
        />

        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowTaskForm((p) => !p)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {showTaskForm ? (
            <div className="space-y-2 rounded-lg border border-zinc-100 bg-muted p-2.5">
              {taskError ? (
                <p className="text-[12px]" style={{ color: "var(--follow-overdue)" }}>{taskError}</p>
              ) : null}
              <input
                className={inputCls}
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <input
                type="date"
                className={inputCls}
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
              <select
                className={inputCls}
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option value="1">High</option>
                <option value="2">Medium</option>
                <option value="3">Low</option>
              </select>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowTaskForm(false);
                    setTaskError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={taskSubmitting || !taskTitle.trim()}
                  onClick={handleTaskSubmit}
                >
                  {taskSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : null}

          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tasks.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const isDone = task.status === "done";
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-2 rounded-lg border p-2.5 ${
                      isDone
                        ? "border-zinc-100 bg-muted opacity-60"
                        : "border-border bg-card"
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-green-500 disabled:opacity-50"
                      disabled={isDone}
                      onClick={() => void handleTaskDone(task.id)}
                      aria-label="Mark task done"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-xs font-medium ${
                          isDone ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {task.dueDate ? (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(task.dueDate)}
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-xs ${getPriorityClass(task.priority)}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        */}
      </div>

      {/* ══ Drawer / Modal ════════════════════════════════════════════════════ */}
      {/* <LeadWhatsAppChatDrawer
        isOpen={isChatOpen}
        lead={lead}
        onClose={() => setIsChatOpen(false)}
      /> */}

      {isInvoiceModalOpen ? (
        <CreateInvoiceModal
          leadId={leadId}
          initialInvoice={editingInvoice}
          initialTemplateId={pendingTemplateId}
          onSuccess={() => void handleInvoiceModalSuccess()}
          onClose={() => {
            handleInvoiceModalClose();
            setPendingTemplateId(null);
          }}
          onSaveAsTemplate={
            editingInvoice ? () => setSaveAsTemplateInvoice(editingInvoice) : undefined
          }
        />
      ) : null}

      <TemplatePickerDialog
        open={templatePickerOpen}
        title="Start invoice from template"
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={(template) => handleTemplatePicked(template.id)}
      />

      {saveAsTemplateInvoice ? (
        <SaveAsTemplateDialog
          open={saveAsTemplateInvoice !== null}
          invoiceId={saveAsTemplateInvoice.id}
          invoiceNumber={saveAsTemplateInvoice.invoiceNumber}
          defaultName={`${lead.title ?? "Template"}`}
          onClose={() => setSaveAsTemplateInvoice(null)}
          onSaved={() => setSaveAsTemplateInvoice(null)}
        />
      ) : null}

      {reschedulingFollowUp ? (
        <RescheduleFollowupDialog
          open={reschedulingFollowUp !== null}
          currentScheduledAt={reschedulingFollowUp.scheduledAt}
          onClose={() => setReschedulingFollowUp(null)}
          onConfirm={(input) =>
            handleRescheduleConfirm(reschedulingFollowUp.id, input)
          }
        />
      ) : null}

      {cancellingFollowUp ? (
        <CancelFollowupDialog
          open={cancellingFollowUp !== null}
          onClose={() => setCancellingFollowUp(null)}
          onConfirm={(reason) =>
            handleCancelConfirm(cancellingFollowUp.id, reason)
          }
        />
      ) : null}

      {viewer && attachmentsByActivity[viewer.activityId] ? (
        <ActivityAttachmentViewer
          attachments={attachmentsByActivity[viewer.activityId]}
          initialIndex={viewer.index}
          onClose={() => setViewer(null)}
          onDelete={handleAttachmentDelete}
        />
      ) : null}
    </div>
  );
}
