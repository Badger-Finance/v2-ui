import React, { useCallback, useContext, useState } from 'react';
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
	const [maxRedeem, setMaxRedeem] = useState<BigNumber>();
	const [totalRedeem, setTotalRedeem] = useState('0.000');
	const [fee, setFee] = useState('0.000');
	const [isEnoughToRedeem, setIsEnoughToRedeem] = useState(true);

	// do not display errors for non guests, they won't be able to redeem anyways
	const showError = bouncerProof && !isEnoughToRedeem;

	const resetState = () => {
		setInputAmount('');
		setOutputAmount('');
		setMaxRedeem(undefined);
		setIsEnoughToRedeem(true);
		setFee('0.000');
		setTotalRedeem('0.000');
	};

	const setRedeemInformation = ({ inputAmount, redeemAmount, max, fee }: RedeemInformation): void => {
		setMaxRedeem(max);
		setIsEnoughToRedeem(max.gte(inputAmount));
		setOutputAmount(redeemAmount.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
		setFee(fee.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
		setTotalRedeem(redeemAmount.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
	};

	const calculateRedeem = async (input: BigNumber): Promise<void> => {
		const { sett, fee, max } = await store.ibBTCStore.calcRedeemAmount(selectedToken, ibBTC.scale(input));

		setRedeemInformation({
			inputAmount: input,
			redeemAmount: selectedToken.unscale(sett),
			max: ibBTC.unscale(max),
			fee: ibBTC.unscale(fee),
		});
	};

	// reason: the plugin does not recognize the dependency inside the debounce function
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleInputAmountChange = useCallback(
		debounce(
			600,
			async (change): Promise<void> => {
				const input = new BigNumber(change);

				if (!input.gt(ZERO)) {
					setMaxRedeem(undefined);
					setIsEnoughToRedeem(true);
					setOutputAmount('');
					setFee('0.000');
					setTotalRedeem('0.000');
					return;
				}

				await calculateRedeem(input);
			},
		),
		[selectedToken],
	);

	const handleApplyMaxBalance = async (): Promise<void> => {
		if (ibBTC.balance.gt(ZERO) && selectedToken) {
			setInputAmount(ibBTC.unscale(ibBTC.balance).toFixed(ibBTC.decimals, BigNumber.ROUND_HALF_FLOOR));
			const { sett, fee, max } = await store.ibBTCStore.calcRedeemAmount(selectedToken, ibBTC.balance);

			setRedeemInformation({
				inputAmount: ibBTC.unscale(ibBTC.balance),
				redeemAmount: selectedToken.unscale(sett),
				max: ibBTC.unscale(max),
				fee: ibBTC.unscale(fee),
			});
		}
	};

	const handleTokenChange = async (token: TokenModel): Promise<void> => {
		setSelectedToken(token);
		if (inputAmount) {
			const { sett, fee, max } = await store.ibBTCStore.calcRedeemAmount(token, ibBTC.scale(inputAmount));

			setRedeemInformation({
				inputAmount: new BigNumber(inputAmount),
				redeemAmount: token.unscale(sett),
				max: ibBTC.unscale(max),
				fee: ibBTC.unscale(fee),
			});
		}
	};

	const handleRedeemClick = async (): Promise<void> => {
		if (inputAmount) {
			await store.ibBTCStore.redeem(selectedToken, ibBTC.scale(inputAmount));
			resetState();
		}
	};

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
					{showError && maxRedeem && (
						<Grid item xs={12} container>
							<ErrorText variant="subtitle1">
								A maximum of {maxRedeem.toFixed(6, BigNumber.ROUND_HALF_FLOOR)} {ibBTC.symbol} can be
								redeemed for {selectedToken.symbol}.
							</ErrorText>
						</Grid>
					)}
					<Grid item xs={12} container justify="space-between">
						<Grid item xs={6}>
							<Typography variant="subtitle1">Current Conversion Rate: </Typography>
						</Grid>
						<Grid item xs={6}>
							<EndAlignText variant="body1">
								1 {ibBTC.symbol} : {selectedToken.redeemRate} {selectedToken.symbol}
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
