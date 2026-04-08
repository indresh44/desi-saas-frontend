"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type LeadNotesProps = {
  leadId: string;
  initialNotes: string;
  onSave: (notes: string) => Promise<void>;
};

export function LeadNotes({ leadId, initialNotes, onSave }: LeadNotesProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialNotes || "");

  useEffect(() => {
    setNotes(initialNotes || "");
    lastSavedRef.current = initialNotes || "";
  }, [initialNotes]);

  const clearSaveTimeout = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  const clearStatusTimeout = () => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
  };

  const setTransientStatus = useCallback((status: Exclude<SaveStatus, "idle">) => {
    clearStatusTimeout();
    setSaveStatus(status);
    statusTimeoutRef.current = setTimeout(
      () => setSaveStatus("idle"),
      status === "saved" ? 2000 : 3000,
    );
  }, []);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (isEditing) {
      autoResize();
    }
  }, [autoResize, isEditing, notes]);

  const runSave = useCallback(
    async (value: string) => {
      if (value === lastSavedRef.current) {
        return;
      }

      clearStatusTimeout();
      setSaveStatus("saving");
      try {
        await onSave(value);
        lastSavedRef.current = value;
        setTransientStatus("saved");
      } catch {
        setTransientStatus("error");
      }
    },
    [onSave, setTransientStatus],
  );

  const debouncedSave = useCallback(
    (value: string) => {
      clearSaveTimeout();
      if (value === lastSavedRef.current) {
        return;
      }

      saveTimeoutRef.current = setTimeout(() => {
        void runSave(value);
      }, 1000);
    },
    [runSave],
  );

  const handleBlur = useCallback(async () => {
    setIsEditing(false);
    clearSaveTimeout();
    await runSave(notes);
  }, [notes, runSave]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setNotes(value);
    debouncedSave(value);
  };

  const focusTextareaAtEnd = () => {
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.focus();
      const len = textarea.value.length;
      textarea.setSelectionRange(len, len);
    }, 0);
  };

  const handleClick = () => {
    setIsEditing(true);
    focusTextareaAtEnd();
  };

  useEffect(() => {
    return () => {
      clearSaveTimeout();
      clearStatusTimeout();
    };
  }, []);

  return (
    <section className="space-y-2 rounded-xl border bg-card p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary">Notes</h2>
        <span
          className={`text-xs transition-opacity duration-300 ${
            saveStatus === "idle" ? "opacity-0" : "opacity-100"
          }`}
          aria-live="polite"
          data-lead-id={leadId}
        >
          {saveStatus === "saving" ? (
            <span className="text-muted-foreground">Saving...</span>
          ) : null}
          {saveStatus === "saved" ? (
            <span className="text-green-600">Saved ✓</span>
          ) : null}
          {saveStatus === "error" ? (
            <span className="text-red-600">Failed to save</span>
          ) : null}
        </span>
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleChange}
          onBlur={() => {
            void handleBlur();
          }}
          className="w-full min-h-[96px] resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          placeholder="Add notes — requirements, specs, reminders..."
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleClick();
            }
          }}
          className="min-h-[44px] cursor-text rounded-lg px-3 py-2 text-sm leading-relaxed transition-colors hover:bg-muted/60"
        >
          {notes ? (
            <p className="whitespace-pre-wrap text-foreground">{notes}</p>
          ) : (
            <p className="italic text-muted-foreground">Click to add notes...</p>
          )}
        </div>
      )}
    </section>
  );
}
