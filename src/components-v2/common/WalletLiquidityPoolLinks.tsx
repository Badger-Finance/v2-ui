import React, { useContext } from 'react';
import { Protocol } from '@badger-dao/sdk';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { NETWORKS_LIQUIDITY_POOL_LINKS } from '../../config/system/liquidity-pool-links';
import { LiquidityPoolLinkToken } from '../../mobx/model/system-config/liquidity-pool-links';
import WalletLiquidityPoolLink from './WalletLiquidityPoolLink';

const useStyles = makeStyles((theme) => ({
	link: {
		fontSize: 14,
		fontWeight: 700,
		color: '#91CDFF',
	},
	linkText: {
		marginRight: 6,
	},
	buyText: {
		fontSize: 14,
		fontWeight: 400,
		marginBottom: theme.spacing(1),
	},
}));

const WalletLiquidityPoolLinks = (): JSX.Element | null => {
	const {
		network: { network: currentNetwork },
	} = useContext(StoreContext);
	const classes = useStyles();

	const badgerPools = NETWORKS_LIQUIDITY_POOL_LINKS[currentNetwork.symbol][LiquidityPoolLinkToken.BADGER];
	const diggPools = NETWORKS_LIQUIDITY_POOL_LINKS[currentNetwork.symbol][LiquidityPoolLinkToken.DIGG];

	if (!badgerPools && !diggPools) {
		return null;
	}

	return (
		<>
			<Grid container direction="column" spacing={2}>
				{badgerPools && (
					<Grid item>
						<Typography color="textSecondary" className={classes.buyText}>
							Buy Badger:
						</Typography>
						<Grid container spacing={3}>
							{(Object.keys(badgerPools) as Protocol[]).map((poolKey, index) => (
								<Grid item key={`badger_${poolKey}_${index}`}>
									<WalletLiquidityPoolLink name={poolKey} link={badgerPools[poolKey] ?? ''} />
								</Grid>
							))}
						</Grid>
					</Grid>
				)}
				{diggPools && (
					<Grid item>
						<Typography color="textSecondary" className={classes.buyText}>
							Buy Digg:
						</Typography>
						<Grid container spacing={3}>
							{(Object.keys(diggPools) as Protocol[]).map((poolKey, index) => (
								<Grid item key={`digg_${poolKey}_${index}`}>
									<WalletLiquidityPoolLink name={poolKey} link={diggPools[poolKey] ?? ''} />
								</Grid>
							))}
						</Grid>
					</Grid>
				)}
			</Grid>
		</>
	);
};

export default observer(WalletLiquidityPoolLinks);
