import React, { FC, useContext, useState } from 'react';
import { Box, Button, Container, Grid, MenuItem, Select } from '@material-ui/core';
import { useMainStyles } from './index';
import ClawParams, { ClawParam } from './ClawParams';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';
import { StoreContext } from 'mobx/store-context';
import BigNumber from 'bignumber.js';

const Manage: FC = () => {
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const { collaterals, eClaws, syntheticsDataByEMP } = store;
	const { tokens } = contracts;
	const classes = useMainStyles();
	const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
	const [manageParams, setManageParams] = useState<ClawParam>({});

	const selectedSynthetic = syntheticsDataByEMP.get(manageParams.selectedOption || '');
	const token = selectedSynthetic && tokens[selectedSynthetic.collateralCurrency.toLocaleLowerCase()];

	return (
		<Container>
			<Box pb={1}>
				<Grid item xs={12} sm={3} style={{ margin: 'auto' }}>
					<Select
						displayEmpty
						fullWidth
						variant="outlined"
						color="secondary"
						value={mode}
						style={{ textAlign: 'center' }}
						onChange={(v: any) => {
							setManageParams({});
							setMode(v.target.value);
						}}
					>
						<MenuItem value="" disabled>
							Select Mode
						</MenuItem>
						<MenuItem value="deposit">DEPOSIT</MenuItem>
						<MenuItem value="withdraw">WITHDRAW</MenuItem>
					</Select>
				</Grid>
			</Box>
			<Grid item xs={12}>
				<Box clone pb={1}>
					<Grid item xs={12}>
						<ClawLabel
							name="Token"
							balanceLabel={token && `Available ${collaterals.get(token.address)}: `}
							balance={token?.balance
								.dividedBy(10 ** token.decimals)
								.toFixed(token.decimals, BigNumber.ROUND_DOWN)}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<ClawParams
						options={eClaws}
						referenceBalance={token?.balance.dividedBy(10 ** token.decimals)}
						placeholder="Select Token"
						amount={manageParams.amount}
						selectedOption={manageParams.selectedOption}
						disabledAmount={!manageParams.selectedOption}
						onAmountChange={(amount: string, error?: boolean) => {
							const collateralName = token ? collaterals.get(token.address) : 'collateral token';
							setManageParams({
								...manageParams,
								amount,
								error: error ? `Amount exceeds ${collateralName} balance` : undefined,
							});
						}}
						onOptionChange={(selectedOption: string) => {
							setManageParams({
								selectedOption,
							});
						}}
						onApplyPercentage={(percentage: number) => {
							setManageParams({
								...manageParams,
								amount: token?.balance
									.multipliedBy(percentage / 100)
									.dividedBy(10 ** token.decimals)
									.toFixed(token.decimals, BigNumber.ROUND_DOWN),
							});
						}}
					/>
				</Grid>
				<Grid item xs={12}>
					<Grid container className={classes.details}>
						<ClawDetails
							details={[
								{ 'Liquidation Price': '1.000' },
								{ 'Collateral Ratio - Global': '1.2x' },
								{ 'Collateral Ratio - Minimum': '1.2x' },
								{ 'Collateral Ratio - Current': '4x' },
								{ 'Expiration 4x': 'Feb 29th, 2021' },
								{ 'Minimum Deposit': '100 eCLAW' },
							]}
						/>
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Grid container>
						<Button
							color="primary"
							variant="contained"
							disabled={!!manageParams.error || !manageParams.selectedOption}
							size="large"
							className={classes.button}
						>
							{manageParams.error ? manageParams.error : mode.toLocaleUpperCase()}
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
};

export default Manage;
