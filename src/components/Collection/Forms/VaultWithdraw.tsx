import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { DialogContent, DialogActions, Grid } from '@material-ui/core';

import { TokenBalance } from 'mobx/model/token-balance';
import { SettModalProps } from './VaultDeposit';
import { StrategyInfo } from './StrategyInfo';
import { PercentageSelector } from 'components-v2/common/PercentageSelector';
import { useNumericInput } from 'utils/useNumericInput';
import {
	ActionButton,
	AmountTextField,
	AssetInformationContainer,
	BalanceInformation,
	LoaderSpinner,
	PercentagesContainer,
	TextSkeleton,
} from './Common';

export const VaultWithdraw = observer((props: SettModalProps) => {
	const store = useContext(StoreContext);
	const { sett, badgerSett } = props;
	const [amount, setAmount] = useState<string>();
	const { onValidChange, inputProps } = useNumericInput();

	const {
		wallet: { connectedAddress, network },
		user: { settBalances },
		contracts,
		setts,
	} = store;

	const userBalance = settBalances[badgerSett.vaultToken.address];
	const vaultSymbol = setts.getToken(badgerSett.vaultToken.address)?.symbol || sett.asset;

	const underlying = userBalance.tokenBalance.multipliedBy(sett.ppfs);
	const underlyingBalance = new TokenBalance(userBalance.token, underlying, userBalance.price);
	const underlyingSymbol = setts.getToken(badgerSett.depositToken.address)?.symbol || sett.asset;

	const isLoading = contracts.settsBeingWithdrawn.findIndex((_sett) => _sett.name === sett.name) >= 0;
	const canDeposit = !!connectedAddress && !!amount && userBalance.balance.gt(0);

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
		<>
			<DialogContent>
				<Grid container spacing={1}>
					<Grid item container xs={12} sm={7}>
						<AssetInformationContainer item xs={12}>
							<BalanceInformation variant="body2" color="textSecondary" display="inline">
								{`Underlying ${underlyingSymbol}: `}
							</BalanceInformation>
							<BalanceInformation variant="body2" color="textSecondary" display="inline">
								{!connectedAddress ? (
									<TextSkeleton animation="wave" />
								) : (
									underlyingBalance.balanceDisplay()
								)}
							</BalanceInformation>
						</AssetInformationContainer>
						<AssetInformationContainer item xs={12}>
							<BalanceInformation variant="body1" color="textSecondary" display="inline">
								{`Deposited ${vaultSymbol}: `}
							</BalanceInformation>
							<BalanceInformation variant="body1" color="textSecondary" display="inline">
								{!connectedAddress || !userBalance ? (
									<TextSkeleton animation="wave" />
								) : (
									userBalance.balanceDisplay()
								)}
							</BalanceInformation>
						</AssetInformationContainer>
					</Grid>
					<PercentagesContainer item xs={12} sm={5}>
						<PercentageSelector
							size="small"
							options={[25, 50, 75, 100]}
							disabled={!connectedAddress}
							onChange={handlePercentageChange}
						/>
					</PercentagesContainer>
				</Grid>
				<StrategyInfo vaultAddress={badgerSett.vaultToken.address} network={network} />
				<AmountTextField
					fullWidth
					variant="outlined"
					placeholder="Type an amount to withdraw"
					disabled={!connectedAddress}
					inputProps={inputProps}
					value={amount || ''}
					onChange={onValidChange(setAmount)}
				/>
			</DialogContent>
			<DialogActions>
				<ActionButton
					aria-label="Withdraw"
					size="large"
					disabled={isLoading || !canDeposit}
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
			</DialogActions>
		</>
	);
});
