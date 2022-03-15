import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { RewardsButton } from '../landing/RewardsButton';
import NetworkGasWidget from '../common/NetworkGasWidget';
import WalletWidget from '../common/WalletWidget';

const useStyles = makeStyles({
	root: {
		width: 'calc(100% + 18px)',
		margin: '-18px 0 0 -18px',
		'& > *': {
			margin: '18px 0 0 18px',
		},
		'& button': {
			height: 41,
		},
	},
});

export const NavbarButtons = (): JSX.Element => {
	const classes = useStyles();
	return (
		<Grid container className={classes.root} justifyContent="flex-end">
			<Grid item>
				<RewardsButton />
			</Grid>
			<Grid item>
				<NetworkGasWidget />
			</Grid>
			<Grid item>
				<WalletWidget />
			</Grid>
		</Grid>
	);
};
