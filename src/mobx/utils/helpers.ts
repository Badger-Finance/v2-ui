export const numberWithCommas = (x: string): string => {
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export const minBalance = (decimals: number): number =>
  Number(`0.${'0'.repeat(decimals - 1)}1`);

/**
 * If the parameter is a string, return an array with that string as the only element. Otherwise, return the parameter as
 * an array.
 * @param {string | string[]} [param] - The parameter to parse.
 */
export function parseQueryMultipleParams<T extends string>(
  param?: string | number | boolean | string[],
): T[] | undefined {
  if (!param) {
    return undefined;
  }

  if (typeof param === 'string') {
    return [param as T];
  }

  return param as T[];
}
