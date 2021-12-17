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
import NoRewardsDialog from '../common/dialogs/NoRewardsDialog';
import RewardsSelectionDialog from '../common/dialogs/RewardsSelectionDialog';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		dialog: {
			maxWidth: 862,
		},
		title: {
			padding: theme.spacing(4, 4, 0, 4),
		},
		content: {
			padding: theme.spacing(2, 4, 4, 4),
		},
		closeButton: {
			position: 'absolute',
			right: 24,
			top: 24,
		},
		claimRow: {
			marginBottom: theme.spacing(2),
		},
		divider: {
			marginBottom: theme.spacing(2),
		},
		submitButton: {
			marginTop: theme.spacing(4),
			[theme.breakpoints.down('xs')]: {
				marginTop: theme.spacing(2),
			},
		},
		moreRewardsInformation: {
			width: '75%',
			margin: 'auto',
			backgroundColor: '#181818',
			borderRadius: 8,
			padding: theme.spacing(4),
			[theme.breakpoints.down('sm')]: {
				width: '100%',
				padding: theme.spacing(3),
			},
		},
		moreRewardsDescription: {
			marginTop: theme.spacing(1),
		},
		boostRewards: {
			marginTop: theme.spacing(2),
		},
		rewardsGuideLinkContainer: {
			marginTop: theme.spacing(2),
			textAlign: 'center',
		},
		cursorPointer: {
			cursor: 'pointer',
		},
		arrowBack: {
			marginRight: theme.spacing(1),
		},
		userGuideTokens: {
			[theme.breakpoints.up('sm')]: {
				marginLeft: theme.spacing(7),
			},
		},
		userGuideToken: {
			marginBottom: theme.spacing(2),
		},
		rewardsOptions: {
			paddingInlineStart: theme.spacing(2),
		},
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
		noRewardsDialog: {
			maxWidth: 672,
		},
		noRewardsContent: {
			[theme.breakpoints.up('xs')]: {
				marginTop: theme.spacing(2),
			},
		},
		noRewardsIcon: {
			marginRight: theme.spacing(1),
		},
		noRewardsExplanation: {
			marginTop: theme.spacing(6),
			[theme.breakpoints.down('xs')]: {
				marginTop: theme.spacing(2),
			},
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
	const { vaults, onboard, user, router } = store;
	const { badgerTree, claimGeysers, loadingRewards } = store.rewards;
	const { currency } = store.uiState;

	const [open, setOpen] = useState(false);
	const [claimableRewards, setClaimableRewards] = useState<ClaimMap>({});

	const hasRewards = Object.keys(claimableRewards).length > 0;

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
		setClaims(balances);
	}, [vaults, badgerTree.claims]);

	if (!onboard.isActive()) {
		return null;
	}

	if (loadingRewards || user.claimProof === undefined) {
		return (
			<Button
				disabled
				variant="outlined"
				className={clsx(classes.rewards, classes.button, classes.loadingRewardsButton)}
			>
				<Loader size={15} />
			</Button>
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
			<NoRewardsDialog open={open && !hasRewards} onClose={() => setOpen(false)} />
			<RewardsSelectionDialog
				open={open && hasRewards}
				onClose={() => setOpen(false)}
				claimableRewards={claimableRewards}
			/>
		</>
	);
});
