// Lightweight address parsing helper for inputs like:
//   "123 Main St, Denver, CO 80202"
// Returns { line1, city, state, zipCode } or null if pattern unsupported.
// This is intentionally simple and can be expanded later.
export interface ParsedAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  zipPlus4?: string;
}

// Supports formats like:
//  "123 Main St Apt 4B, Denver, CO 80202"
//  "123 Main St #12, Denver, CO 80202-1234"
//  "123 Main St, Denver, CO 80202"
// Captures (line1 + optional line2 tokens before comma), city, state, zip, optional +4
const ADDRESS_REGEX =
  /^(.*?)(?:\s+(?:Apt|Apartment|Unit|Suite|Ste\.?|#)\s*([A-Za-z0-9-]+))?,\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})(?:-(\d{4}))?$/i;

export function parseAddress(input: string): ParsedAddress | null {
  if (!input) return null;
  const match = input.trim().match(ADDRESS_REGEX);
  if (!match) return null;
  const [, line1Raw, line2Raw, cityRaw, stateRaw, zipRaw, zip4Raw] = match;
  const parsed: ParsedAddress = {
    line1: line1Raw.trim(),
    city: cityRaw.trim(),
    state: stateRaw.trim().toUpperCase(),
    zipCode: zipRaw.trim(),
  };
  if (line2Raw) parsed.line2 = line2Raw.trim();
  if (zip4Raw) parsed.zipPlus4 = zip4Raw.trim();
  return parsed;
}

export function isValidParsedAddress(addr: ParsedAddress | null): addr is ParsedAddress {
  return !!addr && !!addr.city && !!addr.state && !!addr.zipCode;
}
