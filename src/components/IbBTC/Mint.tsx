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
	ErrorText,
} from './Common';

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
			ibBTCStore: { tokens, ibBTC },
			wallet: { connectedAddress },
		} = store;

		const [selectedToken, setSelectedToken] = useState(tokens[0]);
		const [inputAmount, setInputAmount] = useState<string>();
		const [outputAmount, setOutputAmount] = useState<string>();
		const [fee, setFee] = useState('0.000');
		const [totalMint, setTotalMint] = useState('0.000');
		const [conversionRate, setConversionRate] = useState('1');
		const [mintBlocker, setMintBlocker] = useState<string | null>(null);

		const resetState = () => {
			setInputAmount('');
			setOutputAmount('');
			setFee('0.000');
			setTotalMint('0.000');
			setMintBlocker(null);
		};

		const setMintInformation = (
			inputAmount: BigNumber,
			outputAmount: BigNumber,
			fee: BigNumber,
			blocker: string | null,
		): void => {
			setOutputAmount(outputAmount.toFixed());
			setFee(fee.toFixed());
			setTotalMint(outputAmount.toFixed());
			setConversionRate(outputAmount.plus(fee).dividedBy(inputAmount).toFixed());
			setMintBlocker(blocker);
		};

		// reason: the plugin does not recognize the dependency inside the debounce function
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const handleInputAmountChange = useCallback(
			debounce(600, async (change: string) => {
				const input = new BigNumber(change);

				if (!input.gt(ZERO)) {
					setOutputAmount('');
					setFee('0.000');
					setTotalMint('0.000');
					setMintBlocker(null);
					return;
				}

				const { bBTC, fee } = await store.ibBTCStore.calcMintAmount(selectedToken, selectedToken.scale(input));
				const mintBlocker = await store.ibBTCStore.getMintValidation(bBTC, selectedToken);
				setMintInformation(input, ibBTC.unscale(bBTC), ibBTC.unscale(fee), mintBlocker);
			}),
			[selectedToken],
		);

		const handleApplyMaxBalance = async () => {
			if (selectedToken.balance.gt(ZERO)) {
				setInputAmount(selectedToken.unscale(selectedToken.balance).toString());
				const { bBTC, fee } = await store.ibBTCStore.calcMintAmount(selectedToken, selectedToken.balance);
				const mintBlocker = await store.ibBTCStore.getMintValidation(bBTC, selectedToken);
				setMintInformation(
					selectedToken.unscale(selectedToken.balance),
					ibBTC.unscale(bBTC),
					ibBTC.unscale(fee),
					mintBlocker,
				);
			}
		};

		const handleTokenChange = async (token: TokenModel) => {
			setSelectedToken(token);
			if (inputAmount) {
				const { bBTC, fee } = await store.ibBTCStore.calcMintAmount(token, token.scale(inputAmount));
				const mintBlocker = await store.ibBTCStore.getMintValidation(bBTC, token);
				setMintInformation(new BigNumber(inputAmount), ibBTC.unscale(bBTC), ibBTC.unscale(fee), mintBlocker);
			}
		};

		const handleMintClick = async () => {
			if (inputAmount) {
				await store.ibBTCStore.mint(selectedToken, selectedToken.scale(inputAmount));
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
								value={inputAmount}
								placeholder="0.000"
								onChange={(val) => {
									setInputAmount(val);
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
							<OutputAmountText variant="h1">{outputAmount || '0.000'}</OutputAmountText>
						</Grid>
						<OutputTokenGrid item container xs={12} sm={3} md={12} lg={2}>
							<Token token={ibBTC} />
						</OutputTokenGrid>
					</OutputContentGrid>
				</Grid>
				<Grid item xs={12}>
					<SummaryGrid>
						{mintBlocker && (
							<Grid item xs={12} container>
								<ErrorText variant="subtitle1">{mintBlocker}</ErrorText>
							</Grid>
						)}
						<Grid item xs={12} container justify="space-between">
							<Grid item xs={6}>
								<Typography variant="subtitle1">Current Conversion Rate: </Typography>
							</Grid>
							<Grid item xs={6}>
								<EndAlignText variant="body1">
									1 {selectedToken.symbol} : {conversionRate} {ibBTC.symbol}
								</EndAlignText>
							</Grid>
						</Grid>
						<Grid item xs={12} container justify="space-between">
							<Grid item xs={6}>
								<Typography variant="subtitle1">Fees: </Typography>
							</Grid>
							<Grid item xs={6}>
								<EndAlignText variant="body1">
									{fee} {ibBTC.symbol}
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
							disabled={!inputAmount || !outputAmount || !!mintBlocker}
						>
							MINT
						</Button>
					</ActionButton>
				</Grid>
			</>
		);
	},
);
