/**
 * Base64 encode/decode utility functions.
 * All functions are pure — no side effects.
 * Supports standard, URL-safe, and base64url formats.
 */

export interface Base64CodecResult {
  success: boolean
  output: string
  error?: string
}

export type Base64Format = 'standard' | 'url-safe' | 'base64url'

/**
 * Encode text to Base64.
 * Uses UTF-8 encoding for non-ASCII characters.
 * @param input - Plain text to encode
 * @param format - Base64 format variant
 * @returns Base64CodecResult with encoded output
 */
export function encodeBase64(input: string, format: Base64Format): Base64CodecResult {
  try {
    // Convert string to UTF-8 bytes
    const encoder = new TextEncoder()
    const bytes = encoder.encode(input)

    // Convert bytes to binary string
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }

    // Encode to standard Base64
    let base64 = btoa(binary)

    // Convert to requested format
    if (format === 'url-safe') {
      base64 = base64.replace(/\+/g, '-').replace(/\//g, '_')
    } else if (format === 'base64url') {
      base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }

    return { success: true, output: base64 }
  } catch (e) {
    const err = e as Error
    return { success: false, output: '', error: err.message }
  }
}

/**
 * Decode Base64 to text.
 * Auto-detects format (standard, URL-safe, base64url).
 * Uses UTF-8 decoding for non-ASCII characters.
 * @param input - Base64 encoded string
 * @returns Base64CodecResult with decoded output
 */
export function decodeBase64(input: string): Base64CodecResult {
  try {
    if (!input) {
      return { success: true, output: '' }
    }

    // Normalize: convert URL-safe chars to standard
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if missing
    const padding = base64.length % 4
    if (padding === 2) {
      base64 += '=='
    } else if (padding === 3) {
      base64 += '='
    }

    // Decode from Base64
    const binary = atob(base64)

    // Convert binary string to bytes
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    // Decode UTF-8 bytes to string
    const decoder = new TextDecoder()
    const output = decoder.decode(bytes)

    return { success: true, output }
  } catch {
    return { success: false, output: '', error: '无效的Base64格式' }
  }
}

/**
 * Detect Base64 format from input string.
 * @param input - Base64 encoded string
 * @returns Detected format
 */
export function detectBase64Format(input: string): Base64Format {
  if (!input) {
    return 'standard'
  }

  // Check for URL-safe characters
  if (input.includes('-') || input.includes('_')) {
    // Check if padding is present
    if (input.includes('=')) {
      return 'url-safe'
    }
    return 'base64url'
  }

  // No URL-safe chars — check for padding
  if (!input.includes('=')) {
    // No padding and no URL-safe chars → base64url
    return 'base64url'
  }

  return 'standard'
}
