import React, { FC, useState, useContext } from 'react';
import { Grid, Box, Button } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import TokenAmountLabel from 'components-v2/common/TokenAmountSelector';
import TokenAmountSelector from 'components-v2/common/TokenAmountLabel';
import { ClawDetails, ConnectWalletButton, validateAmountBoundaries } from '../shared';
import { ClawParam, useMainStyles } from '../index';
import { useError, useMaxEclaw, useMintDetails, useValidateEclaw } from './mint.hooks';

export const Mint: FC = observer(() => {
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const { collaterals, eclawsByCollateral, syntheticsDataByEMP } = store;
	const classes = useMainStyles();
	const [collateral, setCollateral] = useState<ClawParam>({});
	const [mintable, setMintable] = useState<ClawParam>({});
	const error = useError(collateral, mintable);
	const maxEclaw = useMaxEclaw(collateral, mintable);
	const mintDetails = useMintDetails(collateral, mintable);
	// ONLY TESTING
	const validateEclaw = useValidateEclaw(mintable);
	const collateralToken = contracts.tokens[collateral.selectedOption || ''];
	const synthetic = syntheticsDataByEMP.get(mintable.selectedOption || '');

	const handleMint = () => {
		const [empAddress, mintAmount] = [mintable.selectedOption, mintable.amount];
		const [collateralAddress, collateralAmount] = [collateral.selectedOption, collateral.amount];
		const decimals: number | undefined = contracts.tokens[collateralAddress || '']?.decimals;

		if (!empAddress || !mintAmount || !decimals || !collateralAmount) return;

		store.mintSynthetic({
			empAddress,
			collateralAmount: ethers.utils.parseUnits(collateralAmount, decimals).toHexString(),
			mintAmount: ethers.utils.parseUnits(mintAmount, decimals).toHexString(),
		});
	};

	return (
		<Grid container>
			<Box clone pb={4}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<TokenAmountLabel
								name="Collateral"
								balanceLabel={
									collateralToken && `Available ${collaterals.get(collateralToken.address)}`
								}
								balance={collateralToken?.balance
									.dividedBy(10 ** collateralToken.decimals)
									.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN)}
							/>
						</Grid>
					</Box>
					<Grid item xs={12}>
						<TokenAmountSelector
							placeholder="Select Token"
							displayAmount={collateral.amount}
							selectedOption={collateral.selectedOption}
							options={collaterals}
							disabledOptions={!wallet.connectedAddress}
							disabledAmount={!collateral.selectedOption}
							onAmountChange={(amount: string) => {
								if (!collateralToken) return;
								setCollateral({
									...collateral,
									amount,
									error: validateAmountBoundaries({
										amount: new BigNumber(amount).multipliedBy(10 ** collateralToken.decimals),
										maximum: collateralToken.balance,
									}),
								});
							}}
							onOptionChange={(selectedOption: string) => {
								setMintable({});
								setCollateral({
									...collateral,
									selectedOption,
									amount: undefined,
								});
							}}
							onApplyPercentage={(percentage: number) => {
								if (!collateralToken) return;
								setCollateral({
									...collateral,
									amount: collateralToken?.balance
										.multipliedBy(percentage / 100)
										.dividedBy(10 ** collateralToken.decimals)
										.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN),
								});
							}}
						/>
					</Grid>
				</Grid>
			</Box>
			<Grid item xs={12}>
				<Box clone pb={1}>
					<Grid item xs={12}>
						<TokenAmountLabel
							name="Mintable"
							balanceLabel={maxEclaw ? 'Max eCLAW:' : ''}
							balance={
								maxEclaw &&
								collateralToken &&
								`Maximum eCLAW: ${maxEclaw
									.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN)
									.toString()}`
							}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<TokenAmountSelector
						placeholder="Select eCLAW"
						displayAmount={mintable.amount}
						selectedOption={mintable.selectedOption}
						disabledOptions={!collateral.selectedOption || !collateral.amount}
						disabledAmount={!collateral.selectedOption || !mintable.selectedOption}
						onAmountChange={(amount: string) => {
							if (!synthetic || !maxEclaw) return;

							setMintable({
								...mintable,
								amount,
								error: validateAmountBoundaries({
									amount: new BigNumber(amount).multipliedBy(10 ** collateralToken.decimals),
									minimum: synthetic.minSponsorTokens,
								}),
							});
						}}
						onApplyPercentage={(percentage: number) => {
							if (!synthetic || !maxEclaw || !collateralToken) return;

							const amount = maxEclaw
								.multipliedBy(percentage / 100)
								.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN);

							setMintable({
								...mintable,
								amount,
								error: validateAmountBoundaries({
									amount,
									maximum: validateEclaw ? maxEclaw : undefined,
									minimum: synthetic.minSponsorTokens.dividedBy(10 ** collateralToken.decimals),
								}),
							});
						}}
						options={
							collateral.selectedOption ? eclawsByCollateral.get(collateral.selectedOption) : new Map()
						}
						onOptionChange={(selectedOption: string) => {
							setMintable({
								...mintable,
								selectedOption,
							});
						}}
					/>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container className={classes.details}>
					<ClawDetails details={mintDetails} />
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container>
					{!wallet.connectedAddress ? (
						<ConnectWalletButton />
					) : (
						<Button
							color="primary"
							variant="contained"
							onClick={handleMint}
							disabled={!!error || !collateral.selectedOption || !mintable.selectedOption}
							size="large"
							className={classes.button}
						>
							{error ? error : 'MINT'}
						</Button>
					)}
				</Grid>
			</Grid>
		</Grid>
	);
});

export default Mint;
