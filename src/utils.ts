export function needsQuotes(value: string): boolean {
  // If the value contains spaces, quotes, or special shell characters, it should be quoted
  // This regex checks for spaces or characters that might need quoting
  const specialCharsRegex = /[\s"'\\$`!#&*(){}[\];<>?~|]/;
  return specialCharsRegex.test(value);
}
