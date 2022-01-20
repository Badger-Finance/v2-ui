import React from 'react';
import { Box, Chip, makeStyles } from '@material-ui/core';
import { VaultState } from '@badger-dao/sdk';
import { Star } from '@material-ui/icons';
import clsx from 'clsx';

interface VaultBadgeProps {
	state: VaultState;
}

const useStyles = makeStyles({
	tag: {
		fontSize: '12px',
		alignItems: 'center',
		height: 19,
		fontWeight: 700,
		paddingBottom: 2,
	},
	newTag: {
		background: 'white',
		color: 'black',
	},
	deprecatedTag: {
		color: '#FF0303',
		backgroundColor: '#FDCDCD',
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
			return (
				<Chip
					label={
						<Box display="flex" alignItems="center">
							<Star className={classes.starIcon} fontSize="inherit" /> New
						</Box>
					}
					className={clsx(classes.tag, classes.newTag)}
					size="small"
				/>
			);
		case VaultState.Experimental:
		case VaultState.Guarded:
			return <Chip className={clsx(classes.tag, classes.experimentalTag)} size="small" label="Trial Run" />;
		case VaultState.Deprecated:
			return <Chip className={clsx(classes.tag, classes.deprecatedTag)} size="small" label="Expiring" />;
		default:
			return null;
	}
};

export default VaultBadge;
