"use client";

import { FormEvent, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";

type MessageComposerProps = {
  isDisabled: boolean;
  isSending: boolean;
  onSend: (text: string) => Promise<void>;
};

export function MessageComposer({
  isDisabled,
  isSending,
  onSend,
}: MessageComposerProps) {
  const [value, setValue] = useState("");
  const trimmedValue = value.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedValue || isDisabled || isSending) {
      return;
    }

    await onSend(trimmedValue);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        rows={2}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={isDisabled || isSending}
        placeholder={isDisabled ? "Messaging is blocked" : "Type a message"}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
      />
      <Button
        type="submit"
        disabled={isDisabled || isSending || !trimmedValue}
        className="shrink-0"
      >
        <SendHorizonal className="h-4 w-4" />
        {isSending ? "Sending..." : "Send"}
      </Button>
    </form>
  );
}
