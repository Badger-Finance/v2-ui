import React, { useContext, useState } from 'react';
import { CardContainer, StyledDivider, StyledHelpIcon } from '../vault-detail/styled';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import VaultDepositedAssets from '../VaultDepositedAssets';
import SpecItem from '../vault-detail/specs/SpecItem';
import { numberWithCommas } from '../../mobx/utils/helpers';
import { Skeleton } from '@material-ui/lab';
import BveCvxFees from '../BveCvxFees';
import VaultDetailLinks from '../vault-detail/specs/VaultDetailLinks';
import { VaultDTO } from '@badger-dao/sdk';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';
import BveCvxWithdrawalInfo from '../BveCvxWithdrawalInfo';
import BveCvxFrequencyInfo from '../BveCvxFrequencyInfo';
import { VaultToken } from '../vault-detail/specs/VaultToken';

interface Props {
	vault: VaultDTO;
}

const useStyles = makeStyles((theme) => ({
	specContainer: {
		padding: theme.spacing(2),
	},
	specItem: {
		marginTop: 16,
	},
	token: {
		'& h6': {
			fontSize: 12,
			fontWeight: 400,
		},
		marginBottom: 0,
	},
	title: {
		paddingBottom: theme.spacing(0.15),
		fontSize: '1.25rem',
	},
}));

const BveCvxSpecs = ({ vault }: Props): JSX.Element => {
	const { lockedDeposits } = useContext(StoreContext);
	const [withdrawInfoOpen, setWithdrawInfoOpen] = useState(false);
	const [frequencyInfo, setFrequencyInfo] = useState(false);
	const lockedBalance = lockedDeposits.getLockedDepositBalances(vault.underlyingToken);
	const classes = useStyles();
	return (
		<CardContainer>
			<Grid container direction="column" className={classes.specContainer}>
				<Grid item xs>
					<Typography variant="h6" className={classes.title}>
						Vault Details
					</Typography>
					<StyledDivider />
					<VaultDepositedAssets vault={vault} />
					<Typography variant="body2">Assets Deposited</Typography>
				</Grid>
				<Grid item xs className={classes.specItem}>
					<Typography className={classes.title}>Tokens</Typography>
					<StyledDivider />
					<Grid container>
						{vault.tokens.map((token, index) => (
							<VaultToken
								className={classes.token}
								key={`${vault.name}-${token.name}-${index}`}
								token={token}
							/>
						))}
					</Grid>
					<SpecItem name="Token Ratio" value={vault.pricePerFullShare.toFixed(4)} />
					<SpecItem
						name={
							<Box component="span" display="flex" justifyContent="center" alignItems="center">
								CVX Available for Withdraw
								<StyledHelpIcon onClick={() => setWithdrawInfoOpen(true)} />
							</Box>
						}
						value={
							lockedBalance ? (
								numberWithCommas(lockedBalance.balanceDisplay(5))
							) : (
								<Skeleton variant="text" width={30} />
							)
						}
					/>
				</Grid>
				<Grid item xs className={classes.specItem}>
					<BveCvxFees vault={vault} />
				</Grid>
				<Grid item xs className={classes.specItem}>
					<Box display="flex" alignItems="center">
						<Typography>Reward Frequency</Typography>
						<StyledHelpIcon onClick={() => setFrequencyInfo(true)} />
					</Box>
					<StyledDivider />
					<Grid container direction="column">
						<SpecItem name="bveCVX, BADGER" value="Each bi-weekly bribe sale" />
						<SpecItem name="bcvxCRV" value="Each ~2hr cycle" />
					</Grid>
				</Grid>
				<Grid item xs className={classes.specItem}>
					<VaultDetailLinks vault={vault} />
				</Grid>
			</Grid>
			<BveCvxWithdrawalInfo open={withdrawInfoOpen} onClose={() => setWithdrawInfoOpen(false)} />
			<BveCvxFrequencyInfo open={frequencyInfo} onClose={() => setFrequencyInfo(false)} />
		</CardContainer>
	);
};

export default observer(BveCvxSpecs);
