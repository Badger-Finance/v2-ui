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
import InfluenceVaultChart from './InfluenceVaultChart';
import ChartContent from '../vault-detail/charts/ChartContent';
import { parseText } from './InfluenceVaultUtil';
import { getInfluenceVaultConfig } from './InfluenceVaultUtil';
import InfluenceVaultListModal from './InfluenceVaultListModal';
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

const InfluenceVaultPerfomanceTab = ({ vault }: Props): JSX.Element => {
	const { vaults, lockedDeposits, influenceVaultStore } = useContext(StoreContext);
	const [infoDialogOpen, setInfoDialogOpen] = useState(false);
	const classes = useStyles();
	const sources = vaults.vaultsFilters.showAPR ? vault.sources : vault.sourcesApy;
	const sortedSources = sources.slice().sort((source) => (source.boostable ? 1 : -1));
	const apy = vaults.vaultsFilters.showAPR ? vault.apr : vault.apy;
	const lockedBalance = lockedDeposits.getLockedDepositBalances(vault.underlyingToken);
	const { processingEmissions, emissionsSchedules, swapPercentage } = influenceVaultStore.getInfluenceVault(
		vault.vaultToken,
	);
	const underlyingTokenSymbol = vaults.getToken(vault.underlyingToken).symbol;
	const info = getInfluenceVaultConfig(vault.vaultToken);
	const diviserToken = vaults.getToken(vault.vaultToken).symbol;

	const createLink = (text: string, link: string) => {
		return (
			<Link href={link} key={link} target="_blank" rel="noopener" display="inline">
				{text}
			</Link>
		);
	};

	return (
		<Grid container direction="column" className={classes.root}>
			<Grid item container spacing={4}>
				<Grid item xs={12} sm={6}>
					<Typography variant="body1">Strategy Summary</Typography>
					<Divider className={classes.divider} />
					<Typography className={classes.firstParagraph} variant="body2" color="textSecondary">
						{parseText(info.perfomanceInfo.body1, createLink)}
					</Typography>
					<Typography variant="body2" color="textSecondary">
						{parseText(info.perfomanceInfo.body2, createLink)}
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
									{underlyingTokenSymbol} Available for Withdrawal
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
							name={<span>{parseText(info.perfomanceInfo.liquity[0], createLink)}</span>}
							value={swapPercentage ? swapPercentage : <Skeleton width={50} variant="rect" />}
						/>
					</Grid>
				</Grid>
			</Grid>
			<Grid item className={classes.content}>
				<div className={classes.performanceChart}>
					<Typography align="center" variant="body2">
						Performance By Voting Round, Tokens per 100 {diviserToken}
					</Typography>
					<ChartContent loading={processingEmissions} data={emissionsSchedules ?? null}>
						{emissionsSchedules && <InfluenceVaultChart emissions={emissionsSchedules} />}
					</ChartContent>
				</div>
			</Grid>
			<InfluenceVaultListModal
				open={infoDialogOpen}
				onClose={() => setInfoDialogOpen(false)}
				info={info.withdrawModalInfo}
			/>
		</Grid>
	);
};

export default observer(InfluenceVaultPerfomanceTab);
