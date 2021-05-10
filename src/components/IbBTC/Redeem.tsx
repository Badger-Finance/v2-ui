import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Typography, Grid, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';

import { debounce } from 'utils/componentHelpers';
import { ZERO } from 'config/constants';
import { Token, Tokens } from './Tokens';
import { DownArrow } from './DownArrow';
import { StoreContext } from 'mobx/store-context';
import { TokenModel } from 'mobx/model';
import { useConnectWallet } from 'mobx/utils/hooks';
import {
	EndAlignText,
	InputTokenAmount,
	BorderedFocusableContainerGrid,
	OutputContentGrid,
	SummaryGrid,
	BalanceGrid,
	InputTokenActionButtonsGrid,
	OutputAmountText,
	OutputTokenGrid,
	ErrorText,
} from './Common';

type RedeemInformation = {
	inputAmount: BigNumber;
	redeemAmount: BigNumber;
	max: BigNumber;
	fee: BigNumber;
	conversionRate: BigNumber;
};

const useStyles = makeStyles((theme) => ({
	outputContent: {
		marginTop: theme.spacing(4),
	},
	maxAmount: {
		cursor: 'pointer',
	},
}));

const ActionButton = observer(
	({ children }): JSX.Element => {
		const store = useContext(StoreContext);
		const { bouncerProof } = store.user;
		const { connectedAddress } = store.wallet;
		const connectWallet = useConnectWallet();

		if (!connectedAddress) {
			return (
				<Button fullWidth size="large" variant="contained" color="primary" onClick={connectWallet}>
					Connect Wallet
				</Button>
			);
		}

		if (!bouncerProof) {
			return (
				<Tooltip arrow placement="top" title="You are not part of the guest list yet. Please try again later.">
					<span>
						<Button fullWidth size="large" variant="contained" color="primary" disabled>
							REDEEM
						</Button>
					</span>
				</Tooltip>
			);
		}

		return <>{children}</>;
	},
);

export const Redeem = observer((): any => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const {
		ibBTCStore: { tokens, ibBTC, redeemFeePercent },
		wallet: { connectedAddress },
		user: { bouncerProof },
	} = store;

	const [selectedToken, setSelectedToken] = useState(tokens[0]);
	const [inputAmount, setInputAmount] = useState<string>();
	const [outputAmount, setOutputAmount] = useState<string>();
	const [conversionRate, setConversionRate] = useState<string>();
	const [maxRedeem, setMaxRedeem] = useState<string>();
	const [totalRedeem, setTotalRedeem] = useState('0.000');
	const [fee, setFee] = useState('0.000');
	const [isEnoughToRedeem, setIsEnoughToRedeem] = useState(true);

	const displayedConversionRate = conversionRate || selectedToken.redeemRate;

	// do not display errors for non guests, they won't be able to redeem anyways
	const showError = bouncerProof && !isEnoughToRedeem;

	const resetState = () => {
		setInputAmount('');
		setOutputAmount('');
		setMaxRedeem('');
		setIsEnoughToRedeem(true);
		setFee('0.000');
		setTotalRedeem('0.000');
	};

	const setRedeemInformation = ({ inputAmount, redeemAmount, max, fee, conversionRate }: RedeemInformation) => {
		setMaxRedeem(max.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
		setIsEnoughToRedeem(max.gt(inputAmount));
		setOutputAmount(redeemAmount.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
		setFee(fee.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
		setTotalRedeem(redeemAmount.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
		setConversionRate(conversionRate.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
	};

	// reason: the plugin does not recognize the dependency inside the debounce function
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleInputAmountChange = useCallback(
		debounce(600, async (change) => {
			const input = new BigNumber(change);

			if (!input.gt(ZERO)) {
				setMaxRedeem('');
				setIsEnoughToRedeem(true);
				setOutputAmount('');
				setFee('0.000');
				setTotalRedeem('0.000');
				setConversionRate(selectedToken.redeemRate);
				return;
			}

			const [{ sett, fee, max }, conversionRate] = await Promise.all([
				store.ibBTCStore.calcRedeemAmount(selectedToken, ibBTC.scale(input)),
				store.ibBTCStore.getRedeemConversionRate(selectedToken),
			]);

			setRedeemInformation({
				inputAmount: input,
				redeemAmount: selectedToken.unscale(sett),
				max: ibBTC.unscale(max),
				fee: ibBTC.unscale(fee),
				conversionRate: selectedToken.unscale(conversionRate),
			});
		}),
		[selectedToken],
	);

	const handleApplyMaxBalance = async () => {
		if (ibBTC.balance.gt(ZERO) && selectedToken) {
			setInputAmount(ibBTC.unscale(ibBTC.balance).toString());

			const [{ sett, fee, max }, conversionRate] = await Promise.all([
				store.ibBTCStore.calcRedeemAmount(selectedToken, ibBTC.balance),
				store.ibBTCStore.getRedeemConversionRate(selectedToken),
			]);

			setRedeemInformation({
				inputAmount: ibBTC.unscale(ibBTC.balance),
				redeemAmount: selectedToken.unscale(sett),
				max: ibBTC.unscale(max),
				fee: ibBTC.unscale(fee),
				conversionRate: selectedToken.unscale(conversionRate),
			});
		}
	};

	const handleTokenChange = async (token: TokenModel) => {
		setSelectedToken(token);
		if (inputAmount) {
			const [{ sett, fee, max }, conversionRate] = await Promise.all([
				store.ibBTCStore.calcRedeemAmount(token, ibBTC.scale(inputAmount)),
				store.ibBTCStore.getRedeemConversionRate(token),
			]);

			setRedeemInformation({
				inputAmount: new BigNumber(inputAmount),
				redeemAmount: token.unscale(sett),
				max: ibBTC.unscale(max),
				fee: ibBTC.unscale(fee),
				conversionRate: token.unscale(conversionRate),
			});
		}
	};

	const handleRedeemClick = async () => {
		if (inputAmount) {
			await store.ibBTCStore.redeem(selectedToken, ibBTC.scale(inputAmount));
			resetState();
		}
	};

	useEffect(() => {
		const init = async () => {
			if (!connectedAddress) return;
			const initialToken = store.ibBTCStore.tokens[0];
			const conversionRate = await store.ibBTCStore.getRedeemConversionRate(initialToken);
			setConversionRate(initialToken.unscale(conversionRate).toFixed(6, BigNumber.ROUND_HALF_FLOOR));
		};

		init().then();
	}, [store.ibBTCStore, connectedAddress]);

	return (
		<>
			<Grid container>
				<BalanceGrid item xs={12}>
					<EndAlignText variant="body1" color="textSecondary">
						Balance: {ibBTC.formattedBalance}
					</EndAlignText>
				</BalanceGrid>
				<BorderedFocusableContainerGrid item container xs={12}>
					<Grid item xs={8} sm={7}>
						<InputTokenAmount
							value={inputAmount}
							disabled={!connectedAddress}
							placeholder="0.000"
							onChange={(val) => {
								setInputAmount(val);
								handleInputAmountChange(val);
							}}
						/>
					</Grid>
					<InputTokenActionButtonsGrid item container spacing={1} xs={4} sm={5}>
						<Grid item>
							<Button size="small" variant="outlined" onClick={handleApplyMaxBalance}>
								max
							</Button>
						</Grid>
						<Grid item>
							<Token token={ibBTC} />
						</Grid>
					</InputTokenActionButtonsGrid>
				</BorderedFocusableContainerGrid>
			</Grid>
			<Grid item container alignItems="center" xs={12}>
				<DownArrow />
			</Grid>
			<Grid container className={classes.outputContent}>
				<OutputContentGrid container item xs={12}>
					<Grid item xs={12} sm={7} md={12} lg={7}>
						<OutputAmountText variant="h1">{outputAmount || '0.000'}</OutputAmountText>
					</Grid>
					<OutputTokenGrid item container xs={12} sm={5} md={12} lg={5}>
						<Tokens tokens={tokens} selected={selectedToken} onTokenSelect={handleTokenChange} />
					</OutputTokenGrid>
				</OutputContentGrid>
			</Grid>
			<Grid item xs={12}>
				<SummaryGrid>
					{showError && (
						<Grid item xs={12} container>
							<ErrorText variant="subtitle1">
								<span>A maximum of </span>
								<span
									className={classes.maxAmount}
									onClick={() => {
										if (!maxRedeem) return;
										setInputAmount(maxRedeem);
										handleInputAmountChange(maxRedeem);
									}}
								>
									{maxRedeem}
								</span>
								<span>
									{' '}
									{ibBTC.symbol} can be redeemed for {selectedToken.symbol}.
								</span>
							</ErrorText>
						</Grid>
					)}
					<Grid item xs={12} container justify="space-between">
						<Grid item xs={6}>
							<Typography variant="subtitle1">Current Conversion Rate: </Typography>
						</Grid>
						<Grid item xs={6}>
							<EndAlignText variant="body1">
								1 {ibBTC.symbol} : {displayedConversionRate} {selectedToken.symbol}
							</EndAlignText>
						</Grid>
					</Grid>
					<Grid item xs={12} container justify="space-between">
						<Grid item xs={6}>
							<Typography variant="subtitle1">Fees: </Typography>
						</Grid>
						<Grid item xs={6}>
							<EndAlignText variant="body1">
								<Tooltip
									enterDelay={0}
									leaveDelay={300}
									arrow
									placement="left"
									title={'Redeem Fee: ' + redeemFeePercent + '%'}
								>
									<span>
										{fee} {ibBTC.symbol}
									</span>
								</Tooltip>
							</EndAlignText>
						</Grid>
					</Grid>
					<Grid item xs={12} container justify="space-between">
						<Grid item xs={6}>
							<Typography variant="subtitle1">Total Redeem Amount: </Typography>
						</Grid>
						<Grid item xs={6}>
							<EndAlignText variant="body1">{`${totalRedeem} ${selectedToken.symbol}`}</EndAlignText>
						</Grid>
					</Grid>
				</SummaryGrid>
			</Grid>
			<Grid item xs={12}>
				<ActionButton>
					<Button
						fullWidth
						size="large"
						variant="contained"
						color="primary"
						onClick={handleRedeemClick}
						disabled={!isEnoughToRedeem || !inputAmount || !outputAmount}
					>
						REDEEM
					</Button>
				</ActionButton>
			</Grid>
		</>
	);
});
