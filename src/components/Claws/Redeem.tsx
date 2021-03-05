import React, { FC, useContext, useMemo, useState } from 'react';
import { Box, Button, Grid, InputBase, makeStyles, Typography } from '@material-ui/core';
import ClawParams, { ClawParam } from './ClawParams';
import { useMainStyles } from './index';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';
import { StoreContext } from 'mobx/store-context';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles((theme) => ({
	border: {
		border: '1px solid #5C5C5C',
		borderRadius: 8,
	},
	selectContainer: {
		[theme.breakpoints.only('xs')]: {
			justifyContent: 'space-between',
		},
		[theme.breakpoints.up('lg')]: {
			paddingLeft: '10%',
		},
	},
	margin: {
		margin: theme.spacing(1),
	},
	centered: {
		margin: 'auto',
	},
}));

const Redeem: FC = () => {
	const { claw: store, contracts } = useContext(StoreContext);
	const { collaterals, eClaws, syntheticsDataByEMP, sponsorInformationByEMP } = store;
	const { tokens } = contracts;
	const mainClasses = useMainStyles();
	const classes = useStyles();
	const [{ selectedOption, amount, error }, setRedeemParams] = useState<ClawParam>({});

	const amountToReceive = useMemo(() => {
		const synthetic = selectedOption && syntheticsDataByEMP.get(selectedOption);
		const userEmpInformation = sponsorInformationByEMP.get(selectedOption || '');
		if (!amount || !userEmpInformation || !synthetic) return;

		const { tokensOutstanding, rawCollateral } = userEmpInformation.position;
		const fractionRedeemed = new BigNumber(amount).dividedBy(tokensOutstanding);
		const feeAdjustedCollateral = rawCollateral.multipliedBy(synthetic.cumulativeFeeMultiplier);

		return fractionRedeemed.multipliedBy(feeAdjustedCollateral);
	}, [amount, selectedOption, sponsorInformationByEMP, syntheticsDataByEMP]);

	const selectedSynthetic = selectedOption && syntheticsDataByEMP.get(selectedOption);
	const userEclawBalance = sponsorInformationByEMP.get(selectedOption || '')?.position.tokensOutstanding;
	const token = selectedSynthetic && tokens[selectedSynthetic.collateralCurrency.toLocaleLowerCase()];

	console.log({
		selectedOption,
		amountToReceive,
	});

	return (
		<Grid container>
			<Box clone pb={2}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<ClawLabel
								name="Token"
								balanceLabel={selectedOption && `Available ${eClaws.get(selectedOption)}:`}
								balance={userEclawBalance?.toString()}
							/>
						</Grid>
					</Box>
					<ClawParams
						referenceBalance={userEclawBalance}
						options={eClaws}
						placeholder="Select Token"
						amount={amount}
						onAmountChange={(amount: string, error?: boolean) => {
							setRedeemParams({
								selectedOption,
								amount,
								error: error ? `Amount exceeds ${selectedOption} balance` : undefined,
							});
						}}
						selectedOption={selectedOption}
						onOptionChange={(selectedOption: string) => {
							setRedeemParams({
								selectedOption,
								amount: undefined,
								error: undefined,
							});
						}}
						disabledAmount={!selectedOption}
						onApplyPercentage={() => {}}
					/>
				</Grid>
			</Box>
			{token && (
				<Box clone py={2}>
					<Grid item xs={12} sm={8} className={classes.centered}>
						<Box clone pb={1}>
							<Grid item xs={12}>
								<ClawLabel name="You Receive" />
							</Grid>
						</Box>
						<Box clone py={1} px={2}>
							<Grid container alignContent="center" alignItems="center" className={classes.border}>
								<Grid item xs={12}>
									<Grid container alignItems="center" spacing={2} className={classes.selectContainer}>
										<Grid item xs={12} sm={6}>
											<Typography>{collaterals.get(token.address)}</Typography>
										</Grid>
										<Grid item xs={12} sm={6}>
											<InputBase type="tel" disabled placeholder="0.00" value="" />
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Box>
					</Grid>
				</Box>
			)}
			<Grid item xs={12}>
				<Grid container className={mainClasses.details}>
					<ClawDetails
						details={[
							{ 'Expiration Date': 'Feb 29, 2021 8:00 UTC' },
							{ 'Expiration Price': '1 eCLAW FEB29 = .000001 wBTCWethSLP' },
						]}
					/>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container>
					<Button
						color="primary"
						variant="contained"
						disabled={!!error || !selectedOption}
						size="large"
						className={mainClasses.button}
					>
						{error ? error : 'REDEEM'}
					</Button>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default Redeem;
