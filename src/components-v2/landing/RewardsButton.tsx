import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Loader } from 'components/Loader';
import { BigNumber } from 'ethers';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';

import { ClaimMap } from '../../mobx/model/rewards/claim-map';
import CurrencyDisplay from '../common/CurrencyDisplay';

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

export const RewardsButton = observer((): JSX.Element | null => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { vaults, user, wallet } = store;
	const { badgerTree, loadingRewards } = store.rewards;
	const [claimableRewards, setClaimableRewards] = useState<ClaimMap>({});

	const totalRewardsValue = Object.keys(claimableRewards).reduce(
		(total, claimKey) => (total += claimableRewards[claimKey].value),
		0,
	);

	useEffect(() => {
		const balances = Object.fromEntries(
			badgerTree.claims
				.filter((claim) => !!vaults.getToken(claim.token.address) && claim.tokenBalance.gt(0))
				.map((claim) => [claim.token.address, claim]),
		);
		setClaimableRewards(balances);
	}, [vaults, badgerTree.claims]);

	if (!wallet.isConnected) {
		return (
			<Button
				startIcon={<img src="/assets/icons/rewards-spark.svg" alt="rewards icon" />}
				aria-label="open rewards dialog"
				color="primary"
				variant="outlined"
				onClick={() => store.uiState.toggleRewardsDialog()}
			>
				<CurrencyDisplay displayValue={'0'} variant="body2" justifyContent="center" />
			</Button>
		);
	}

	if (loadingRewards || user.claimProof === undefined) {
		return (
			<Button variant="outlined" color="primary" className={clsx(classes.button, classes.loadingRewardsButton)}>
				<Loader size={15} />
			</Button>
		);
	}

	const widgetButtonDecimals = totalRewardsValue === 0 ? 0 : 2; // use default otherwise

	return (
		<>
			<Button
				startIcon={<img src="/assets/icons/rewards-spark.svg" alt="rewards icon" />}
				aria-label="open rewards dialog"
				color="primary"
				variant="outlined"
				onClick={() => store.uiState.toggleRewardsDialog()}
			>
				<CurrencyDisplay
					displayValue={totalRewardsValue.toFixed(widgetButtonDecimals)}
					variant="body2"
					justifyContent="center"
					TypographyProps={{ className: classes.label }}
				/>
			</Button>
		</>
	);
});
