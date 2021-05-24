import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { DialogContent, DialogActions, Grid } from '@material-ui/core';

import { TokenBalance } from 'mobx/model/token-balance';
import { SettModalProps } from './VaultDeposit';
import { StrategyInfo } from './StrategyInfo';
import { PercentageSelector } from 'components-v2/common/PercentageSelector';
import { useNumericInput } from 'utils/useNumericInput';
import { ActionButton, AmountTextField, AssetInformationContainer, PercentagesContainer } from './Common';
import { UnderlyingAsset } from './UnderlyingAsset';
import { OwnedAsset } from './OwnedAsset';

export const VaultWithdraw = observer((props: SettModalProps) => {
	const store = useContext(StoreContext);
	const { sett, badgerSett } = props;
	const [amount, setAmount] = useState<string>();
	const { onValidChange, ...inputProps } = useNumericInput();

	const {
		wallet: { connectedAddress, network },
		user: { settBalances },
		contracts,
	} = store;

	const userBalance = settBalances[badgerSett.vaultToken.address];
	const canDeposit = !!connectedAddress && !!amount && userBalance.balance.gt(0);

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = () => {
		if (!amount) return;
		const withdrawBalance = TokenBalance.fromBalance(userBalance, amount);
		contracts.withdraw(sett, badgerSett, userBalance, withdrawBalance).then();
	};

	return (
		<>
			<DialogContent>
				<Grid container spacing={1}>
					<Grid item container xs={12} sm={7}>
						<AssetInformationContainer item xs={12}>
							<UnderlyingAsset sett={sett} badgerSett={badgerSett} />
						</AssetInformationContainer>
						<AssetInformationContainer item xs={12}>
							<OwnedAsset prefix="Deposited" sett={sett} badgerSett={badgerSett} />
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
					disabled={!canDeposit}
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					fullWidth
				>
					Withdraw
				</ActionButton>
			</DialogActions>
		</>
	);
});
