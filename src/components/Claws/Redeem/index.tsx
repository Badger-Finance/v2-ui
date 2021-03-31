import React, { FC, useContext, useState } from 'react';
import { Box, Button, Grid, InputBase, makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from 'mobx/store-context';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import TokenAmountLabel from 'components-v2/common/TokenAmountLabel';
import TokenAmountSelector from 'components-v2/common/TokenAmountSelector';
import { scaleToString, Direction } from 'utils/componentHelpers';
import { ClawParam, useMainStyles } from '../index';
import { ClawDetails, ActionButton, validateAmountBoundaries } from '../shared';
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
	const { collaterals, claws, syntheticsDataByEMP, sponsorInformationByEMP } = store;
	const mainClasses = useMainStyles();
	const classes = useStyles();
	const [redeem, setRedeemParams] = useState<ClawParam>({});
	const details = useDetails(redeem);
	const error = useError(redeem);

	const { selectedOption, amount } = redeem;
	const selectedSynthetic = syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency ?? ''];
	const decimals = bToken ? bToken.decimals : 18; // Default to 18 decimals.
	const clawBalance = sponsorInformationByEMP.get(selectedOption || '')?.position.tokensOutstanding;
	const amountToReceive = useAmountToReceive(redeem, decimals);

	const handleRedeem = () => {
		const [empAddress, numTokens] = [selectedOption, amount];
		if (!empAddress || !numTokens) return;
		store.actionStore.redeem(empAddress, new ethers.utils.BigNumber(numTokens).toHexString());
	};

	return (
		<Grid container>
			<Box clone pb={2}>
				<Grid item xs={12}>
					<Box clone pb={1}>
						<Grid item xs={12}>
							<TokenAmountLabel
								name="Token"
								balanceLabel={selectedOption && `Available ${claws.get(selectedOption)}:`}
								balance={selectedOption && scaleToString(clawBalance, decimals, Direction.Down)}
							/>
						</Grid>
					</Box>
					<TokenAmountSelector
						options={claws}
						placeholder="Select Token"
						displayAmount={scaleToString(amount, decimals, Direction.Down)}
						onAmountChange={(amount: string) => {
							if (!clawBalance || !bToken) return;
							amount = scaleToString(amount, bToken.decimals, Direction.Up);
							setRedeemParams({
								selectedOption,
								amount,
								error: validateAmountBoundaries({ amount, maximum: clawBalance }),
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
							if (!clawBalance || !bToken) return;

							setRedeemParams({
								selectedOption,
								amount: clawBalance.multipliedBy(percentage / 100).toFixed(0, BigNumber.ROUND_DOWN),
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
												value={scaleToString(amountToReceive, decimals, Direction.Down)}
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
					<ActionButton text={error ? error : 'REDEEM'} disabled={!!error} onClick={handleRedeem} />
				</Grid>
			</Grid>
		</Grid>
	);
};

export default Redeem;
