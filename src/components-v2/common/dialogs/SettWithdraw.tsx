import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Dialog, Grid, Typography } from '@material-ui/core';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { TokenBalance } from 'mobx/model/tokens/token-balance';

import { useNumericInput } from 'utils/useNumericInput';
import { SettDialogTitle } from './SettDialogTitle';
import { PercentageSelector } from '../PercentageSelector';
import { Sett } from '../../../mobx/model/setts/sett';
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer, SettDialogContent } from './styled';
import { ContractNamespace } from '../../../web3/config/contract-namespace';

export interface SettModalProps {
	open?: boolean;
	sett: Sett;
	badgerSett: BadgerSett;
	onClose: () => void;
}

export const SettWithdraw = observer(({ open = false, sett, badgerSett, onClose }: SettModalProps) => {
	const {
		wallet: { connectedAddress },
		user,
		contracts,
		setts,
	} = useContext(StoreContext);

	const [amount, setAmount] = useState<string>();
	const { onValidChange, inputProps } = useNumericInput();

	const userBalance = user.getBalance(ContractNamespace.Sett, badgerSett);
	const vaultSymbol = setts.getToken(badgerSett.vaultToken.address)?.symbol || sett.asset;

	const underlying = userBalance.tokenBalance.multipliedBy(sett.ppfs);
	const underlyingBalance = new TokenBalance(userBalance.token, underlying, userBalance.price);
	const underlyingSymbol = setts.getToken(badgerSett.depositToken.address)?.symbol || sett.asset;

	const isLoading = contracts.settsBeingWithdrawn.findIndex((_sett) => _sett.name === sett.name) >= 0;
	const canWithdraw = !!connectedAddress && !!amount && userBalance.balance.gt(0);

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = async (): Promise<void> => {
		if (!amount) {
			return;
		}
		const withdrawBalance = TokenBalance.fromBalance(userBalance, amount);
		await contracts.withdraw(sett, badgerSett, userBalance, withdrawBalance);
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<SettDialogTitle sett={sett} mode="Withdraw" />
			<SettDialogContent dividers>
				<Grid container alignItems="center">
					<Grid item xs={12} sm={6}>
						<Typography variant="body2" color="textSecondary">
							{`Underlying ${underlyingSymbol}: ${underlyingBalance.balanceDisplay()}`}
						</Typography>
						<Typography variant="body1" color="textSecondary">
							{`Deposited ${vaultSymbol}: ${userBalance.balanceDisplay()}`}
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
					disabled={isLoading || !canWithdraw}
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					fullWidth
				>
					{isLoading ? (
						<>
							Withdraw In Progress
							<LoaderSpinner size={20} />
						</>
					) : (
						'Withdraw'
					)}
				</ActionButton>
			</SettDialogContent>
		</Dialog>
	);
});
