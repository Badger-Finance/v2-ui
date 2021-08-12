import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Grid, Dialog, Typography, DialogContent } from '@material-ui/core';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { ContractNamespace } from 'web3/config/contract-namespace';
import { useNumericInput } from 'utils/useNumericInput';
import { SettDialogTitle } from './SettDialogTitle';
import { SettAvailableDeposit } from './SettAvailableDeposit';
import { PercentageSelector } from '../PercentageSelector';
import { Sett } from '../../../mobx/model/setts/sett';
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer } from './styled';

export interface SettModalProps {
	open?: boolean;
	sett: Sett;
	badgerSett: BadgerSett;
	onClose: () => void;
}

export const SettDeposit = observer(({ open = false, sett, badgerSett, onClose }: SettModalProps) => {
	const store = useContext(StoreContext);
	const { contracts, user } = store;

	const [amount, setAmount] = useState<string>();
	const { onValidChange, inputProps } = useNumericInput();

	const userBalance = user.getBalance(ContractNamespace.Token, badgerSett);
	const depositBalance = TokenBalance.fromBalance(userBalance, amount ?? '0');
	const vaultCaps = user.vaultCaps[sett.vaultToken];
	const isLoading = contracts.settsBeingDeposited.findIndex((_sett) => _sett.name === sett.name) >= 0;

	let canDeposit = !!amount && depositBalance.tokenBalance.gt(0);

	if (canDeposit && vaultCaps) {
		const vaultHasSpace = vaultCaps.vaultCap.tokenBalance.gte(depositBalance.tokenBalance);
		const userHasSpace = vaultCaps.userCap.tokenBalance.gte(depositBalance.tokenBalance);
		const userHasBalance = userBalance.tokenBalance.gte(depositBalance.tokenBalance);
		canDeposit = vaultHasSpace && userHasSpace && userHasBalance;
	}

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = async (): Promise<void> => {
		if (!amount) {
			return;
		}
		await contracts.deposit(sett, badgerSett, userBalance, depositBalance);
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<SettDialogTitle sett={sett} mode="Deposit" />
			<DialogContent dividers>
				<Grid container alignItems="center">
					<Grid item xs={12} sm={6}>
						<Typography variant="body1" color="textSecondary">
							{`Available: ${userBalance.balanceDisplay()}`}
						</Typography>
					</Grid>
					<PercentagesContainer item xs={12} sm={6}>
						<PercentageSelector
							size="small"
							options={[25, 50, 75, 100]}
							onChange={handlePercentageChange}
						/>
					</PercentagesContainer>
				</Grid>
				<AmountTextField
					variant="outlined"
					fullWidth
					placeholder="Type an amount to deposit"
					inputProps={inputProps}
					value={amount || ''}
					onChange={onValidChange(setAmount)}
				/>
				<ActionButton
					aria-label="Deposit"
					size="large"
					disabled={isLoading || !canDeposit}
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					fullWidth
				>
					{isLoading ? (
						<>
							Deposit In Progress
							<LoaderSpinner size={20} />
						</>
					) : (
						'Deposit'
					)}
				</ActionButton>
			</DialogContent>
			{user.vaultCaps[sett.vaultToken] && <SettAvailableDeposit vaultCapInfo={user.vaultCaps[sett.vaultToken]} />}
		</Dialog>
	);
});
