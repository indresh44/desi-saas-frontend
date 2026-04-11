"use client";

interface CreateLeadFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

const LEAD_SOURCES = [
  { value: "", label: "Select source" },
  { value: "walk_in", label: "Walk-in" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "referral", label: "Referral" },
  { value: "instagram", label: "Instagram" },
  { value: "justdial", label: "JustDial" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

export function CreateLeadForm({ data, onChange }: CreateLeadFormProps) {
  function update(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  const currentSource = (data.source as string | undefined) ?? "";
  const isKnownSource = LEAD_SOURCES.some((s) => s.value === currentSource);

  return (
    <div className="space-y-2">
      <ActionField
        label="Title"
        value={(data.title as string | undefined) ?? ""}
        onChange={(value) => update("title", value)}
      />
      <ActionField
        label="Customer Name"
        value={(data.customer_name as string | undefined) ?? ""}
        onChange={(value) => update("customer_name", value)}
      />
      <ActionField
        label="Phone"
        value={(data.customer_phone as string | undefined) ?? ""}
        onChange={(value) => update("customer_phone", value)}
        type="tel"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Source
          </label>
          <select
            value={isKnownSource ? currentSource : "other"}
            onChange={(e) => update("source", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            {LEAD_SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>
        <ActionField
          label="Value (Rs)"
          value={data.estimated_value != null ? String(data.estimated_value) : ""}
          onChange={(value) => update("estimated_value", value ? Number(value) : null)}
          type="number"
        />
      </div>
      <ActionField
        label="Notes"
        value={(data.notes as string | undefined) ?? ""}
        onChange={(value) => update("notes", value)}
        multiline
      />
    </div>
  );
}

interface ActionFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  readOnly?: boolean;
}

export function ActionField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  multiline = false,
  readOnly = false,
}: ActionFieldProps) {
  const inputClass =
    "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:bg-muted disabled:text-muted-foreground";

  return (
    <div>
      {label ? (
        <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
      ) : null}
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={inputClass}
        />
      )}
    </div>
  );
}
