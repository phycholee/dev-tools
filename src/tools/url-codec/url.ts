// src/tools/url-codec/url.ts
/**
 * URL encode/decode utility functions.
 * All functions are pure — no side effects.
 */

export interface UrlCodecResult {
  success: boolean
  output: string
  error?: string
}

/**
 * Encode text using encodeURIComponent.
 * Suitable for URL parameter values — encodes =, &, #, /, spaces, etc.
 * Always returns success: true for valid JS strings.
 * @param input - Plain text to encode
 */
export function encodeURIComponentSafe(input: string): UrlCodecResult {
  return {
    success: true,
    output: encodeURIComponent(input)
  }
}

/**
 * Encode text using encodeURI.
 * Suitable for full URLs — preserves structural characters (: / ? # & = etc.)
 * Always returns success: true for valid JS strings.
 * @param input - Full URL or plain text to encode
 */
export function encodeURISafe(input: string): UrlCodecResult {
  return {
    success: true,
    output: encodeURI(input)
  }
}

/**
 * Decode URL-encoded string.
 * Strategy: try decodeURIComponent first (wider coverage), then fall back
 * to decodeURI as a defensive second attempt.
 * Returns success: false only when both decoders throw URIError (e.g. %GG).
 * @param input - URL-encoded string to decode
 */
export function decodeUrlSafe(input: string): UrlCodecResult {
  try {
    return { success: true, output: decodeURIComponent(input) }
  } catch {
    try {
      return { success: true, output: decodeURI(input) }
    } catch (e) {
      const err = e as Error
      return { success: false, output: '', error: err.message }
    }
  }
}
