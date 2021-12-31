import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import CurrencyDisplay from '../common/CurrencyDisplay';
import RewardsDialog from '../common/dialogs/RewardsDialog';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		rewards: {
			color: '#F2BC1B',
		},
		rewardsButton: {
			borderColor: '#F2BC1B',
		},
		rewardsIcon: { marginRight: theme.spacing(1) },
		button: {
			height: 36,
		},
		loadingRewardsButton: {
			minWidth: 37,
			width: 37,
		},
	}),
);

export interface ClaimMapEntry {
	balance: TokenBalance;
	visualBalance: string;
}

export interface ClaimMap {
	[address: string]: TokenBalance;
}

export interface RewardsModalProps {
	loading: boolean;
}

export const RewardsWidget = observer((): JSX.Element | null => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { vaults, onboard, user } = store;
	const { badgerTree, loadingRewards } = store.rewards;
	const { currency } = store.uiState;

	const [open, setOpen] = useState(false);
	const [claimableRewards, setClaimableRewards] = useState<ClaimMap>({});

	const totalRewardsValue = Object.keys(claimableRewards).reduce(
		(total, claimKey) => total.plus(claimableRewards[claimKey].value),
		new BigNumber(0),
	);

	useEffect(() => {
		const balances = Object.fromEntries(
			badgerTree.claims
				.filter((claim) => !!vaults.getToken(claim.token.address))
				.map((claim) => [claim.token.address, claim]),
		);
		setClaimableRewards(balances);
	}, [vaults, badgerTree.claims]);

	if (!onboard.isActive()) {
		return (
			<>
				<Button
					aria-label="open rewards dialog"
					classes={{ outlined: classes.rewardsButton }}
					className={clsx(classes.rewards, classes.button)}
					variant="outlined"
					onClick={() => setOpen(true)}
				>
					<img className={classes.rewardsIcon} src="/assets/icons/rewards-spark.svg" alt="rewards icon" />
					<CurrencyDisplay
						displayValue={inCurrency(new BigNumber(0), currency)}
						variant="body2"
						justifyContent="center"
					/>
				</Button>
				<RewardsDialog open={open} onClose={() => setOpen(false)} claimableRewards={{}} />
			</>
		);
	}

	if (loadingRewards || user.claimProof === undefined) {
		return (
			<>
				<Button
					disabled
					variant="outlined"
					className={clsx(classes.rewards, classes.button, classes.loadingRewardsButton)}
				>
					<Loader size={15} />
				</Button>
				<RewardsDialog open={open} onClose={() => setOpen(false)} claimableRewards={claimableRewards} />
			</>
		);
	}

	const widgetButtonDecimals = totalRewardsValue.isZero() ? 0 : undefined; // use default otherwise

	return (
		<>
			<Button
				aria-label="open rewards dialog"
				classes={{ outlined: classes.rewardsButton }}
				className={clsx(classes.rewards, classes.button)}
				variant="outlined"
				onClick={() => setOpen(true)}
			>
				<img className={classes.rewardsIcon} src="/assets/icons/rewards-spark.svg" alt="rewards icon" />
				<CurrencyDisplay
					displayValue={inCurrency(totalRewardsValue, currency, widgetButtonDecimals)}
					variant="body2"
					justifyContent="center"
				/>
			</Button>
			<RewardsDialog open={open} onClose={() => setOpen(false)} claimableRewards={claimableRewards} />
		</>
	);
});
