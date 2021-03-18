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
	const { collaterals, claws, syntheticsDataByEMP, sponsorInformationByEMP } = store;
	const classes = useMainStyles();
	const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
	const [manage, setManageParams] = useState<ClawParam>({});
	const details = useDetails(mode, manage);
	const error = useError(manage);

	const { selectedOption, amount } = manage;
	const selectedSynthetic = syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];
        const clawBalance = sponsorInformationByEMP.get(selectedOption || '')?.position.tokensOutstanding;

	return (
		<Container>
			<Box pb={1}>
				<Grid item xs={12} sm={4} style={{ margin: 'auto' }}>
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
						<MenuItem value="withdraw">REQUEST WITHDRAWAL</MenuItem>
						<MenuItem value="withdraw">CANCEL WITHDRAWAL</MenuItem>
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
						options={claws}
						displayAmount={amount}
						selectedOption={selectedOption}
						disabledOptions={!wallet.connectedAddress}
						disabledAmount={!selectedOption || !wallet.connectedAddress}
						onAmountChange={(amount: string) => {
							if (!clawBalance) return;

							setManageParams({
								selectedOption,
								amount,
								error: validateAmountBoundaries({
									amount,
									maximum: clawBalance,
								}),
							});
						}}
						onApplyPercentage={(percentage: number) => {
							if (!clawBalance) return;

							setManageParams({
								selectedOption,
								error: undefined,
								amount: clawBalance
                                                                        .multipliedBy(percentage / 100)
									.toFixed(0, BigNumber.ROUND_DOWN),
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
