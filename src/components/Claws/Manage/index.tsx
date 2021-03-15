import React, { FC, useContext, useState } from 'react';
import { Box, Button, Container, Grid, MenuItem, Select } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { StoreContext } from 'mobx/store-context';
import { ClawParam, useMainStyles } from '../index';
import TokenAmountLabel from 'components-v2/common/TokenAmountSelector';
import TokenAmountSelector from 'components-v2/common/TokenAmountLabel';
import { ClawDetails, ConnectWalletButton, validateAmountBoundaries } from '../shared';
import { useDetails, useError } from './manage.hooks';

const Manage: FC = () => {
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const { collaterals, eClaws, syntheticsDataByEMP } = store;
	const classes = useMainStyles();
	const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
	const [manage, setManageParams] = useState<ClawParam>({});
	const details = useDetails(mode, manage);
	const error = useError(manage);

	const { selectedOption, amount } = manage;
	const selectedSynthetic = syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];

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
						<TokenAmountLabel
							name="Token"
							balanceLabel={bToken && `Available ${collaterals.get(bToken.address)}: `}
							balance={bToken?.balance
								.dividedBy(10 ** bToken.decimals)
								.toFixed(bToken.decimals, BigNumber.ROUND_DOWN)}
						/>
					</Grid>
				</Box>
				<Grid item xs={12}>
					<TokenAmountSelector
						placeholder="Select Token"
						options={eClaws}
						displayAmount={amount}
						selectedOption={selectedOption}
						disabledOptions={!wallet.connectedAddress}
						disabledAmount={!selectedOption || !wallet.connectedAddress}
						onAmountChange={(amount: string) => {
							if (!bToken) return;

							setManageParams({
								selectedOption,
								amount,
								error: validateAmountBoundaries({
									amount: new BigNumber(amount).multipliedBy(10 ** bToken.decimals),
									maximum: bToken.balance,
								}),
							});
						}}
						onApplyPercentage={(percentage: number) => {
							if (!bToken) return;

							setManageParams({
								selectedOption,
								error: undefined,
								amount: bToken.balance
									.multipliedBy(percentage / 100)
									.dividedBy(10 ** bToken.decimals)
									.toFixed(bToken.decimals, BigNumber.ROUND_DOWN),
							});
						}}
						onOptionChange={(selectedOption: string) => {
							setManageParams({
								selectedOption,
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
