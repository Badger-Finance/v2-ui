// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_keyby

function arrayKeyBy(arr: Array<any>, key: string): Record<string, any> {
	return (arr || []).reduce((accum, value) => ({ ...accum, [key ? value[key] : value]: value }), {});
}

export function keyBy(collection: Array<any> | Record<string, any>, key: string): Record<string, any> {
	if (Array.isArray(collection)) return arrayKeyBy(collection, key);
	else return arrayKeyBy(Object.values(collection), key);
}

export function forIn<T>(obj: Record<string, T>, fun: (val: T) => void) {
	Object.entries(obj || {}).forEach((prop) => {
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

export function map<T>(collection: Record<string, T> | T[], fun: (value: T, key: any) => any): any[] {
	if (Array.isArray(collection)) {
		return collection.map((value, index) => fun(value, index));
	}
	const result: any[] = [];
	Object.entries(collection || {}).forEach((prop) => {
		const [key, value] = prop;
		result.push(fun(value, key));
	});
	return result;
}

export function mapValues<T>(obj: Record<string, T>, fun: (value: T, key: string) => any): Record<string, any> {
	if (!obj) {
		return {};
	}
	const newObj: Record<string, any> = { ...obj };
	Object.entries(obj).forEach((prop) => {
		const [key, value] = prop;
		newObj[key] = fun(value, key);
	});
	return newObj;
}

export function values<T>(obj: Record<string, T>): T[] {
	return Object.values(obj || {});
}

export function valuesIn(obj: Record<string, any>): any[] {
	return baseKeysIn(obj || {}).map((val) => obj[val]);
}

// based on lodash src -> pushes all own and inherited keys to array, except for the constructor in the case of prototype objects
function baseKeysIn(obj: Record<string, any>): string[] {
	if (!obj) {
		return [];
	}
	const isProto = isPrototype(obj);
	const result = [];

	for (const key in obj) {
		if (!(key === 'constructor' && (isProto || !obj.hasOwnProperty(key)))) {
			result.push(key);
		}
	}
	return result;
}

// based on lodash src, returns true if value is a prototype object
function isPrototype(value: any): boolean {
	const Ctor = value && value.constructor;
	const proto = (typeof Ctor === 'function' && Ctor.prototype) || Object.prototype;
	return value === proto;
}

function arrayGroupBy(arr: Array<any>, fun: (value: any) => any): Record<string, any> {
	return (arr || []).reduce((accum, v, i, arr, k = fun(v)) => {
		if (!accum[k]) {
			accum[k] = [];
		}
		accum[k].push(v);
		return accum;
	}, {});
}

export function groupBy(collection: Array<any> | Record<string, any>, fun: (value: any) => any): Record<string, any> {
	if (Array.isArray(collection)) return arrayGroupBy(collection, fun);
	else return arrayGroupBy(Object.values(collection || {}), fun);
}

export function defaults(dest: Record<string, any>, ...sources: Record<string, any>[]): Record<string, any> {
	if (!dest) {
		dest = {};
	}
	for (const source of sources) {
		const keys = baseKeysIn(source);
		for (const key of keys) {
			if (dest[key] === undefined) {
				dest[key] = source[key];
			}
		}
	}
	return dest;
}

// ~O(S * F^N) where S is the number of sources, F is the average number of fields in source objects and sub-objects,
// and N is the average depth of the object-field tree
// every field of the destination and source objects must be looked at, so the worst case performance probably can't be improved
// maybe common case performance can be improved if there is a practical benefit for us to work on that
export function defaultsDeep(dest: Record<string, any>, ...sources: Record<string, any>[]): Record<string, any> {
	if (!dest) {
		dest = {};
	}
	for (const source of sources) {
		const keys = baseKeysIn(source);
		for (const key of keys) {
			if (source[key] !== undefined) {
				if (isObject(source[key])) {
					dest[key] = defaultsDeep(dest[key], source[key]);
				} else if (dest[key] === undefined) {
					dest[key] = source[key];
				}
			}
		}
	}
	return dest;
}

function isObject(value: any): boolean {
	const type = typeof value;
	return value !== null && value !== undefined && (type === 'object' || type === 'function');
}

export function zipObject(props: Array<string>, values: Array<any>): Record<string, any> {
	const result: Record<string, any> = {};
	for (let i = 0; i < props.length; i++) {
		if (i >= values.length) {
			result[props[i]] = undefined;
		} else {
			result[props[i]] = values[i];
		}
	}
	return result;
}

export function isString(value: any): value is string {
	return typeof value === 'string';
}
