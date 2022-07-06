export const numberWithCommas = (x: string): string => {
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

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

// https://stackoverflow.com/a/56150320
export function stringifyMap(map: Map<string, unknown>): string {
  return JSON.stringify(map, (key, value) => {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()),
      };
    } else {
      return value;
    }
  });
}

export function parseStringifyMap(serializedMap: string) {
  return JSON.parse(serializedMap, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  });
}
