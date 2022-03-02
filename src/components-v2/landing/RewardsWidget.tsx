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
		button: {
			height: 36,
		},
		label: {
			fontWeight: 'inherit',
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
				.filter((claim) => !!vaults.getToken(claim.token.address) && claim.tokenBalance.gt(0))
				.map((claim) => [claim.token.address, claim]),
		);
		setClaimableRewards(balances);
	}, [vaults, badgerTree.claims]);

	if (!onboard.isActive()) {
		return (
			<>
				<Button
					startIcon={<img src="/assets/icons/rewards-spark.svg" alt="rewards icon" />}
					aria-label="open rewards dialog"
					color="primary"
					variant="outlined"
					onClick={() => setOpen(true)}
				>
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
					variant="outlined"
					color="primary"
					className={clsx(classes.button, classes.loadingRewardsButton)}
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
				startIcon={<img src="/assets/icons/rewards-spark.svg" alt="rewards icon" />}
				aria-label="open rewards dialog"
				color="primary"
				variant="outlined"
				onClick={() => setOpen(true)}
			>
				<CurrencyDisplay
					displayValue={inCurrency(totalRewardsValue, currency, widgetButtonDecimals)}
					variant="body2"
					justifyContent="center"
					TypographyProps={{ className: classes.label }}
				/>
			</Button>
			<RewardsDialog open={open} onClose={() => setOpen(false)} claimableRewards={claimableRewards} />
		</>
	);
});
