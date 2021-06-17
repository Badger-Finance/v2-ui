import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { DialogContent, DialogActions, Grid } from '@material-ui/core';
import { BadgerSett } from 'mobx/model/badger-sett';
import { Sett } from 'mobx/model';
import { TokenBalance } from 'mobx/model/token-balance';
import { ContractNamespace } from 'web3/config/contract-namespace';
import { SettAvailableDeposit } from '../Setts/SettAvailableDeposit';
import { StrategyInfo } from './StrategyInfo';
import { PercentageSelector } from 'components-v2/common/PercentageSelector';
import { NoWalletConnected } from './NoWalletConnected';
import { useNumericInput } from 'utils/useNumericInput';
import {
	ActionButton,
	AmountTextField,
	AssetInformationContainer,
	BalanceInformation,
	PercentagesContainer,
	TextSkeleton,
} from './Common';

export interface SettModalProps {
	sett: Sett;
	badgerSett: BadgerSett;
}

export const VaultDeposit = observer((props: SettModalProps) => {
	const store = useContext(StoreContext);
	const [amount, setAmount] = useState<string>();
	const { onValidChange, inputProps } = useNumericInput();

	const {
		wallet: { connectedAddress, network },
		contracts,
		user,
	} = store;

	const { sett, badgerSett } = props;
	const { vaultToken } = badgerSett;

	if (!connectedAddress) {
		return <NoWalletConnected settName={sett.name} />;
	}

	const userBalance = user.getBalance(ContractNamespace.Token, badgerSett);
	const vaultCaps = user.vaultCaps[sett.vaultToken];

	let canDeposit = !!amount;
	if (canDeposit && vaultCaps) {
		const vaultCanDeposit = vaultCaps.vaultCap.tokenBalance.gte(userBalance.tokenBalance);
		const userCanDeposit =
			vaultCaps.userCap.tokenBalance.gte(userBalance.tokenBalance) && userBalance.balance.gt(0);
		canDeposit = vaultCanDeposit && userCanDeposit;
	}

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = async (): Promise<void> => {
		if (!amount) {
			return;
		}
		const depositBalance = TokenBalance.fromBalance(userBalance, amount);
		await contracts.deposit(sett, badgerSett, userBalance, depositBalance);
	};

	return (
		<>
			<DialogContent>
				<Grid container spacing={1}>
					<AssetInformationContainer item xs={12} sm={7}>
						<BalanceInformation variant="body1" color="textSecondary" display="inline">
							{`Available: `}
						</BalanceInformation>
						<BalanceInformation variant="body1" color="textSecondary" display="inline">
							{!connectedAddress || !userBalance ? (
								<TextSkeleton animation="wave" />
							) : (
								userBalance.balanceDisplay()
							)}
						</BalanceInformation>
					</AssetInformationContainer>
					<PercentagesContainer item xs={12} sm={5}>
						<PercentageSelector
							size="small"
							options={[25, 50, 75, 100]}
							disabled={!connectedAddress}
							onChange={handlePercentageChange}
						/>
					</PercentagesContainer>
				</Grid>
				<StrategyInfo vaultAddress={vaultToken.address} network={network} />

				<AmountTextField
					disabled={!connectedAddress}
					variant="outlined"
					fullWidth
					placeholder="Type an amount to deposit"
					inputProps={inputProps}
					value={amount || ''}
					onChange={onValidChange(setAmount)}
				/>
			</DialogContent>
			<DialogActions>
				<ActionButton
					aria-label="Deposit"
					size="large"
					disabled={!canDeposit}
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					fullWidth
				>
					Deposit
				</ActionButton>
			</DialogActions>
			{sett.hasBouncer && <SettAvailableDeposit vaultCapInfo={user.vaultCaps[vaultToken.address]} />}
		</>
	);
});
