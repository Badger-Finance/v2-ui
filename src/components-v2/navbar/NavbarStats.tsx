import React, { useContext } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { inCurrency } from '../../mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Skeleton } from '@material-ui/lab';
import BigNumber from 'bignumber.js';
import { getFormattedNetworkName } from '../../utils/componentHelpers';
import { Typography } from 'ui-library/Typography';

const useStyles = makeStyles((theme) => ({
	root: {
		width: 'calc(100% + 30px)',
		margin: '-30px 0 0 -30px',
		[theme.breakpoints.down('sm')]: {
			overflowX: 'auto',
			flexWrap: 'nowrap',
		},
		'& > *': {
			display: 'flex',
			margin: '30px 0 0 30px',
			flexWrap: 'none',
			flexShrink: 0,
		},
	},
	loader: {
		display: 'inline-flex',
		marginLeft: 4,
	},
	assets: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
}));

export const NavbarStats = observer((): JSX.Element => {
	const {
		prices,
		onboard,
		user,
		network: { network },
		rewards: { badgerTree },
		uiState: { currency },
		vaults: { protocolSummary },
	} = useContext(StoreContext);

	const classes = useStyles();
	const badgerToken = network.deploy.token.length > 0 ? network.deploy.token : undefined;
	const badgerPrice = badgerToken ? prices.getPrice(badgerToken) : undefined;
	const totalValueLocked = protocolSummary ? new BigNumber(protocolSummary.totalValue) : undefined;
	const portfolioValue = onboard.isActive() && user.initialized ? user.portfolioValue : new BigNumber(0);
	const chainName = getFormattedNetworkName(network);
	const valuePlaceholder = <Skeleton animation="wave" width={32} className={classes.loader} />;

	return (
		<Grid container className={classes.root}>
			<Grid item>
				<Typography variant="helperText" display="inline">
					Badger Price: &nbsp;
				</Typography>
				{badgerPrice ? (
					<CurrencyDisplay
						displayValue={inCurrency(badgerPrice, currency)}
						variant="helperText"
						justifyContent="flex-start"
					/>
				) : (
					valuePlaceholder
				)}
			</Grid>
			<Grid item>
				<Typography variant="helperText" display="inline">
					Cycle: {badgerTree.cycle} &nbsp;
					{badgerTree.timeSinceLastCycle && `(latest ${badgerTree.timeSinceLastCycle})`}
				</Typography>
			</Grid>
			<Grid item>
				<Typography variant="helperText" display="inline">
					{chainName} TVL: &nbsp;
				</Typography>
				{totalValueLocked ? (
					<CurrencyDisplay
						displayValue={inCurrency(totalValueLocked, currency, 0)}
						variant="helperText"
						justifyContent="flex-start"
					/>
				) : (
					valuePlaceholder
				)}
			</Grid>
			<Grid item className={classes.assets}>
				<Typography variant="helperText" display="inline">
					My Assets: &nbsp;
				</Typography>
				<CurrencyDisplay
					displayValue={inCurrency(portfolioValue, currency)}
					variant="helperText"
					justifyContent="flex-start"
				/>
			</Grid>
		</Grid>
	);
});
