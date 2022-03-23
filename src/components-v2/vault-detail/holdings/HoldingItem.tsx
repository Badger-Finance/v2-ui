import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Divider, Grid, Paper, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatWithoutExtraZeros, numberWithCommas } from '../../../mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import { VaultDTO } from '@badger-dao/sdk';
import VaultLogo from '../../landing/VaultLogo';
import { StoreContext } from '../../../mobx/store-context';

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
	balance: BigNumber.Value;
	value: BigNumber.Value;
	helpIcon?: React.ReactNode;
}

const displayUsdBalance = (value: BigNumber.Value) => `~$${numberWithCommas(formatWithoutExtraZeros(value, 2))}`;

export const HoldingItem = observer(({ vault, name, balance, value, helpIcon }: Props): JSX.Element => {
	const { vaults } = useContext(StoreContext);
	const classes = useStyles();
	const depositToken = vaults.getToken(vault.underlyingToken);
	const decimals = depositToken?.decimals || 18;

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
						<Typography variant="h5">{formatWithoutExtraZeros(balance, decimals)}</Typography>
						<Typography variant="body2" color="textSecondary">
							{displayUsdBalance(value)}
						</Typography>
					</div>
				</Box>
			</Grid>
		</Paper>
	);
});
