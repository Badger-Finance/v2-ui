// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_keyby

function arrayKeyBy(arr: Array<any>, key: string): Record<string, any> {
  return arr.reduce((accum, value) => ({ ...accum, [key ? value[key] : value]: value }), {});
}

export function keyBy(collection: Array<any> | Record<string, any>, key: string): Record<string, any> {
  if (Array.isArray(collection))
    return arrayKeyBy(collection, key);
  else
    return arrayKeyBy(Object.values(collection), key);
}

export function forIn<T>(obj: Record<string, T>, fun: (val: T) => void) {
  Object.entries(obj).forEach(prop => {
    const [_, val] = prop as [string, T];
    fun(val);
  });
}

export function compact(arr: Array<any>) {
  return arr.filter(Boolean);
}

export function flatten(arr: Array<any>) {
  return arr.flat();
}

export function map<T>(collection: Record<string, T> | T[], fun: (value: T, key: string | number) => any): any[] {
  if (Array.isArray(collection)) {
    return collection.map((value, index) => fun(value, index));
  }
  const result: any[] = [];
  Object.entries(collection).forEach(prop => {
    const [key, value] = prop;
    result.push(fun(value, key));
  });
  return result;
}

export function mapValues<T>(obj: Record<string, T>, fun: (value: T, key: string) => any): Record<string, any> {
  const newObj: Record<string, any> = {...obj};
  Object.entries(obj).forEach(prop => {
    const [key, value] = prop;
    newObj[key] = fun(value, key);
  });
  return newObj;
}

export function values<T>(obj: Record<string, T>): T[] {
  return Object.values(obj);
}

export function valuesIn(obj: Object): any[] {
  return baseKeysIn(obj).map(val => obj[val]);
}

// based on lodash src -> pushes all own and inherited keys to array, except for the constructor in the case of prototype objects
function baseKeysIn(obj: Object): string[] {
  const isProto = isPrototype(obj)
  const result = [];

  for (let key in obj) {
    if (!(key === 'constructor' && (isProto || !obj.hasOwnProperty(key)))) {
      result.push(key);
    }
  }
  return result;
}

// based on lodash src, returns true if value is a prototype object
function isPrototype(value) {
  const Ctor = value && value.constructor;
  const proto = (typeof Ctor === 'function' && Ctor.prototype) || Object.prototype;
  return value === proto;
}

