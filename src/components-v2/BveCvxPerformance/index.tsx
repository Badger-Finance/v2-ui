import React, { useContext, useState } from 'react';
import { Box, Divider, Grid, Link, makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from '../../mobx/store-context';
import { VaultDTO } from '@badger-dao/sdk';
import VaultApyBreakdownItem from '../VaultApyBreakdownItem';
import { numberWithCommas } from '../../mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import SpecItem from '../vault-detail/specs/SpecItem';
import { StyledHelpIcon } from '../vault-detail/styled';
import { Skeleton } from '@material-ui/lab';
import BveCvxBribeChart from '../BveCvxBribeChart';
import ChartContent from '../vault-detail/charts/ChartContent';
import BveCvxWithdrawalInfo from '../BveCvxWithdrawalInfo';

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	divider: {
		width: '100%',
		margin: '10px 0',
	},
	firstParagraph: {
		marginBottom: 16,
	},
	liquidity: {
		marginTop: 20,
	},
	content: {
		marginTop: 40,
		display: 'flex',
		flexGrow: 1,
		maxWidth: '100%',
		flexShrink: 0,
		justifyContent: 'center',
	},
	performanceChart: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		background: '#181818',
		padding: theme.spacing(2),
		borderRadius: '5px',
	},
}));

interface Props {
	vault: VaultDTO;
}

const BveCvxPerformance = ({ vault }: Props): JSX.Element => {
	const { vaults, lockedDeposits, bveCvxInfluence } = useContext(StoreContext);
	const [infoDialogOpen, setInfoDialogOpen] = useState(false);
	const classes = useStyles();
	const sources = vaults.vaultsFilters.showAPR ? vault.sources : vault.sourcesApy;
	const sortedSources = sources.slice().sort((source) => (source.boostable ? 1 : -1));
	const apy = vaults.vaultsFilters.showAPR ? vault.apr : vault.apy;
	const lockedBalance = lockedDeposits.getLockedDepositBalances(vault.underlyingToken);
	const { loadingEmissions, emissions, swapPercentage } = bveCvxInfluence;

	return (
		<Grid container direction="column" className={classes.root}>
			<Grid item container spacing={4}>
				<Grid item xs={12} sm={6}>
					<Typography variant="body1">Strategy Summary</Typography>
					<Divider className={classes.divider} />
					<Typography className={classes.firstParagraph} variant="body2" color="textSecondary">
						This vault locks 100% of deposited Convex tokens for rolling periods of 16 weeks. Badger will
						use vlCVX to vote for bribes during each voting round, sell them, and emit the proceeds back to
						holders in the form of bveCVX (autocompounded), and claimable BADGER and bcvxCRV.
					</Typography>
					<Typography variant="body2" color="textSecondary">
						Unlike other Badger Vaults, bveCVX limits the times when users may withdraw their funds. Limited
						pre-unlock liquidity is available through this{' '}
						<Link href="https://curve.fi/factory/52/" target="_blank" rel="noopener" display="inline">
							Curve pool
						</Link>
						. Please carefully read the{' '}
						<Link
							href="https://docs.badger.com/badger-finance/vaults/vault-user-guides-ethereum/vote-locked-cvx"
							target="_blank"
							rel="noopener"
							display="inline"
						>
							User Guide
						</Link>{' '}
						for more information. Details on the timing of CVX unlocks are available on this{' '}
						<Link
							href="https://dune.com/tianqi/Convex-Locked-CVX-V2(Sponsored-by-Badger)"
							target="_blank"
							rel="noopener"
							display="inline"
						>
							Dune dashboard
						</Link>
						.
					</Typography>
				</Grid>
				<Grid item xs={12} sm={6}>
					<Grid item container>
						<Box width="100%" display="flex" alignItems="center" justifyContent="space-between">
							<Typography variant="body1" display="inline">
								APY
							</Typography>
							<Typography variant="body1" display="inline">
								{numberWithCommas(String(apy.toFixed(2)))}%
							</Typography>
						</Box>
						<Divider className={classes.divider} />
						{sortedSources.map((source) => (
							<React.Fragment key={source.name}>
								<VaultApyBreakdownItem vault={vault} source={source} />
								<Divider className={classes.divider} />
							</React.Fragment>
						))}
					</Grid>
					<Grid item container direction="column" className={classes.liquidity}>
						<Typography variant="body1" display="inline">
							Liquidity
						</Typography>
						<Divider className={classes.divider} />
						<SpecItem
							name={
								<Box component="span" display="flex" justifyContent="center" alignItems="center">
									CVX Available for Withdrawal
									<StyledHelpIcon onClick={() => setInfoDialogOpen(true)} />
								</Box>
							}
							value={
								lockedBalance ? (
									numberWithCommas(lockedBalance.balanceDisplay(5))
								) : (
									<Skeleton width={50} variant="rect" />
								)
							}
						/>
						<SpecItem
							name={
								<span>
									% CVX Received from 10k{' '}
									<Link
										href="https://curve.fi/factory/52/"
										target="_blank"
										rel="noopener"
										display="inline"
									>
										bveCVX swap
									</Link>
								</span>
							}
							value={swapPercentage ? swapPercentage : <Skeleton width={50} variant="rect" />}
						/>
					</Grid>
				</Grid>
			</Grid>
			<Grid item className={classes.content}>
				<div className={classes.performanceChart}>
					<Typography align="center" variant="body2">
						Performance By Voting Round, Tokens per 100 bveCVX
					</Typography>
					<ChartContent loading={loadingEmissions} data={emissions ?? null}>
						{emissions && <BveCvxBribeChart emissions={emissions} />}
					</ChartContent>
				</div>
			</Grid>
			<BveCvxWithdrawalInfo open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} />
		</Grid>
	);
};

export default observer(BveCvxPerformance);
