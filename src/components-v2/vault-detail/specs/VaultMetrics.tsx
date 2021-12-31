import React, { useState } from 'react';
import { Collapse, Grid, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { inCurrency } from '../../../mobx/utils/helpers';
import BigNumber from 'bignumber.js';
import { Skeleton } from '@material-ui/lab';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { Vault } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	root: {
		wordBreak: 'break-all',
		display: 'flex',
		flexDirection: 'column',
	},
	amount: {
		fontSize: 28,
		lineHeight: '1.334',
	},
	currencyIcon: {
		width: 20,
		height: 20,
		marginRight: theme.spacing(1),
	},
	submetric: {
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
	},
	submetricValue: {
		marginTop: theme.spacing(0.5),
		marginRight: theme.spacing(1),
	},
	submetricType: {
		paddingBottom: theme.spacing(0.08),
	},
	title: {
		paddingBottom: theme.spacing(0.15),
		fontSize: '1.25rem',
	},
	showMoreContainer: {
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'flex-start',
		cursor: 'pointer',
	},
	showMore: {
		color: theme.palette.primary.main,
		fontSize: 12,
		padding: theme.spacing(0.2),
	},
}));

interface Props {
	vault: Vault;
}

const VaultMetrics = observer(({ vault }: Props): JSX.Element => {
	const { uiState, vaults } = React.useContext(StoreContext);
	const classes = useStyles();

	const currencyValue = inCurrency(new BigNumber(vault.value), uiState.currency);
	const hasCurrencyIcon = currencyValue?.includes('.png');

	let currencyIcon;
	let displayValue = currencyValue;

	if (currencyValue && hasCurrencyIcon) {
		[currencyIcon, displayValue] = currencyValue.split('.png');
	}

	const available = vaults.availableBalances[vault.vaultToken];

	const [showMore, setShowMore] = useState(true);
	const expandText = showMore ? 'Hide' : 'Show More';

	return (
		<Grid container className={classes.root}>
			<Typography variant="h6" className={classes.title}>
				Vault Details
			</Typography>
			<StyledDivider />
			{currencyIcon && (
				<img src={`${currencyIcon}.png`} alt={`${currencyIcon} icon`} className={classes.currencyIcon} />
			)}
			<Typography className={classes.amount}>{displayValue ?? <Skeleton width={209} height={37} />}</Typography>
			<Typography variant="body2">Assets Deposited</Typography>
			<div className={classes.showMoreContainer}>
				<div className={classes.showMore} onClick={() => setShowMore(!showMore)}>
					{expandText}
				</div>
			</div>
			<Collapse in={showMore}>
				<Typography variant="body1" className={classes.submetricValue}>
					{vault.pricePerFullShare.toFixed(4)}
				</Typography>
				<Typography variant="caption" className={classes.submetricType}>
					tokens per share
				</Typography>
				{vault.vaultToken === ETH_DEPLOY.sett_system.vaults['native.icvx'] && available && (
					<div className={classes.submetric}>
						<Typography variant="body1" className={classes.submetricValue}>
							{available.balanceDisplay(5)}
						</Typography>
						<Typography variant="caption" className={classes.submetricType}>
							tokens withdrawable
						</Typography>
					</div>
				)}
			</Collapse>
		</Grid>
	);
});

export default VaultMetrics;
