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
 * Encode text using encodeURIComponent, preserving line structure.
 * Each line is encoded independently so output line count matches input.
 * Suitable for URL parameter values — encodes =, &, #, /, spaces, etc.
 * @param input - Plain text to encode (may contain newlines)
 * @returns UrlCodecResult with encoded output; success is always true
 */
export function encodeURIComponentSafe(input: string): UrlCodecResult {
  const lines = input.split('\n')
  const encoded = lines.map(line => encodeURIComponent(line)).join('\n')
  return {
    success: true,
    output: encoded
  }
}

/**
 * Encode text using encodeURI, preserving line structure.
 * Each line is encoded independently so output line count matches input.
 * Suitable for full URLs — preserves structural characters (: / ? # & = etc.)
 * @param input - Full URL or plain text to encode (may contain newlines)
 * @returns UrlCodecResult with encoded output; success is always true
 */
export function encodeURISafe(input: string): UrlCodecResult {
  const lines = input.split('\n')
  const encoded = lines.map(line => encodeURI(line)).join('\n')
  return {
    success: true,
    output: encoded
  }
}

/**
 * Decode URL-encoded string.
 * Strategy: try decodeURIComponent first (wider coverage), then fall back
 * to decodeURI as a defensive second attempt.
 * Returns success: false only when both decoders throw URIError (e.g. %GG).
 * @param input - URL-encoded string to decode
 * @returns UrlCodecResult with decoded output, or error details on failure
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
