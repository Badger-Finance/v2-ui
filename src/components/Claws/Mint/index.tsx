import React from 'react';
import { Grid, Box } from '@material-ui/core';
import { ethers } from 'ethers';
import { observer } from 'mobx-react-lite';

import { StoreContext } from 'mobx/store-context';
import { TokenSelectorLabel } from 'components-v2/common/TokenSelectorLabel';
import { TokenSelectorWithAmountContainer } from 'components-v2/common/TokenSelectorWithAmountContainer';
import { ActionButton } from '../ActionButton';
import { ClawDetails } from '../ClawDetails';
import { useMainStyles } from '../index';
import { useError, useMaxClaw, useDetails, useValidateClaw } from './mint.hooks';
import { mintReducer, State } from './mint.reducer';
import { scaleToString, Direction } from 'utils/componentHelpers';
import { TokenSelect } from '../../../components-v2/common/TokenSelect';
import { TokenAmountInput } from '../../../components-v2/common/TokenAmountInput';
import { PercentageGroup } from '../../../components-v2/common/PercentageGroup';

const initialState: State = { collateral: {}, synthetic: {} };

export const Mint = observer(() => {
	const { claw: store, contracts, wallet } = React.useContext(StoreContext);
	const { collaterals, clawsByCollateral, syntheticsDataByEMP } = store;
	const classes = useMainStyles();
	const [state, dispatch] = React.useReducer(mintReducer, initialState);
	const { collateral, synthetic } = state;
	const error = useError(collateral, synthetic);
	const maxClaw = useMaxClaw(collateral, synthetic);
	const mintDetails = useDetails(collateral, synthetic);
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
					<TokenSelectorWithAmountContainer
						tokenBalanceInformation={
							<TokenSelectorLabel
								name="Collateral"
								balanceLabel={
									collateralToken && `Available ${collaterals.get(collateralToken.address)}`
								}
								balance={
									collateralToken?.balance &&
									scaleToString(collateralToken.balance, collateralToken.decimals, Direction.Down)
								}
							/>
						}
						tokenList={
							<TokenSelect
								selectedOption={collateral.selectedOption}
								options={collaterals}
								placeholder="Select Token"
								disabled={!wallet.connectedAddress || collaterals.size === 0}
								onChange={(selectedOption: string) => {
									dispatch({ type: 'COLLATERAL_OPTION_CHANGE', payload: selectedOption });
								}}
							/>
						}
						tokenAmount={
							<TokenAmountInput
								value={collateral.amount}
								disabled={!collateral.selectedOption}
								onChange={(amount: string) => {
									if (!collateralToken) return;
									dispatch({
										type: 'COLLATERAL_AMOUNT_CHANGE',
										payload: { amount, collateralToken },
									});
								}}
							/>
						}
						percentagesGroup={
							<PercentageGroup
								disabled={!collateral.selectedOption}
								options={[25, 50, 75, 100]}
								onChange={(percentage: number) => {
									if (!collateralToken) return;
									dispatch({
										type: 'COLLATERAL_PERCENTAGE_CHANGE',
										payload: { percentage, collateralToken },
									});
								}}
							/>
						}
					/>
				</Grid>
			</Box>
			<Grid item xs={12}>
				<TokenSelectorWithAmountContainer
					tokenBalanceInformation={
						<TokenSelectorLabel
							name="Mintable"
							balanceLabel={maxClaw ? 'Maximum CLAW:' : ''}
							balance={
								maxClaw &&
								collateralToken &&
								scaleToString(maxClaw, collateralToken.decimals, Direction.Down)
							}
						/>
					}
					tokenList={
						<TokenSelect
							placeholder="Select CLAW"
							selectedOption={synthetic.selectedOption}
							options={
								collateral.selectedOption ? clawsByCollateral.get(collateral.selectedOption) : undefined
							}
							disabled={!collateral.selectedOption || !collateral.amount}
							onChange={(selectedOption: string) =>
								dispatch({ type: 'SYNTHETIC_OPTION_CHANGE', payload: selectedOption })
							}
						/>
					}
					tokenAmount={
						<TokenAmountInput
							value={synthetic.amount}
							disabled={!collateral.selectedOption || !synthetic.selectedOption}
							onChange={(amount: string) => {
								if (!collateralToken || !synthetic) return;
								dispatch({
									type: 'SYNTHETIC_AMOUNT_CHANGE',
									payload: { amount, collateralToken, synthetic },
								});
							}}
						/>
					}
					percentagesGroup={
						<PercentageGroup
							disabled={!collateral.selectedOption || !synthetic.selectedOption}
							options={[25, 50, 75, 100]}
							onChange={(percentage: number) => {
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
					}
				/>
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
