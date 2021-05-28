import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DialogContent, DialogActions, Grid } from '@material-ui/core';

import { TokenBalance } from 'mobx/model/token-balance';
import { SettModalProps } from './VaultDeposit';
import { StoreContext } from 'mobx/store-context';
import {
	ActionButton,
	AmountTextField,
	AssetInformationContainer,
	BalanceInformation,
	PercentagesContainer,
	TextSkeleton,
} from './Common';
import { StrategyInfo } from './StrategyInfo';
import { NoGeyser } from './NoGeyser';
import { useNumericInput } from 'utils/useNumericInput';
import { PercentageSelector } from 'components-v2/common/PercentageSelector';

export const GeyserUnstake = observer((props: SettModalProps) => {
	const store = useContext(StoreContext);
	const { sett, badgerSett } = props;
	const [amount, setAmount] = useState<string>();
	const { onValidChange, inputProps } = useNumericInput();

	const {
		wallet: { connectedAddress, network },
		user: { geyserBalances },
		contracts,
		rewards,
	} = store;

	if (!badgerSett.geyser) {
		return (
			<DialogContent>
				<NoGeyser settName={sett.name} />
			</DialogContent>
		);
	}

	const userBalance = geyserBalances[badgerSett.geyser];
	const underlying = userBalance.tokenBalance.multipliedBy(sett.ppfs);
	const underlyingBalance = new TokenBalance(rewards, userBalance.token, underlying, userBalance.price);
	const canUnstake = !!connectedAddress && !!amount && userBalance.balance.gt(0);

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = () => {
		if (!amount) return;
		const unstakeBalance = TokenBalance.fromBalance(userBalance, amount);
		contracts.unstake(sett, badgerSett, userBalance, unstakeBalance).then();
	};

	return (
		<>
			<DialogContent>
				<Grid container spacing={1}>
					<Grid item container xs={12} sm={7}>
						<AssetInformationContainer item xs={12}>
							<BalanceInformation variant="body2" color="textSecondary" display="inline">
								{`Underlying ${sett.asset}: `}
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
								{`Staked b${sett.asset}: `}
							</BalanceInformation>
							<BalanceInformation variant="body1" color="textSecondary" display="inline">
								{!connectedAddress || !userBalance ? (
									<TextSkeleton animation="wave" />
								) : (
									userBalance.scaledBalanceDisplay()
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
					disabled={!connectedAddress}
					variant="outlined"
					placeholder="Type an amount to unstake"
					inputProps={inputProps}
					value={amount || ''}
					onChange={onValidChange(setAmount)}
				/>
			</DialogContent>
			<DialogActions>
				<ActionButton
					aria-label="Unstake"
					size="large"
					disabled={!canUnstake}
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					fullWidth
				>
					Unstake
				</ActionButton>
			</DialogActions>
		</>
	);
});
