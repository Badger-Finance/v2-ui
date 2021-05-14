import React, { useCallback, useContext, useState } from 'react';
import { Button, Typography, Grid, Tooltip } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import { debounce } from 'utils/componentHelpers';
import { ZERO } from 'config/constants';
import { BigNumber } from 'bignumber.js';
import { Token, Tokens } from './Tokens';
import { DownArrow } from './DownArrow';

import { TokenModel } from 'mobx/model';
import { StoreContext } from 'mobx/store-context';
import { useConnectWallet } from 'mobx/utils/hooks';
import {
	EndAlignText,
	InputTokenAmount,
	BorderedFocusableContainerGrid,
	OutputContentGrid,
	SummaryGrid,
	BalanceGrid,
	InputTokenActionButtonsGrid,
	OutputBalanceText,
	OutputAmountText,
	OutputTokenGrid,
} from './Common';
import { MintError } from './MintError';

type Amount = {
	displayValue: string;
	actualValue: BigNumber;
};

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
							MINT
						</Button>
					</span>
				</Tooltip>
			);
		}

		return <>{children}</>;
	},
);

export const Mint = observer(
	(): JSX.Element => {
		const store = useContext(StoreContext);

		const {
			ibBTCStore: { tokens, ibBTC, mintFeePercent },
			wallet: { connectedAddress },
		} = store;

		const [selectedToken, setSelectedToken] = useState(tokens[0]);
		const [inputAmount, setInputAmount] = useState<Amount>();
		const [outputAmount, setOutputAmount] = useState<Amount>();
		const [isValidMint, setIsValidMint] = useState(false);
		const [conversionRate, setConversionRate] = useState<string>();
		const [fee, setFee] = useState('0.000');
		const [totalMint, setTotalMint] = useState('0.000');
		const shouldDisplayError = !!inputAmount && !isValidMint;

		const resetState = () => {
			setInputAmount(undefined);
			setOutputAmount(undefined);
			setFee('0.000');
			setTotalMint('0.000');
		};

		const setMintInformation = (inputAmount: BigNumber, outputAmount: BigNumber, fee: BigNumber): void => {
			setFee(fee.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
			setTotalMint(outputAmount.toFixed(6, BigNumber.ROUND_HALF_FLOOR));
			setConversionRate(outputAmount.plus(fee).dividedBy(inputAmount).toFixed(6, BigNumber.ROUND_HALF_FLOOR));
		};

		const calculateMintInformation = async (settTokenAmount: BigNumber, settToken: TokenModel): Promise<void> => {
			const { bBTC, fee } = await store.ibBTCStore.calcMintAmount(settToken, settTokenAmount);
			const isValid = store.ibBTCStore.isValidMint(settToken, bBTC);

			setOutputAmount({
				displayValue: ibBTC.unscale(bBTC).toFixed(6, BigNumber.ROUND_HALF_FLOOR),
				actualValue: bBTC,
			});
			setMintInformation(settToken.unscale(settTokenAmount), ibBTC.unscale(bBTC), ibBTC.unscale(fee));
			setIsValidMint(isValid);
		};

		// reason: the plugin does not recognize the dependency inside the debounce function
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const handleInputAmountChange = useCallback(
			debounce(
				600,
				async (change: string): Promise<void> => {
					const input = new BigNumber(change);

					if (!input.gt(ZERO)) {
						setOutputAmount(undefined);
						setFee('0.000');
						setTotalMint('0.000');
						return;
					}

					await calculateMintInformation(selectedToken.scale(input), selectedToken);
				},
			),
			[selectedToken],
		);

		const handleApplyMaxBalance = async (): Promise<void> => {
			if (selectedToken.balance.gt(ZERO)) {
				setInputAmount({
					displayValue: selectedToken.unscale(selectedToken.balance).toFixed(6, BigNumber.ROUND_HALF_FLOOR),
					actualValue: selectedToken.balance,
				});
				await calculateMintInformation(selectedToken.balance, selectedToken);
			}
		};

		const handleTokenChange = async (token: TokenModel): Promise<void> => {
			setSelectedToken(token);
			if (inputAmount?.displayValue) {
				setInputAmount({
					...inputAmount,
					actualValue: token.scale(inputAmount.displayValue),
				});
				await calculateMintInformation(token.scale(inputAmount.displayValue), token);
			}
		};

		const handleMintClick = async (): Promise<void> => {
			if (inputAmount?.actualValue && !inputAmount.actualValue.isNaN()) {
				await store.ibBTCStore.mint(selectedToken, inputAmount.actualValue);
				resetState();
			}
		};

		return (
			<>
				<Grid container>
					<BalanceGrid item xs={12}>
						<EndAlignText variant="body1" color="textSecondary">
							Balance: {selectedToken.formattedBalance}
						</EndAlignText>
					</BalanceGrid>
					<BorderedFocusableContainerGrid item container xs={12}>
						<Grid item xs={12} sm={5}>
							<InputTokenAmount
								disabled={!connectedAddress}
								value={inputAmount?.displayValue}
								placeholder="0.000"
								onChange={(val) => {
									setInputAmount({
										displayValue: val,
										actualValue: selectedToken.scale(val),
									});
									handleInputAmountChange(val);
								}}
							/>
						</Grid>
						<InputTokenActionButtonsGrid item container spacing={1} xs={12} sm={7}>
							<Grid item>
								<Button size="small" variant="outlined" onClick={handleApplyMaxBalance}>
									max
								</Button>
							</Grid>
							<Grid item>
								<Tokens tokens={tokens} selected={selectedToken} onTokenSelect={handleTokenChange} />
							</Grid>
						</InputTokenActionButtonsGrid>
					</BorderedFocusableContainerGrid>
				</Grid>
				<Grid item container alignItems="center" xs={12}>
					<DownArrow />
				</Grid>
				<Grid container>
					<Grid item xs={12}>
						<OutputBalanceText variant="body1" color="textSecondary">
							Balance: {ibBTC.formattedBalance}
						</OutputBalanceText>
					</Grid>
					<OutputContentGrid container item xs={12}>
						<Grid item xs={12} sm={9} md={12} lg={10}>
							<OutputAmountText variant="h1">{outputAmount?.displayValue || '0.000'}</OutputAmountText>
						</Grid>
						<OutputTokenGrid item container xs={12} sm={3} md={12} lg={2}>
							<Token token={ibBTC} />
						</OutputTokenGrid>
					</OutputContentGrid>
				</Grid>
				<Grid item xs={12}>
					<SummaryGrid>
						{shouldDisplayError && outputAmount && (
							<MintError amount={outputAmount.actualValue} token={selectedToken} />
						)}
						<Grid item xs={12} container justify="space-between">
							<Grid item xs={6}>
								<Typography variant="subtitle1">Current Conversion Rate: </Typography>
							</Grid>
							<Grid item xs={6}>
								<EndAlignText variant="body1">
									1 {selectedToken.symbol} : {conversionRate || selectedToken.mintRate} {ibBTC.symbol}
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
										title={'Mint Fee: ' + mintFeePercent + '%'}
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
								<Typography variant="subtitle1">Total Mint Amount: </Typography>
							</Grid>
							<Grid item xs={6}>
								<EndAlignText variant="body1">{`${totalMint} ${ibBTC.symbol}`}</EndAlignText>
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
							onClick={handleMintClick}
							disabled={!inputAmount || !outputAmount || !isValidMint}
						>
							MINT
						</Button>
					</ActionButton>
				</Grid>
			</>
		);
	},
);
