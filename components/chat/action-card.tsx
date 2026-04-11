"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { AddLeadNoteForm } from "@/components/chat/action-forms/add-lead-note-form";
import { BulkFollowupForm } from "@/components/chat/action-forms/bulk-followup-form";
import { CompleteFollowupForm } from "@/components/chat/action-forms/complete-followup-form";
import { CreateInvoiceForm } from "@/components/chat/action-forms/create-invoice-form";
import { CreateLeadForm } from "@/components/chat/action-forms/create-lead-form";
import { RecordPaymentForm } from "@/components/chat/action-forms/record-payment-form";
import { RescheduleFollowupForm } from "@/components/chat/action-forms/reschedule-followup-form";
import { ScheduleFollowupForm } from "@/components/chat/action-forms/schedule-followup-form";
import { SendReminderForm } from "@/components/chat/action-forms/send-reminder-form";
import { UpdateInvoiceForm } from "./action-forms/update-invoice-form";
import { UpdateStageForm } from "@/components/chat/action-forms/update-stage-form";
import { useChat } from "@/lib/chat/chat-context";
import { ChatAction } from "@/lib/types/chat";

interface ActionCardProps {
  action: ChatAction;
  messageId: string;
}

export function ActionCard({ action, messageId }: ActionCardProps) {
  const { confirmAction, cancelAction } = useChat();
  const [editedData, setEditedData] = useState<Record<string, unknown>>({
    ...action.prefilled_data,
  });
  const [isConfirming, setIsConfirming] = useState(false);

  if (action.status === "confirmed") {
    return (
      <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs text-green-600">
        <Check className="h-3.5 w-3.5" />
        {action.display_label} confirmed
      </div>
    );
  }

  if (action.status === "cancelled") {
    return (
      <div className="mt-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground line-through">
        {action.display_label} cancelled
      </div>
    );
  }

  async function handleConfirm() {
    setIsConfirming(true);
    try {
      await confirmAction(action, editedData);
    } finally {
      setIsConfirming(false);
    }
  }

  function handleCancel() {
    cancelAction(messageId);
  }

  function renderForm() {
    switch (action.action_type) {
      case "create_lead":
        return <CreateLeadForm data={editedData} onChange={setEditedData} />;
      case "update_lead_stage":
        return <UpdateStageForm data={editedData} onChange={setEditedData} />;
      case "schedule_followup":
        return <ScheduleFollowupForm data={editedData} onChange={setEditedData} />;
      case "complete_followup":
        return <CompleteFollowupForm data={editedData} onChange={setEditedData} />;
      case "reschedule_followup":
        return <RescheduleFollowupForm data={editedData} onChange={setEditedData} />;
      case "bulk_update_followups":
        return <BulkFollowupForm data={editedData} onChange={setEditedData} />;
      case "create_invoice":
      case "confirm_create_invoice":
        return <CreateInvoiceForm data={editedData} onChange={setEditedData} />;
      case "update_invoice":
      case "confirm_update_invoice":
        return <UpdateInvoiceForm data={editedData} onChange={setEditedData} />;
      case "add_lead_note":
      case "confirm_add_lead_note":
        return <AddLeadNoteForm data={editedData} onChange={setEditedData} />;
      case "record_payment":
      case "confirm_record_payment":
        return <RecordPaymentForm data={editedData} onChange={setEditedData} />;
      case "send_payment_reminder":
      case "confirm_send_payment_reminder":
        return <SendReminderForm data={editedData} onChange={setEditedData} />;
      default:
        return (
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
            {JSON.stringify(editedData, null, 2)}
          </pre>
        );
    }
  }

  return (
    <div className="mt-1.5 rounded-lg border border-border bg-card p-3">
      <p className="mb-2 text-xs font-medium text-primary">{action.display_label}</p>

      {renderForm()}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={isConfirming}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isConfirming ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          Confirm
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isConfirming}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
      </div>
    </div>
  );
}
