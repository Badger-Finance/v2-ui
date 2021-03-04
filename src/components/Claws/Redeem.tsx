import React, { FC, useState } from 'react';
import { Box, Button, Grid, InputBase, makeStyles, Typography } from '@material-ui/core';
import ClawParams, { ClawParam } from './ClawParams';
import { useMainStyles } from './index';
import ClawLabel from './ClawLabel';
import ClawDetails from './ClawDetails';

const options = ['eCLAW FEB29', 'eCLAW MARCH29'];

const eCLAWS: Record<string, string> = {
	'eCLAW FEB29': '1000',
	'eCLAW MARCH29': '2000',
};

const redeemableTokens: Record<string, string> = {
	'eCLAW FEB29': 'wBTCwETHSLP',
	'eCLAW MARCH29': 'bBadger',
};

const initialValue = { amount: '0.00' };

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
	const mainClasses = useMainStyles();
	const classes = useStyles();
	const [redeemParams, setRedeemParams] = useState<ClawParam>(initialValue);

	return (
		<Grid container>
			<Box clone pb={2}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<ClawLabel
								name="Token"
								balanceLabel={
									redeemParams.selectedOption && `Available ${redeemParams.selectedOption}:`
								}
								balance={redeemParams.selectedOption && eCLAWS[redeemParams.selectedOption]}
							/>
						</Grid>
					</Box>
					<ClawParams
						// referenceBalance={redeemParams.selectedOption && eCLAWS[redeemParams.selectedOption]}
						placeholder="Select Token"
						amount={redeemParams.amount}
						onAmountChange={(amount: string, error?: boolean) => {
							setRedeemParams({
								...redeemParams,
								amount,
								error: error ? `Amount exceeds ${redeemParams.selectedOption} balance` : undefined,
							});
						}}
						selectedOption={redeemParams.selectedOption}
						onOptionChange={(selectedOption: string) => {
							setRedeemParams({
								selectedOption,
								amount: '0.00',
								error: undefined,
							});
						}}
						disabledAmount={!redeemParams.selectedOption}
						onApplyPercentage={() => {}}
					/>
				</Grid>
			</Box>
			{redeemParams.selectedOption && (
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
											<Typography>{redeemableTokens[redeemParams.selectedOption]}</Typography>
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
						disabled={!!redeemParams.error || !redeemParams.selectedOption}
						size="large"
						className={mainClasses.button}
					>
						{redeemParams.error ? redeemParams.error : 'REDEEM'}
					</Button>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default Redeem;
