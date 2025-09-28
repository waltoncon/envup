export function needsQuotes(value: string): boolean {
  // If the value contains spaces, quotes, or special shell characters, it should be quoted
  // This regex checks for spaces or characters that might need quoting
  const specialCharsRegex = /[\s"'\\$`!#&*(){}[\];<>?~|]/;
  return specialCharsRegex.test(value);
}

type FuncData = {
  value: string | undefined;
  [key: string]: string | undefined;
};
type FuncReturn = Promise<string | undefined> | string | undefined;
export type Func = (data: FuncData) => FuncReturn;
export function defineFunction(callback: Func) {
  return callback;
}
