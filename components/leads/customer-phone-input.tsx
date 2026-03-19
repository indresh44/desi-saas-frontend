"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { searchCustomers } from "@/lib/api/customers";
import { Customer } from "@/lib/types/customer";
import { Button } from "@/components/ui/button";

type CustomerPhoneInputProps = {
  phone: string;
  selectedCustomer: Customer | null;
  disabled?: boolean;
  onPhoneChange: (nextPhone: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  onClearSelection: () => void;
};

export function CustomerPhoneInput({
  phone,
  selectedCustomer,
  disabled,
  onPhoneChange,
  onSelectCustomer,
  onClearSelection,
}: CustomerPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Customer[]>([]);
  const blurTimeoutRef = useRef<number | null>(null);

  const trimmedPhone = phone.trim();

  useEffect(() => {
    if (selectedCustomer) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (trimmedPhone.length < 3) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await searchCustomers(trimmedPhone);
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
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedCustomer, trimmedPhone]);

  const showDropdown = useMemo(
    () => isOpen && !selectedCustomer && trimmedPhone.length >= 3,
    [isOpen, selectedCustomer, trimmedPhone.length]
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

  const handleChange = (nextPhone: string) => {
    if (selectedCustomer && nextPhone !== selectedCustomer.phone) {
      onClearSelection();
    }
    onPhoneChange(nextPhone);
  };

  return (
    <div className="relative">
      <label className="block text-sm text-zinc-700">
        <span className="font-medium">Phone</span>
        <input
          value={phone}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Enter phone number"
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
      </label>

      {selectedCustomer ? (
        <div className="mt-2 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          <span>
            Selected existing customer: {selectedCustomer.name} ({selectedCustomer.phone})
          </span>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={disabled}
            onClick={onClearSelection}
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
              No customer found - will create new.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}