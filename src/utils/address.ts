// Lightweight address parsing helper for inputs like:
//   "123 Main St, Denver, CO 80202"
// Returns { line1, city, state, zipCode } or null if pattern unsupported.
// This is intentionally simple and can be expanded later.
export interface ParsedAddress {
  line1: string;
  city: string;
  state: string;
  zipCode: string;
}

const ADDRESS_REGEX = /^(.*?),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})(?:-\d{4})?$/i;

export function parseAddress(input: string): ParsedAddress | null {
  if (!input) return null;
  const match = input.trim().match(ADDRESS_REGEX);
  if (!match) return null;
  const [, line1Raw, cityRaw, stateRaw, zipRaw] = match;
  return {
    line1: line1Raw.trim(),
    city: cityRaw.trim(),
    state: stateRaw.trim().toUpperCase(),
    zipCode: zipRaw.trim(),
  };
}

export function isValidParsedAddress(addr: ParsedAddress | null): addr is ParsedAddress {
  return !!addr && !!addr.city && !!addr.state && !!addr.zipCode;
}
