import React, { FC, useContext, useState } from 'react';
import { Box, Button, Container, Grid, MenuItem, Select } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { StoreContext } from 'mobx/store-context';

import TokenAmountLabel from 'components-v2/common/TokenAmountSelector';
import TokenAmountSelector from 'components-v2/common/TokenAmountLabel';
import { scaleToString, Direction } from 'utils/componentHelpers';
import { useDetails, useError } from './manage.hooks';
import { ClawDetails, ConnectWalletButton, validateAmountBoundaries } from '../shared';
import { ClawParam, useMainStyles } from '../index';

const Manage: FC = () => {
	const { claw: store, contracts, wallet } = useContext(StoreContext);
	const { collaterals, claws, syntheticsDataByEMP, sponsorInformationByEMP } = store;
	const classes = useMainStyles();
	const [mode, setMode] = useState<'deposit' | 'withdraw' | 'request_withdrawal' | 'cancel_withdrawal'>('deposit');
	const [manage, setManageParams] = useState<ClawParam>({});
	const details = useDetails(mode, manage);
	const error = useError(manage);

	const { selectedOption, amount } = manage;
	const selectedSynthetic = syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency.toLocaleLowerCase() ?? ''];
        const decimals = bToken ? bToken.decimals : 18; // Default to 18 decimals.
        const position = sponsorInformationByEMP.get(selectedOption || '')?.position

        let balanceLabel = '';
        let balance = new BigNumber(0);
        switch (mode) {
                case 'deposit':
                        balance = bToken?.balance;
                        balanceLabel = bToken && `Available ${collaterals.get(bToken.address)}: `;
                        break;
                case 'withdraw':
                case 'request_withdrawal':
                        balanceLabel = bToken && `Deposited collateral ${collaterals.get(bToken.address)}: `;
                        if (position) {
                                balance = position.rawCollateral;
                        }
                        break;
        }

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
						<MenuItem value="request_withdrawal">REQUEST WITHDRAWAL</MenuItem>
						<MenuItem value="cancel_withdrawal">CANCEL WITHDRAWAL</MenuItem>
					</Select>
				</Grid>
			</Box>
			<Grid item xs={12}>
				<Box clone pb={1}>
					<Grid item xs={12}>
						<TokenAmountLabel
							name="Token"
							balanceLabel={balanceLabel}
							balance={selectedOption && scaleToString(balance, decimals, Direction.Down)}
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
							if (!balance) return;

							setManageParams({
								selectedOption,
								amount,
								error: validateAmountBoundaries({
									amount,
									maximum: balance,
								}),
							});
						}}
						onApplyPercentage={(percentage: number) => {
							if (!balance) return;

							setManageParams({
								selectedOption,
								amount: balance
                                                                        .multipliedBy(percentage / 100)
									.toFixed(0, BigNumber.ROUND_DOWN),
								error: undefined,
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
