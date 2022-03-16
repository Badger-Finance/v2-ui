export enum BadgeType {
	NEW = 'new',
	GUARDED = 'guarded',
	OBSOLETE = 'obsolete',
	EXECUTED = 'executed',
	EXPERIMENTAL = 'experimental',
}

export interface BadgeProps {
	type: BadgeType;
}
