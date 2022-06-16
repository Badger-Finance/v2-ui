import { Chip, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

import { BadgeProps, BadgeType } from './Badge.types';

const useStyles = makeStyles({
	tag: {
		fontSize: '12px',
		alignItems: 'center',
		fontWeight: 700,
		height: 20,
	},
	newTag: {
		background: '#FFFFFF1A',
		color: '#FFFFFF',
		border: '0.5px solid #FFFFFF',
	},
	guardedTag: {
		background: '#FBEE781A',
		color: '#FBEE78',
		border: '0.5px solid #FBEE78',
	},
	obsoleteTag: {
		backgroundColor: '#FF614D1A',
		color: '#FF614D',
		border: '0.5px solid #FF614D',
	},
	experimentalTag: {
		backgroundColor: '#FFFFFF1A',
		color: '#FFFFFF99',
		border: '0.5px solid #FFFFFF99',
	},
	executedTag: {
		backgroundColor: '#29CCBB1A',
		color: '#29CCBB',
		border: '0.5px solid #29CCBB',
	},
});

export function Badge({ type }: BadgeProps): JSX.Element | null {
	const classes = useStyles();

	switch (type) {
		case BadgeType.FEATURED:
			return <Chip label="Featured" className={clsx(classes.tag, classes.newTag)} size="small" />;
		case BadgeType.GUARDED:
			return <Chip className={clsx(classes.tag, classes.guardedTag)} size="small" label="Guarded" />;
		case BadgeType.DISCONTINUED:
			return <Chip className={clsx(classes.tag, classes.obsoleteTag)} size="small" label="Discontinued" />;
		case BadgeType.EXECUTED:
			return <Chip className={clsx(classes.tag, classes.executedTag)} size="small" label="Executed" />;
		case BadgeType.EXPERIMENTAL:
			return <Chip className={clsx(classes.tag, classes.experimentalTag)} size="small" label="Experimental" />;
		default:
			return null;
	}
}
