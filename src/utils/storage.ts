// Adding a new storage type should implement this interface.
interface Storage {
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	removeItem: (key: string) => void;
	clear: () => void;
}

class InMemoryStorage implements Storage {
	private data: Record<string, any>;

	private static instance: InMemoryStorage;

	constructor() {
		this.data = {};
	}

	getItem(key: string) {
		if (!this.data[key]) {
			return '';
		}

		return this.data[key];
	}

	setItem(key: string, value: string) {
		this.data[key] = value;
	}

	removeItem(key: string) {
		if (!(key in this.data)) {
			return;
		}

		delete this.data[key];
	}

	clear() {
		this.data = {};
	}

	static getInstance(): InMemoryStorage {
		if (!InMemoryStorage.instance) {
			InMemoryStorage.instance = new InMemoryStorage();
		}

		return InMemoryStorage.instance;
	}
}

export function createStorage(getStorage: () => Storage) {
	function isSupported() {
		try {
			const key = '__BOUNCE_STORAGE_TEST__';

			getStorage().setItem(key, key);
			getStorage().removeItem(key);

			return true;
		} catch (e) {
			return false;
		}
	}

	function selectStorage(): Storage {
		if (isSupported()) {
			return getStorage();
		}

		// Fallbacks to in-memory if the storage being used is blocked by the user client
		// This issue was first seen on some android devices where localStorage was disabled
		return InMemoryStorage.getInstance();
	}

	function getItem(key: string): any {
		const value = selectStorage().getItem(key);

		if (!value) {
			return '';
		}

		try {
			return JSON.parse(value);
		} catch (e) {
			return value;
		}
	}

	function setItem(key: string, value: any) {
		selectStorage().setItem(key, JSON.stringify(value));
	}

	function removeItem(key: string) {
		selectStorage().removeItem(key);
	}

	function clear() {
		selectStorage().clear();
	}

	return {
		getItem,
		setItem,
		removeItem,
		clear,
	};
}

export const localStorage = createStorage(() => window.localStorage);
export const sessionStorage = createStorage(() => window.sessionStorage);

// To switch the storage type of the entire app, change this variable
const storage = localStorage;
export default storage;
