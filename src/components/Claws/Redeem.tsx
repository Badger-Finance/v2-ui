import React, { FC, useContext, useMemo, useState } from 'react';
import { Box, Button, Grid, InputBase, makeStyles, Typography } from '@material-ui/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import ClawParams from './ClawParams';
import { ClawParam, INVALID_REASON, useMainStyles } from './index';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';
import { StoreContext } from 'mobx/store-context';
import BigNumber from 'bignumber.js';
import { ConnectWalletButton } from './ConnectWalletButton';
import { validateAmountBoundaries } from './utils';

dayjs.extend(utc);

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

const defaultDetails = {
	'Expiration Date': '-',
	'Expiration Price': '-',
};

const Redeem: FC = () => {
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const { collaterals, eClaws, syntheticsDataByEMP, sponsorInformationByEMP } = store;
	const mainClasses = useMainStyles();
	const classes = useStyles();
	const [{ selectedOption, amount, error: redeemError }, setRedeemParams] = useState<ClawParam>({});

	const amountToReceive = useMemo(() => {
		const synthetic = syntheticsDataByEMP.get(selectedOption || '');
		const userEmpInformation = sponsorInformationByEMP.get(selectedOption || '');
		if (!amount || !userEmpInformation || !synthetic) return;

		const { tokensOutstanding, rawCollateral } = userEmpInformation.position;
		const fractionRedeemed = new BigNumber(amount).dividedBy(tokensOutstanding);
		const feeAdjustedCollateral = rawCollateral.multipliedBy(synthetic.cumulativeFeeMultiplier);

		return fractionRedeemed.multipliedBy(feeAdjustedCollateral);
	}, [amount, selectedOption, sponsorInformationByEMP, syntheticsDataByEMP]);

	const selectedSynthetic = syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];
	const eclawBalance = sponsorInformationByEMP.get(selectedOption || '')?.position.tokensOutstanding;

	const details = useMemo(() => {
		const synthetics = syntheticsDataByEMP.get(selectedOption || '');
		if (!synthetics || !bToken) return defaultDetails;

		const { expirationTimestamp } = synthetics;
		const formattedDate = dayjs(new Date(expirationTimestamp.toNumber() * 1000))
			.utc()
			.format('MMMM DD, YYYY HH:mm');

		return {
			'Expiration Date': `${formattedDate} UTC`,
			'Expiration Price': `1 ${collaterals.get(bToken.address)} = .000001 wBTCWethSLP (Still Hardcoded)`,
		};
	}, [selectedOption, bToken, collaterals]);

	const tokenError = !bToken && 'Select a token';
	const amountError = !amount && 'Enter an amount';
	const collateralError = redeemError === INVALID_REASON.OVER_MAXIMUM && 'Insufficient Collateral';
	const error = collateralError || tokenError || amountError;

	return (
		<Grid container>
			<Box clone pb={2}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<ClawLabel
								name="Token"
								balanceLabel={selectedOption && `Available ${eClaws.get(selectedOption)}:`}
								balance={selectedOption && (eclawBalance?.toString() ?? '0')}
							/>
						</Grid>
					</Box>
					<ClawParams
						options={eClaws}
						placeholder="Select Token"
						displayAmount={amount}
						onAmountChange={(amount: string) => {
							if (!eclawBalance) return;
							setRedeemParams({
								selectedOption,
								amount,
								error: validateAmountBoundaries({ amount, maximum: eclawBalance })
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
						disabledOptions={!wallet.connectedAddress}
						disabledAmount={!selectedOption || !wallet.connectedAddress}
						onApplyPercentage={(percentage) => {
							if (!eclawBalance || !bToken) return;

							setRedeemParams({
								selectedOption,
								amount: eclawBalance.multipliedBy(percentage / 100).toFixed(bToken.decimals, BigNumber.ROUND_DOWN),
								error: undefined,
							});
						}}
					/>
				</Grid>
			</Box>
			{bToken && (
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
											<Typography>{collaterals.get(bToken.address)}</Typography>
										</Grid>
										<Grid item xs={12} sm={6}>
											<InputBase
												type="tel"
												disabled
												placeholder="0.00"
												value={amountToReceive?.toString() ?? ''}
											/>
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
							className={mainClasses.button}
						>
							{error ? error : 'REDEEM'}
						</Button>
					)}
				</Grid>
			</Grid>
		</Grid>
	);
};

export default Redeem;
