import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { DialogContent, DialogActions, Grid } from '@material-ui/core';
import BigNumber from 'bignumber.js';

import { BadgerToken } from 'mobx/model/badger-token';
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

const useHasAvailableDepositLimit = (vaultToken: BadgerToken, amount = '0'): boolean => {
	const store = useContext(StoreContext);

	const {
		wallet: { network },
		user: { accountDetails },
		setts: { settMap },
	} = store;

	// Deposit limits are defined in the network model and coded into the
	// cappedDeposit object.  If a vault is present there, there is a deposit
	// limit.
	if (!network.cappedDeposit[vaultToken.address]) {
		return true;
	}

	const availableDeposit = accountDetails?.depositLimits[vaultToken.address].available;
	const totalAvailableDeposit = settMap ? settMap[vaultToken.address]?.affiliate?.availableDepositLimit : undefined;

	if (!availableDeposit || !totalAvailableDeposit) return true;
	const inputAmount = new BigNumber(amount);

	// TODO: revisit this response on the api side to include decimals or something and avoid setting fixed amounts
	return (
		availableDeposit > 1e-8 && //  amounts being specific to wbtc
		totalAvailableDeposit > 1e-8 &&
		inputAmount.lte(availableDeposit) &&
		inputAmount.lte(totalAvailableDeposit)
	);
};

export const VaultDeposit = observer((props: SettModalProps) => {
	const store = useContext(StoreContext);
	const [amount, setAmount] = useState<string>();
	const { onValidChange, inputProps } = useNumericInput();

	const {
		wallet: { connectedAddress, network },
		user: { accountDetails },
		setts: { settMap },
		contracts,
		user,
	} = store;

	const { sett, badgerSett } = props;
	const { vaultToken } = badgerSett;

	if (!connectedAddress) {
		return <NoWalletConnected settName={sett.name} />;
	}

	const userBalance = user.getBalance(ContractNamespace.Token, badgerSett);
	const hasAvailableDeposit = useHasAvailableDepositLimit(vaultToken, amount);
	const canDeposit = !!amount && !!connectedAddress && userBalance.balance.gt(0) && hasAvailableDeposit;

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = () => {
		if (!amount) {
			return;
		}
		const depositBalance = TokenBalance.fromBalance(userBalance, amount);
		contracts.deposit(sett, badgerSett, userBalance, depositBalance);
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
								userBalance.scaledBalanceDisplay()
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

				{network.cappedDeposit[vaultToken.address] && (
					<SettAvailableDeposit
						accountDetails={accountDetails}
						vault={vaultToken.address}
						assetName={sett.name}
						sett={settMap ? settMap[vaultToken.address] : undefined}
					/>
				)}

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
		</>
	);
});
