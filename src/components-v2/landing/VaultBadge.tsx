import React from 'react';
import { Box, Chip, makeStyles } from '@material-ui/core';
import { Vault } from '@badger-dao/sdk';
import { Star } from '@material-ui/icons';

interface VaultBadgeProps {
	vault: Vault;
}

const useStyles = makeStyles((theme) => ({
	newTag: {
		background: 'white',
		fontSize: '12px',
		fontWeight: 700,
		alignItems: 'center',
		color: 'black',
		marginTop: theme.spacing(1),
		height: 19,
	},
	starIcon: {
		marginRight: 2,
	},
}));

const VaultBadge = ({ vault }: VaultBadgeProps): JSX.Element | null => {
	const classes = useStyles();

	if (vault.newVault) {
		return (
			<Chip
				label={
					<Box display="flex" alignItems="center">
						<Star className={classes.starIcon} fontSize="inherit" /> New
					</Box>
				}
				className={classes.newTag}
				size="small"
			/>
		);
	}

	//TODO: figure out new badges states
	return null;
};

export default VaultBadge;
