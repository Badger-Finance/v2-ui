import React from 'react';
import { Grid, Box, Button } from '@material-ui/core';
import { ethers } from 'ethers';
import { observer } from 'mobx-react-lite';

import { StoreContext } from 'mobx/store-context';
import { TokenAmountLabel } from 'components-v2/common/TokenAmountLabel';
import { TokenAmountSelector } from 'components-v2/common/TokenAmountSelector';
import { ActionButton } from '../ActionButton';
import { ClawDetails } from '../ClawDetails';
import { useMainStyles } from '../index';
import { useError, useMaxClaw, useMintDetails, useValidateClaw } from './mint.hooks';
import { mintReducer, State } from './mint.reducer';
import { scaleToString, Direction } from 'utils/componentHelpers';

const initialState: State = { collateral: {}, synthetic: {} };

export const Mint = observer(() => {
	const { claw: store, contracts, wallet } = React.useContext(StoreContext);
	const { collaterals, clawsByCollateral, syntheticsDataByEMP } = store;
	const classes = useMainStyles();
	const [state, dispatch] = React.useReducer(mintReducer, initialState);
	const { collateral, synthetic } = state;
	const error = useError(collateral, synthetic);
	const maxClaw = useMaxClaw(collateral, synthetic);
	const mintDetails = useMintDetails(collateral, synthetic);
	const validateClaw = useValidateClaw(synthetic);

	const collateralToken = contracts.tokens[collateral.selectedOption || ''];

	const handleMint = () => {
		const [empAddress, mintAmount] = [synthetic.selectedOption, synthetic.amount];
		const [collateralAddress, collateralAmount] = [collateral.selectedOption, collateral.amount];
		const decimals: number | undefined = contracts.tokens[collateralAddress || '']?.decimals;

		if (!empAddress || !mintAmount || !decimals || !collateralAmount) return;

		store.actionStore.mint(
			empAddress,
			ethers.utils.parseUnits(collateralAmount, decimals).toHexString(),
			ethers.utils.parseUnits(mintAmount, decimals).toHexString(),
		);
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
								balance={
									collateralToken?.balance &&
									scaleToString(collateralToken.balance, collateralToken.decimals, Direction.Down)
								}
							/>
						</Grid>
					</Box>
					<Grid item xs={12}>
						<TokenAmountSelector
							placeholder="Select Token"
							displayAmount={collateral.amount}
							options={collaterals}
							selectedOption={collateral.selectedOption}
							disabledOptions={!wallet.connectedAddress}
							disabledAmount={!collateral.selectedOption}
							onOptionChange={(selectedOption: string) => {
								dispatch({ type: 'COLLATERAL_OPTION_CHANGE', payload: selectedOption });
							}}
							onAmountChange={(amount: string) => {
								if (!collateralToken) return;
								dispatch({
									type: 'COLLATERAL_AMOUNT_CHANGE',
									payload: { amount, collateralToken },
								});
							}}
							onApplyPercentage={(percentage: number) => {
								if (!collateralToken) return;
								dispatch({
									type: 'COLLATERAL_PERCENTAGE_CHANGE',
									payload: { percentage, collateralToken },
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
							balanceLabel={maxClaw ? 'Maximum CLAW:' : ''}
							balance={
								maxClaw &&
								collateralToken &&
								scaleToString(maxClaw, collateralToken.decimals, Direction.Down)
							}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<TokenAmountSelector
						placeholder="Select CLAW"
						displayAmount={synthetic.amount}
						options={
							collateral.selectedOption ? clawsByCollateral.get(collateral.selectedOption) : new Map()
						}
						selectedOption={synthetic.selectedOption}
						disabledOptions={!collateral.selectedOption || !collateral.amount}
						disabledAmount={!collateral.selectedOption || !synthetic.selectedOption}
						onOptionChange={(selectedOption: string) =>
							dispatch({ type: 'SYNTHETIC_OPTION_CHANGE', payload: selectedOption })
						}
						onAmountChange={(amount: string) => {
							if (!collateralToken || !synthetic) return;
							dispatch({
								type: 'SYNTHETIC_AMOUNT_CHANGE',
								payload: { amount, collateralToken, synthetic },
							});
						}}
						onApplyPercentage={(percentage: number) => {
							const syntheticData = syntheticsDataByEMP.get(synthetic.selectedOption || '');
							if (!syntheticData || !maxClaw || !collateralToken) return;
							dispatch({
								type: 'SYNTHETIC_PERCENTAGE_CHANGE',
								payload: {
									percentage,
									maxClaw,
									syntheticData,
									collateralToken,
									validateClaw,
								},
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
					<ActionButton
						text={error ? error : 'MINT'}
						onClick={handleMint}
						disabled={!!error || !collateral.selectedOption || !synthetic.selectedOption}
					/>
				</Grid>
			</Grid>
		</Grid>
	);
});

export default Mint;
