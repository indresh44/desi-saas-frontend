/**
 * Indian mobile phone validation.
 *
 * Accepts (after stripping spaces / dashes / parens):
 *   - 10 digits starting with 6/7/8/9                        e.g. 9876543210
 *   - "91" or "+91" followed by a 10-digit mobile             e.g. +919876543210
 *
 * Landlines are intentionally rejected — MSME customers are mobile-only in
 * practice, and the duplicate-phone guard on the backend treats different
 * country-code formats as different numbers, so being strict up front
 * prevents accidental dupes (`9876543210` vs `+919876543210`).
 *
 * Mirrors what `app/core/phone.py::normalize_phone_value` accepts on the
 * backend, with the extra mobile-prefix rule the backend doesn't enforce.
 */

const MOBILE_REGEX = /^[6-9]\d{9}$/;

export type PhoneValidationResult =
  | { ok: true; normalized: string; e164: string }
  | { ok: false; reason: string };

export function validateIndianMobile(input: string): PhoneValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, reason: "Phone is required." };
  }

  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");

  let local = digitsOnly;
  if (hasPlus || digitsOnly.length === 12) {
    if (!digitsOnly.startsWith("91")) {
      return {
        ok: false,
        reason: "Only Indian numbers (+91) are supported.",
      };
    }
    local = digitsOnly.slice(2);
  }

  if (local.length !== 10) {
    return {
      ok: false,
      reason: "Enter a 10-digit mobile number.",
    };
  }

  if (!MOBILE_REGEX.test(local)) {
    return {
      ok: false,
      reason: "Mobile numbers start with 6, 7, 8, or 9.",
    };
  }

  return {
    ok: true,
    normalized: local,
    e164: `+91${local}`,
  };
}

export function isValidIndianMobile(input: string): boolean {
  return validateIndianMobile(input).ok;
}
