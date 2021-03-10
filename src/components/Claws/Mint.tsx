import React, { FC, useMemo, useState, useContext } from 'react';
import { Grid, Box, Button } from '@material-ui/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import ClawParams from './ClawParams';
import { ClawParam, INVALID_REASON, useMainStyles } from './index';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';
import BigNumber from 'bignumber.js';
import { ConnectWalletButton } from './ConnectWalletButton';
import { validateAmountBoundaries } from './utils';

dayjs.extend(utc);

const defaultDetails = {
	'Collateral Ratio - Global': '-',
	'Collateral Ratio - Minimum': '-',
	'Collateral Ratio - Current': `-`,
	Expiration: '-',
	'Minimum Mint': '-',
};

export const Mint: FC = observer(() => {
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const { collaterals, eclawsByCollateral, syntheticsDataByEMP } = store;
	const classes = useMainStyles();
	const [collateral, setCollateral] = useState<ClawParam>({});
	const [mintable, setMintable] = useState<ClawParam>({});

	const collateralToken = contracts.tokens[collateral.selectedOption || ''];
	const collateralName = collaterals.get(collateralToken?.address || '') || 'Collateral Token';
	const synthetic = syntheticsDataByEMP.get(mintable.selectedOption || '');

	const collateralBalanceError =
		collateral.error === INVALID_REASON.OVER_MAXIMUM && `Insufficient ${collateralName} balance`;
	const mintableBalanceError =
		mintable.error &&
		(mintable.error === INVALID_REASON.OVER_MAXIMUM ? 'Insufficient eCLAW balance' : 'Insufficient eCLAW amount');
	const noCollateral = !collateral.selectedOption && 'Select a Collateral Token';
	const noCollateralAmount = !collateral.amount && 'Enter collateral amount';
	const noMintable = !mintable.selectedOption && 'Select a Mintable eCLAW';
	const noMintableAmount = !mintable.amount && 'Enter amount to mint';

	const error =
		collateralBalanceError ||
		mintableBalanceError ||
		noCollateral ||
		noCollateralAmount ||
		noMintable ||
		noMintableAmount;

	const maxEclaw = useMemo(() => {
		const synthetics = syntheticsDataByEMP.get(mintable.selectedOption || '');
		if (!synthetics || !collateral.amount) return;

		const { globalCollateralizationRatio, cumulativeFeeMultiplier, collateralRequirement } = synthetics;
		const collateralAmount = new BigNumber(collateral.amount);

		// Btw, for using min collateral ratio as initial GCR - we can't actually do that in practice since there's no defined price relationship between collateral < -> synthetic tokens.
		// It's fine for testing but we'll need to remove that logic before release and set the starting GCR by an initial mint(to start the GCR above 1.2x based on current price at launch
		const ratio = globalCollateralizationRatio.isZero() ? collateralRequirement : globalCollateralizationRatio;

		return collateralAmount.multipliedBy(cumulativeFeeMultiplier).dividedBy(ratio);
	}, [collateral.amount, mintable.selectedOption, syntheticsDataByEMP]);

	const mintDetails = useMemo(() => {
		const synthetics = syntheticsDataByEMP.get(mintable.selectedOption || '');
		if (!synthetics || !collateralToken) return defaultDetails;

		const {
			globalCollateralizationRatio,
			minSponsorTokens,
			collateralRequirement,
			expirationTimestamp,
		} = synthetics;
		const precision = 10 ** collateralToken.decimals;

		return {
			'Liquidation Price': '1.000 (Still Hardcoded)',
			'Collateral Ratio - Global': `${globalCollateralizationRatio.dividedBy(precision).toString()}x`,
			'Collateral Ratio - Minimum': `${collateralRequirement.dividedBy(precision).toString()}x`,
			'Collateral Ratio - Current': `4x (Still Hardcoded)`,
			Expiration: `${dayjs(new Date(expirationTimestamp.toNumber() * 1000))
				.utc()
				.format('MMMM DD, YYYY HH:mm')} UTC`,
			'Minimum Mint': `${minSponsorTokens.dividedBy(precision).toString()} eCLAW`,
		};
	}, [mintable.selectedOption, collateralToken, syntheticsDataByEMP]);

	const handleMint = async () => {
		console.log(wallet.provider);
	};

	return (
		<Grid container>
			<Box clone pb={4}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<ClawLabel
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
						<ClawParams
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
						<ClawLabel
							name="Mintable"
							balanceLabel={maxEclaw && 'Max eCLAW:'}
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
					<ClawParams
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
									amount,
									maximum: maxEclaw,
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
									maximum: maxEclaw,
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
