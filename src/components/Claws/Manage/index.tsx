import React from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react-lite';
import { Box, Button, Container, Grid, MenuItem, Select } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { StoreContext } from 'mobx/store-context';

import { TokenAmountLabel } from 'components-v2/common/TokenAmountLabel';
import { TokenAmountSelector } from 'components-v2/common/TokenAmountSelector';
import { ActionButton } from '../ActionButton';
import { ClawDetails } from '../ClawDetails';
import { scaleToString, Direction, validateAmountBoundaries } from 'utils/componentHelpers';
import { useDetails, useError } from './manage.hooks';
import { useMainStyles } from '..';
import { ClawParam } from '../claw-param.model';

enum Mode {
	DEPOSIT = 'deposit',
	WITHDRAW = 'withdraw',
}

const Manage = observer(() => {
	const { claw: store, contracts, wallet } = React.useContext(StoreContext);
	const { collaterals, claws, syntheticsDataByEMP, sponsorInformationByEMP } = store;
	const classes = useMainStyles();
	const [mode, setMode] = React.useState<Mode.DEPOSIT | Mode.WITHDRAW>(Mode.DEPOSIT);
	const [manage, setManageParams] = React.useState<ClawParam>({});
	const details = useDetails(mode, manage);
	const error = useError(manage);

	const { selectedOption, amount } = manage;
	const selectedSynthetic = syntheticsDataByEMP.get(selectedOption || '');
	const bToken = contracts.tokens[selectedSynthetic?.collateralCurrency ?? ''];
	const decimals = bToken ? bToken.decimals : 18; // Default to 18 decimals.
	const position = sponsorInformationByEMP.get(selectedOption || '')?.position;

	// handleManage depends on the mode.
	let balanceLabel = '';
	let balance = new BigNumber(0);

	switch (mode) {
		case Mode.DEPOSIT:
			balance = bToken?.balance;
			balanceLabel = bToken && `Available ${collaterals.get(bToken.address)}: `;
			break;
		case Mode.WITHDRAW:
			balanceLabel = bToken && `Deposited collateral ${collaterals.get(bToken.address)}: `;
			if (position) {
				balance = position.rawCollateral;
			}
			break;
	}

	const handleManageFns = {
		[Mode.DEPOSIT]: () => {
			const [empAddress, depositAmount] = [selectedOption, amount];
			if (!empAddress || !depositAmount) return;
			store.actionStore.deposit(empAddress, ethers.utils.parseUnits(depositAmount, decimals).toHexString());
		},
		[Mode.WITHDRAW]: () => {
			const [empAddress, collateralAmount] = [selectedOption, amount];
			if (!empAddress || !collateralAmount) return;
			store.actionStore.withdraw(empAddress, ethers.utils.parseUnits(collateralAmount, decimals).toHexString());
		},
	};

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
						<MenuItem value={Mode.DEPOSIT}>DEPOSIT</MenuItem>
						<MenuItem value={Mode.WITHDRAW}>WITHDRAW</MenuItem>
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
									.dividedBy(10 ** decimals)
									.toFixed(decimals, BigNumber.ROUND_DOWN),
								error: undefined,
							});
						}}
						onOptionChange={(selectedOption: string) => setManageParams({ selectedOption })}
					/>
				</Grid>
				<Grid item xs={12}>
					<Grid container className={classes.details}>
						<ClawDetails details={details} />
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Grid container>
						<ActionButton
							text={error ? error : mode.toLocaleUpperCase()}
							disabled={!!error}
							onClick={handleManageFns[mode]}
						/>
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
});

export default Manage;
