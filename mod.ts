import { run } from "./deps.ts";

const BASE64_REGEX = /^[a-zA-Z0-9+/]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Check that a prefix is valid.
 * @param prefix The prefix to check.
 * @returns True if the prefix is valid, false otherwise.
 */
export function isValidPrefix(prefix: string | undefined): prefix is string {
  return isNonEmptyString(prefix) && BASE64_REGEX.test(prefix);
}

/**
 * Generates a new key pair for wireguard, using the wg command.
 * @returns [privateKey, publicKey]
 */
export async function nextKeyPair(): Promise<[string, string]> {
  const privateKey: string = await run("wg genkey");
  const publicKey: string = await run("wg pubkey", { stdin: privateKey });
  return [privateKey, publicKey];
}

/**
 * Brute-forces a key pair for wireguard, using the wg command, until a key pair
 * is found where the public key part matches the given prefix.
 * @param prefix The prefix to match.
 * @param abortSignal An optional AbortSignal to abort the search.
 * @returns [privateKey, publicKey]
 * @throws Error if the prefix is invalid.
 */
export async function nextMatchingKeyPair(
  prefix: string,
  abortSignal?: AbortSignal,
): Promise<[string, string]> {
  if (!isValidPrefix(prefix)) {
    throw new Error(
      "ERROR: Prefix must be a non-empty string of base64 characters.",
    );
  }
  try {
    while (!abortSignal?.aborted) {
      const [privateKey, publicKey] = await nextKeyPair();
      if (publicKey.toLowerCase().startsWith(prefix.toLowerCase())) {
        return [privateKey, publicKey];
      }
    }
    // if aborted, result doesn't matter
    return ["", ""];
  } catch (error) {
    if (abortSignal?.aborted) {
      // if aborted on purpose, let's not bother caller with the error
      return ["", ""];
    }
    throw error;
  }
}
