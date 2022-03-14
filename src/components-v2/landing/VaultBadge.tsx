import React from 'react';
import { Chip, makeStyles } from '@material-ui/core';
import { VaultState } from '@badger-dao/sdk';
import clsx from 'clsx';

interface VaultBadgeProps {
	state: VaultState;
}

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
	deprecatedTag: {
		backgroundColor: '#FF614D1A',
		color: '#FF614D',
		border: '0.5px solid #FF614D',
	},
	experimentalTag: {
		background: 'black',
		color: 'white',
	},
	starIcon: {
		marginRight: 2,
	},
});

const VaultBadge = ({ state }: VaultBadgeProps): JSX.Element | null => {
	const classes = useStyles();

	switch (state) {
		case VaultState.New:
			return <Chip label="New" className={clsx(classes.tag, classes.newTag)} size="small" />;
		case VaultState.Experimental:
			return <Chip className={clsx(classes.tag, classes.experimentalTag)} size="small" label="Trial Run" />;
		case VaultState.Guarded:
			return <Chip className={clsx(classes.tag, classes.guardedTag)} size="small" label="Guarded" />;
		case VaultState.Deprecated:
			return <Chip className={clsx(classes.tag, classes.deprecatedTag)} size="small" label="Obsolete" />;
		default:
			return null;
	}
};

export default VaultBadge;
