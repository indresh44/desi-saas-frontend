"use client";

interface CreateLeadFormProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function CreateLeadForm({ data, onChange }: CreateLeadFormProps) {
  function update(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

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
        <ActionField
          label="Source"
          value={(data.source as string | undefined) ?? ""}
          onChange={(value) => update("source", value)}
          placeholder="e.g. WhatsApp, Referral"
        />
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
    "w-full rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-amber-300 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-500";

  return (
    <div>
      {label ? (
        <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-amber-700">
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
