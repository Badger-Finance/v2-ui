export class TaggedError extends Error {
	public _tag: string;

	constructor(msg: string, tag?: string) {
		super(msg);
		this._tag = tag || msg;
	}
}

export const errorMatches = (error: any, match: RegExp | string) => {
	return error && error.message && error.message.match && error.message.match(match);
};
