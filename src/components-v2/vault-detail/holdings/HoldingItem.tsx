import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { VaultDTO } from '@badger-dao/sdk';
import VaultLogo from '../../landing/VaultLogo';

const useStyles = makeStyles((theme) => ({
	titleContainer: {
		display: 'flex',
		alignItems: 'center',
	},
	holdingsName: {
		fontSize: 16,
	},
	cardContainer: {
		padding: theme.spacing(3),
	},
	logoContainer: {
		display: 'inline-flex',
		alignItems: 'center',
		marginRight: theme.spacing(1),
	},
	logo: {
		width: '100%',
		margin: 'auto',
	},
	amountsContainer: {
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	amountText: {
		alignItems: 'center',
		marginTop: theme.spacing(1),
	},
}));

interface Props {
	vault: VaultDTO;
	name: string;
	balance: string;
	value: string;
	helpIcon?: React.ReactNode;
}

export const HoldingItem = ({ vault, name, balance, value, helpIcon }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<Paper className={classes.cardContainer}>
			<div className={classes.titleContainer}>
				<Typography className={classes.holdingsName}>{name}</Typography>
				{helpIcon}
			</div>
			<Divider />
			<Grid container className={classes.amountsContainer}>
				<Box display="inline-flex" className={classes.amountText}>
					<div className={classes.logoContainer}>
						<VaultLogo tokens={vault.tokens} />
					</div>
					<div>
						<Typography variant="h5">{balance}</Typography>
						<Typography variant="body2" color="textSecondary">
							{value}
						</Typography>
					</div>
				</Box>
			</Grid>
		</Paper>
	);
};
