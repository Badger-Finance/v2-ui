export enum BadgeType {
  FEATURED = 'featured',
  GUARDED = 'guarded',
  DISCONTINUED = 'discontinued',
  EXECUTED = 'executed',
  EXPERIMENTAL = 'experimental',
}

export interface BadgeProps {
  type: BadgeType;
}
