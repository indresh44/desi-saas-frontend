"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error("DropdownMenu components must be used within DropdownMenu");
  return ctx;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);
  const value = useMemo(() => ({ open, setOpen, anchorRef }), [open]);
  return <DropdownMenuContext.Provider value={value}>{children}</DropdownMenuContext.Provider>;
}

export function DropdownMenuTrigger({
  children,
  asChild = false,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const { open, setOpen, anchorRef } = useDropdown();
  const localRef = useRef<HTMLButtonElement | null>(null);

  const handleClick = useCallback(() => {
    anchorRef.current = localRef.current;
    setOpen(!open);
  }, [anchorRef, open, setOpen]);

  if (asChild) {
    return (
      <span
        ref={(el) => {
          localRef.current = el as unknown as HTMLButtonElement;
        }}
        onClick={handleClick}
        className="inline-flex"
      >
        {children}
      </span>
    );
  }

  return (
    <button
      ref={localRef}
      type="button"
      aria-expanded={open}
      onClick={handleClick}
      className="inline-flex items-center"
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function DropdownMenuContent({ children, align = "end", className }: DropdownMenuContentProps) {
  const { open, setOpen, anchorRef } = useDropdown();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const top = rect.bottom + 4;
    const left = align === "end" ? rect.right : rect.left;
    setPosition({ top, left });
  }, [open, anchorRef, align]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      if (anchorRef.current && anchorRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen, anchorRef]);

  if (!open || !position) return null;

  const style =
    align === "end"
      ? { top: position.top, right: window.innerWidth - position.left }
      : { top: position.top, left: position.left };

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{ position: "fixed", zIndex: 60, ...style }}
      className={cn(
        "min-w-[180px] rounded-lg border border-border bg-card p-1 shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  destructive = false,
  disabled = false,
}: {
  children: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const { setOpen } = useDropdown();
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        setOpen(false);
        onSelect();
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
        destructive && "text-red-600 hover:bg-red-50 hover:text-red-700"
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
