import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Loader } from 'components/Loader';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

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
	const { wallet } = store;
	const { claimable, loadingTree, initialized } = store.tree;

	const totalRewardsValue = Object.keys(claimable).reduce(
		(total, claimKey) => (total += claimable[claimKey].value),
		0,
	);

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

	if (!initialized || loadingTree) {
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
