"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileText,
  Loader2,
  MessageCircle,
  Phone,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadWhatsAppChatDrawer } from "@/components/whatsapp/lead-whatsapp-chat-drawer";
import { CreateInvoiceModal } from "@/components/leads/create-invoice-modal";
import { InvoiceCard } from "@/components/leads/invoice-card";
import { SaveAsTemplateDialog } from "@/components/invoices/templates/save-as-template-dialog";
import { TemplatePickerDialog } from "@/components/invoices/templates/template-picker-dialog";
import { LeadNotes } from "@/components/leads/lead-notes";
import { useLookupMaps } from "@/hooks/use-lookup-maps";
import { fetchLeads, moveLeadStage, updateLeadNotes } from "@/lib/api/leads";
import { createActivity, fetchLeadActivities } from "@/lib/api/activities";
import {
  createFollowUp,
  fetchLeadFollowUps,
  markFollowUpDone,
} from "@/lib/api/followups";
import { fetchLeadInvoices } from "@/lib/api/invoices";
import type { Lead } from "@/lib/types/lead";
import type { ActivityType, LeadActivity } from "@/lib/types/activity";
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

function ActivityIcon({ type }: { type: ActivityType }) {
  const cls = "h-3.5 w-3.5";
  if (type === "call") return <Phone className={`${cls} text-blue-500`} />;
  if (type === "whatsapp") return <MessageCircle className={`${cls} text-green-500`} />;
  if (type === "meeting") return <Users className={`${cls} text-purple-500`} />;
  return <FileText className={`${cls} text-muted-foreground`} />;
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

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";

// ─── Main component ──────────────────────────────────────────────────────────

export default function LeadDetailClient({ leadId }: { leadId: string }) {
  const { stageMap, isLoading: isLoadingStages } = useLookupMaps();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
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

  const refreshActivities = useCallback(async () => {
    const data = await fetchLeadActivities(leadId);
    setActivities(
      [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
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

  const handleActivitySubmit = async () => {
    if (!activityDesc.trim()) return;
    setActivitySubmitting(true);
    setActivityError(null);
    try {
      await createActivity(
        { lead_id: leadId, type: activityType, description: activityDesc.trim() }
      );
      setActivityDesc("");
      setActivityType("note");
      setShowActivityForm(false);
      await refreshActivities();
    } catch (err) {
      setActivityError(extractErrorMessage(err, "Unable to log activity."));
    } finally {
      setActivitySubmitting(false);
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError || !lead) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-red-600">{loadError ?? "Lead not found."}</p>
        <Link href="/leads">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* ══ LEFT COLUMN ═══════════════════════════════════════════════════════ */}
      <div className="min-w-0 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Leads
          </Link>

          <div className="flex flex-wrap items-start gap-3">
            <h1 className="flex-1 text-2xl font-bold leading-tight text-primary">
              {lead.title}
            </h1>
            {(lead.stageName || lead.stageId) ? (
              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-foreground"
                style={{
                  backgroundColor:
                    lead.stageColor ?? stageMap[lead.stageId]?.color ?? "#e4e4e7",
                }}
              >
                {lead.stageName ?? stageMap[lead.stageId]?.name ?? lead.stageId}
              </span>
            ) : null}

            <select
              value={selectedStageId}
              onChange={(e) => {
                const nextStageId = e.target.value;
                setSelectedStageId(nextStageId);
                void handleStageChange(nextStageId);
              }}
              className="w-full rounded-lg border px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-44"
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
          </div>

          {stageMoveError ? (
            <p className="text-xs text-red-600">{stageMoveError}</p>
          ) : null}

          {stageMoveSuccess ? (
            <p className="text-xs text-green-600">{stageMoveSuccess}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {lead.estimatedValue ? (
              <span className="font-semibold text-foreground">
                {formatRupees(lead.estimatedValue)}
              </span>
            ) : null}
            {lead.source ? (
              <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {lead.source}
              </span>
            ) : null}
            {lead.serviceDate ? (
              <span className="text-xs text-muted-foreground">
                Service: {formatDate(lead.serviceDate)}
              </span>
            ) : null}
          </div>

        </div>

        <LeadNotes
          leadId={leadId}
          initialNotes={lead.notes || ""}
          onSave={handleSaveNotes}
        />

        {/* Activity Log */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">Activity</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowActivityForm((p) => !p)}
            >
              <Plus className="h-3.5 w-3.5" />
              Log Activity
            </Button>
          </div>

          {showActivityForm ? (
            <div className="space-y-2 rounded-xl border bg-card p-3">
              {activityError ? (
                <p className="text-xs text-red-600">{activityError}</p>
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
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowActivityForm(false);
                    setActivityDesc("");
                    setActivityError(null);
                  }}
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
          ) : null}

          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <ActivityIcon type={a.type} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-foreground">
                      {a.description}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {timeAgo(a.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Invoices */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">Invoices</h2>
            <div className="inline-flex items-center gap-0.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCreateInvoice}
                className="rounded-r-none"
              >
                <Plus className="h-3.5 w-3.5" />
                New Invoice
              </Button>
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
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
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
        {/* Customer card */}
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold text-primary">Customer</h2>
          <p className="text-sm font-medium text-foreground">
            {lead.customerName ?? "Unknown Customer"}
          </p>
          <p className="text-xs text-muted-foreground">
            {lead.customerPhone ?? "Phone not available"}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => {
                const phone = lead.customerPhone?.replace(/\D/g, "") ?? "";
                if (phone) {
                  window.open(`https://wa.me/${phone}`, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
            {lead.customerPhone ? (
              <a href={`tel:${lead.customerPhone}`} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </Button>
              </a>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                disabled
                title="Phone not available"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </Button>
            )}
          </div>
        </div>

        {/* Follow-ups */}
        <section className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">Follow-ups</h2>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowFollowUpForm((p) => !p)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {showFollowUpForm ? (
            <div className="space-y-2 rounded-lg border border-border bg-muted p-2.5">
              {followUpError ? (
                <p className="text-xs text-red-600">{followUpError}</p>
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
            <p className="text-xs text-muted-foreground">No follow-ups scheduled.</p>
          ) : (
            <div className="space-y-2">
              {followUps.map((fu) => {
                const isDone = fu.status === "done";
                return (
                  <div
                    key={fu.id}
                    className={`rounded-lg border p-2.5 ${
                      isDone
                        ? "border-border bg-muted opacity-60"
                        : "border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-medium ${
                            isDone
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {formatDate(fu.scheduledAt)}
                        </p>
                        {fu.note ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {fu.note}
                          </p>
                        ) : null}
                      </div>
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-6 shrink-0 px-2 text-xs"
                          onClick={() => void handleMarkDone(fu.id)}
                        >
                          Mark Done
                        </Button>
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
                <p className="text-xs text-red-600">{taskError}</p>
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
    </div>
  );
}
