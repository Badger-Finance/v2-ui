import React, { FC, useContext, useMemo, useState } from 'react';
import { Box, Button, Container, Grid, MenuItem, Select } from '@material-ui/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useMainStyles } from './index';
import ClawParams, { ClawParam } from './ClawParams';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';
import { StoreContext } from 'mobx/store-context';
import BigNumber from 'bignumber.js';
import { ConnectWalletButton } from './ConnectWalletButton';

dayjs.extend(utc);

const defaultWithdrawalDetails = {
	'Withdraw Speed': '-',
	'Collateral Ratio - Global': '-',
	'Collateral Ratio - Minimum': '-',
	'Collateral Ratio - Current': '-',
	Expiration: '-',
	'Minimum Deposit': '-',
};

const defaultDepositDetails = {
	'Liquidation Price': '-',
	'Collateral Ratio - Global': '-',
	'Collateral Ratio - Minimum': '-',
	'Collateral Ratio - Current': '-',
	Expiration: '-',
	'Minimum Deposit': '-',
};

const Manage: FC = () => {
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const { collaterals, eClaws, syntheticsDataByEMP } = store;
	const classes = useMainStyles();
	const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
	const [{ selectedOption, amount, error: paramError }, setManageParams] = useState<ClawParam>({});
	const selectedSynthetic = syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];

	const details = useMemo(() => {
		const isWithdraw = mode === 'withdraw';
		const synthetics = syntheticsDataByEMP.get(selectedOption || '');

		if (!synthetics || !bToken) return isWithdraw ? defaultWithdrawalDetails : defaultDepositDetails;

		const {
			globalCollateralizationRatio,
			minSponsorTokens,
			collateralRequirement,
			expirationTimestamp,
		} = synthetics;
		const precision = 10 ** bToken.decimals;

		const modeSpecificStats = {
			[isWithdraw ? 'Withdraw Speed' : 'Liquidation Price']: isWithdraw
				? 'Instant (Still Hardcoded)'
				: '1.000 (Still Hardcoded)',
		};

		return {
			...modeSpecificStats,
			'Collateral Ratio - Global': `${globalCollateralizationRatio.dividedBy(precision).toString()}x`,
			'Collateral Ratio - Minimum': `${collateralRequirement.dividedBy(precision).toString()}x`,
			'Collateral Ratio - Current': `4x (Still Hardcoded)`,
			Expiration: `${dayjs(new Date(expirationTimestamp.toNumber() * 1000))
				.utc()
				.format('MMMM DD, YYYY HH:mm')} UTC`,
			'Minimum Mint': `${minSponsorTokens.dividedBy(precision).toString()} eCLAW`,
		};
	}, [mode, selectedOption]);

	const noTokenError = !selectedOption && 'Select a Token';
	const amountError = !amount && 'Enter an amount';
	const error = noTokenError || amountError;

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
							balanceLabel={bToken && `Available ${collaterals.get(bToken.address)}: `}
							balance={bToken?.balance
								.dividedBy(10 ** bToken.decimals)
								.toFixed(bToken.decimals, BigNumber.ROUND_DOWN)}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<ClawParams
						options={eClaws}
						referenceBalance={bToken?.balance.dividedBy(10 ** bToken.decimals)}
						placeholder="Select Token"
						amount={amount}
						selectedOption={selectedOption}
						disabledAmount={!selectedOption}
						onAmountChange={(amount: string, error?: boolean) => {
							const collateralName = bToken ? collaterals.get(bToken.address) : 'collateral token';
							setManageParams({
								selectedOption,
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
								selectedOption,
								error: paramError,
								amount: bToken?.balance
									.multipliedBy(percentage / 100)
									.dividedBy(10 ** bToken.decimals)
									.toFixed(bToken.decimals, BigNumber.ROUND_DOWN),
							});
						}}
					/>
				</Grid>
				<Grid item xs={12}>
					<Grid container className={classes.details}>
						<ClawDetails details={details} />
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
								disabled={!!error}
								size="large"
								className={classes.button}
							>
								{error ? error : mode.toLocaleUpperCase()}
							</Button>
						)}
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
};

export default Manage;
