import React from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react-lite';
import { Box, Container, Grid, MenuItem, Select } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { StoreContext } from 'mobx/store-context';

import { TokenSelectorLabel } from 'components-v2/common/TokenSelectorLabel';
import { TokenSelectorWithAmountContainer } from 'components-v2/common/TokenSelectorWithAmountContainer';
import { TokenSelect } from 'components-v2/common/TokenSelect';
import { TokenAmountInput } from 'components-v2/common/TokenAmountInput';
import { PercentageGroup } from 'components-v2/common/PercentageGroup';
import { ActionButton } from '../ActionButton';
import { ClawDetails } from '../ClawDetails';
import { scaleToString, Direction, validateAmountBoundaries } from 'utils/componentHelpers';
import { useDetails, useError } from './manage.hooks';
import { ClawParam } from '../claw.model';

enum Mode {
	DEPOSIT = 'deposit',
	WITHDRAW = 'withdraw',
}

const Manage = observer(() => {
	const { claw: store, contracts, wallet } = React.useContext(StoreContext);
	const { collaterals, claws, syntheticsDataByEMP, sponsorInformationByEMP } = store;
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
		[Mode.DEPOSIT]: async () => {
			const [empAddress, depositAmount] = [selectedOption, amount];
			if (!empAddress || !depositAmount) return;
			await store.actionStore.deposit(empAddress, ethers.utils.parseUnits(depositAmount, decimals).toHexString());
		},
		[Mode.WITHDRAW]: async () => {
			const [empAddress, collateralAmount] = [selectedOption, amount];
			if (!empAddress || !collateralAmount) return;
			await store.actionStore.withdraw(
				empAddress,
				ethers.utils.parseUnits(collateralAmount, decimals).toHexString(),
			);
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
				<Grid item xs={12}>
					<TokenSelectorWithAmountContainer
						tokenBalanceInformation={
							<TokenSelectorLabel
								name="Token"
								balanceLabel={balanceLabel}
								balance={selectedOption && scaleToString(balance, decimals, Direction.Down)}
							/>
						}
						tokenList={
							<TokenSelect
								selectedOption={selectedOption}
								options={claws}
								placeholder="Select Token"
								disabled={!wallet.connectedAddress || claws.size === 0}
								onChange={(selectedOption: string) => setManageParams({ selectedOption })}
							/>
						}
						tokenAmount={
							<TokenAmountInput
								value={amount}
								disabled={!selectedOption || !wallet.connectedAddress}
								onChange={(amount: string) => {
									if (!balance) return;
									setManageParams({
										selectedOption,
										amount,
										error: validateAmountBoundaries({
											amount,
											maximum: balance,
											minimum: new BigNumber(1).dividedBy(10 ** decimals),
										}),
									});
								}}
							/>
						}
						percentagesGroup={
							<PercentageGroup
								disabled={!selectedOption || !wallet.connectedAddress}
								options={[25, 50, 75, 100]}
								onChange={(percentage: number) => {
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
							/>
						}
					/>
				</Grid>
				<Grid item xs={12}>
					<ClawDetails details={details} />
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
