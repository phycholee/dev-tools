/**
 * Unicode encode/decode utility functions.
 * All functions are pure — no side effects.
 */

export interface UnicodeCodecResult {
  success: boolean
  output: string
  error?: string
}

export type UnicodeEncodeMode = 'all' | 'non-ascii'

function toUnicodeEscape(codeUnit: number): string {
  return `\\u${codeUnit.toString(16).toUpperCase().padStart(4, '0')}`
}

/**
 * Encode text to JavaScript Unicode escape sequences.
 * @param input - Plain text to encode
 * @param mode - Whether to encode every character or only non-ASCII characters
 * @returns UnicodeCodecResult with encoded output
 */
export function encodeUnicode(
  input: string,
  mode: UnicodeEncodeMode
): UnicodeCodecResult {
  let output = ''

  for (let i = 0; i < input.length; i++) {
    const codeUnit = input.charCodeAt(i)

    if (mode === 'non-ascii' && codeUnit <= 0x7f) {
      output += input[i]
    } else {
      output += toUnicodeEscape(codeUnit)
    }
  }

  return { success: true, output }
}

/**
 * Decode valid \uXXXX sequences while preserving invalid sequences as-is.
 * @param input - Text that may contain JavaScript Unicode escape sequences
 * @returns UnicodeCodecResult with decoded output
 */
export function decodeUnicode(input: string): UnicodeCodecResult {
  const output = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  )

  return { success: true, output }
}