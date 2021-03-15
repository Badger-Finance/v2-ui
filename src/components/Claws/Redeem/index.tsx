import React, { FC, useContext, useState } from 'react';
import { Box, Button, Grid, InputBase, makeStyles, Typography } from '@material-ui/core';
import { ClawParam, useMainStyles } from '../index';
import { StoreContext } from 'mobx/store-context';
import BigNumber from 'bignumber.js';
import TokenAmountLabel from 'components-v2/common/TokenAmountSelector';
import TokenAmountSelector from 'components-v2/common/TokenAmountLabel';
import { ClawDetails, ConnectWalletButton, validateAmountBoundaries } from '../shared';
import { useAmountToReceive, useDetails, useError } from './redeem.hooks';

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
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const { collaterals, eClaws, syntheticsDataByEMP, sponsorInformationByEMP } = store;
	const mainClasses = useMainStyles();
	const classes = useStyles();
	const [redeem, setRedeemParams] = useState<ClawParam>({});
	const amountToReceive = useAmountToReceive(redeem);
	const details = useDetails(redeem);
	const error = useError(redeem);

	const { selectedOption, amount } = redeem;
	const selectedSynthetic = syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];
	const eclawBalance = sponsorInformationByEMP.get(selectedOption || '')?.position.tokensOutstanding;

	return (
		<Grid container>
			<Box clone pb={2}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<TokenAmountLabel
								name="Token"
								balanceLabel={selectedOption && `Available ${eClaws.get(selectedOption)}:`}
								balance={selectedOption && (eclawBalance?.toString() ?? '0')}
							/>
						</Grid>
					</Box>
					<TokenAmountSelector
						options={eClaws}
						placeholder="Select Token"
						displayAmount={amount}
						onAmountChange={(amount: string) => {
							if (!eclawBalance) return;
							setRedeemParams({
								selectedOption,
								amount,
								error: validateAmountBoundaries({ amount, maximum: eclawBalance }),
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
								amount: eclawBalance
									.multipliedBy(percentage / 100)
									.toFixed(bToken.decimals, BigNumber.ROUND_DOWN),
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
								<TokenAmountLabel name="You Receive" />
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
