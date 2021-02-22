import React, { FC, useState } from 'react';
import { Box, Button, Container, Grid, MenuItem, Select } from '@material-ui/core';
import { useMainStyles } from './index';
import ClawParams, { ClawParam } from './ClawParams';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';

const depositOptions = ['wBTCwETHSLP', 'bBadger'];
const withdrawOptions = ['eCLAW FEB29', 'eCLAW MARCH29'];

const eCLAWS: Record<string, string> = {
	wBTCwETHSLP: '0.000017',
	bBadger: '0.000017',
	'eCLAW FEB29': '1000',
	'eCLAW MARCH29': '2000',
};

const options: Record<string, string[]> = {
	deposit: depositOptions,
	withdraw: withdrawOptions,
};

const initialValue = { amount: '0.00' };

const Manage: FC = () => {
	const classes = useMainStyles();
	const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
	const [txParams, setTxParams] = useState<ClawParam>(initialValue);

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
							setTxParams(initialValue);
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
							balanceLabel={txParams.selectedOption ? `Available ${txParams.selectedOption}:` : ''}
							balance={txParams.selectedOption ? eCLAWS[txParams.selectedOption] : ''}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<ClawParams
						referenceBalance={txParams.selectedOption ? eCLAWS[txParams.selectedOption] : ''}
						placeholder="Select Token"
						amount={txParams.amount}
						onAmountChange={(amount: string, error?: boolean) => {
							setTxParams({
								...txParams,
								amount,
								error: error ? `Amount exceeds ${txParams.selectedOption} balance` : undefined,
							});
						}}
						selectedOption={txParams.selectedOption}
						options={options[mode]}
						onOptionChange={(selectedOption: string) => {
							setTxParams({
								selectedOption,
								amount: '0.00',
								error: undefined,
							});
						}}
						disabledAmount={!txParams.selectedOption}
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
				<Grid xs={12}>
					<Grid container>
						<Button
							color="primary"
							variant="contained"
							disabled={!!txParams.error || !txParams.selectedOption}
							size="large"
							className={classes.button}
						>
							{txParams.error ? txParams.error : mode.toLocaleUpperCase()}
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
};

export default Manage;
