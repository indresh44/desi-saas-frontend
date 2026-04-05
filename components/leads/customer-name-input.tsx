"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchCustomers } from "@/lib/api/customers";
import { Customer } from "@/lib/types/customer";

type CustomerNameInputProps = {
  value: string;
  selectedCustomer: Customer | null;
  disabled?: boolean;
  autoFocus?: boolean;
  onValueChange: (nextValue: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  onClearSelection: () => void;
};

export function CustomerNameInput({
  value,
  selectedCustomer,
  disabled,
  autoFocus,
  onValueChange,
  onSelectCustomer,
  onClearSelection,
}: CustomerNameInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Customer[]>([]);
  const blurTimeoutRef = useRef<number | null>(null);

  const trimmedValue = value.trim();

  useEffect(() => {
    if (selectedCustomer) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (trimmedValue.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await searchCustomers(trimmedValue);
        setResults(data);
      } catch (searchError) {
        if (
          typeof searchError === "object" &&
          searchError !== null &&
          "message" in searchError &&
          typeof searchError.message === "string"
        ) {
          setError(searchError.message);
        } else {
          setError("Unable to search customers.");
        }
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedCustomer, trimmedValue]);

  const showDropdown = useMemo(
    () => isOpen && !selectedCustomer && trimmedValue.length >= 2,
    [isOpen, selectedCustomer, trimmedValue.length]
  );

  const handleFocus = () => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      blurTimeoutRef.current = null;
    }, 150);
  };

  return (
    <div className="relative">
      <label className="block text-sm text-zinc-700">
        <span className="font-medium">Customer Name</span>
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Type customer name"
            disabled={disabled}
            autoFocus={autoFocus}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100"
          />
        </div>
      </label>

      {selectedCustomer ? (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <span className="truncate">
            Using existing customer: {selectedCustomer.name}
          </span>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={disabled}
            onClick={onClearSelection}
            className="h-auto px-2 py-1 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        </div>
      ) : null}

      {showDropdown ? (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching customers...
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="px-3 py-2 text-sm text-red-600">{error}</div>
          ) : null}

          {!isLoading && !error && results.length > 0 ? (
            <div className="max-h-56 overflow-y-auto">
              {results.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left hover:bg-zinc-100"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelectCustomer(customer);
                    setIsOpen(false);
                  }}
                >
                  <p className="text-sm font-medium text-zinc-900">{customer.name}</p>
                  <p className="text-xs text-zinc-600">{customer.phone}</p>
                  {customer.email ? (
                    <p className="text-xs text-zinc-500">{customer.email}</p>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          {!isLoading && !error && results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-500">
              No existing customer found. We&apos;ll create a new one when you save.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}