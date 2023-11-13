export const valueType = (value: unknown): string =>
  Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
