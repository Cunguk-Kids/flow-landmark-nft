/**
 * Flow blockchain utility functions
 */

/**
 * Validate and format Flow address for FCL/Cadence
 * Flow addresses are 8 bytes (16 hex characters) WITH 0x prefix for FCL
 */
export function formatFlowAddress(address: string | undefined | null): string {
  if (!address) {
    throw new Error("Address is required");
  }

  // Remove whitespace
  let cleaned = address.trim();

  // Check if it has 0x prefix
  const hasPrefix = /^0x/i.test(cleaned);

  // Remove 0x prefix temporarily for validation
  cleaned = cleaned.replace(/^0x/i, "");

  // Validate hex string
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
    throw new Error(`Invalid address format: ${address}. Must be hexadecimal.`);
  }

  // Pad with leading zeros to 16 characters if needed
  cleaned = cleaned.padStart(16, "0");

  // Validate length
  if (cleaned.length !== 16) {
    throw new Error(
      `Invalid address length: ${address}. Flow addresses must be 16 hex characters (8 bytes).`
    );
  }

  // Return WITH 0x prefix (required by FCL)
  return `0x${cleaned.toLowerCase()}`;
}

/**
 * Check if string is a valid Flow address
 */
export function isValidFlowAddress(address: string | undefined | null): boolean {
  if (!address) return false;

  try {
    formatFlowAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format address for display (with 0x prefix)
 * This is now the same as formatFlowAddress since it returns with 0x
 */
export function displayFlowAddress(address: string): string {
  if (!address) return "";
  return formatFlowAddress(address);
}

/**
 * Shorten address for display (e.g., 0x1234...5678)
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";

  const formatted = formatFlowAddress(address);

  if (formatted.length <= chars * 2 + 2) {
    return formatted;
  }

  return `${formatted.slice(0, chars + 2)}...${formatted.slice(-chars)}`;
}
