import { VaultDTO } from '@badger-dao/sdk';
import { Dialog, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerVault } from 'mobx/model/vaults/badger-vault';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';
import { useNumericInput } from 'utils/useNumericInput';

import { PercentageSelector } from '../PercentageSelector';
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer, VaultDialogContent } from './styled';
import VaultAdvisory from './VaultAdvisory';
import { VaultConversionAndFee } from './VaultConversionAndFee';
import { VaultDialogTitle } from './VaultDialogTitle';
import { BigNumber } from 'ethers';

const useStyles = makeStyles((theme) => ({
	content: {
		padding: theme.spacing(3),
	},
	fees: {
		marginTop: theme.spacing(2),
	},
	rate: {
		marginTop: theme.spacing(1),
	},
	rateLabel: {
		fontSize: 12,
		lineHeight: '1.66',
	},
	geyserDeposit: {
		border: `1px solid ${theme.palette.primary.main}`,
		color: theme.palette.text.secondary,
		backgroundColor: theme.palette.background.paper,
		marginTop: theme.spacing(2),
		width: '100%',
	},
	geyserIcon: {
		color: theme.palette.primary.main,
	},
	legacyAppLink: {
		margin: '0px 3px',
	},
}));

export interface VaultModalProps {
	open?: boolean;
	vault: VaultDTO;
	badgerVault: BadgerVault;
	onClose: () => void;
}

export const VaultWithdraw = observer(({ open = false, vault, badgerVault, onClose }: VaultModalProps) => {
	const { wallet, user, vaults, sdk } = useContext(StoreContext);
	const classes = useStyles();

	const [accepted, setAccepted] = useState(!badgerVault.withdrawAdvisory);
	const [amount, setAmount] = useState('0');
	const { onValidChange, inputProps } = useNumericInput();

	const userBalance = user.getBalance(vault.vaultToken);
	const userHasBalance = userBalance.hasBalance();

	const depositToken = vaults.getToken(vault.underlyingToken);
	const bToken = vaults.getToken(vault.vaultToken);

	const vaultSymbol = vaults.getToken(badgerVault.vaultToken.address).symbol;
	const depositTokenSymbol = depositToken.symbol;
	const bTokenSymbol = bToken?.symbol || '';

	const canWithdraw = wallet.isConnected && !!amount && userHasBalance;
	const isLoading = false;

	const withdrawAmount = TokenBalance.fromBalance(userBalance, Number(amount));

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = async (): Promise<void> => {
		if (withdrawAmount.tokenBalance.gt(0)) {
			const result = await sdk.vaults.withdraw({
				vault: vault.vaultToken,
				amount: withdrawAmount.tokenBalance,
			});
			console.log(result);
		}
	};

	if (!accepted && badgerVault.withdrawAdvisory) {
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
				<VaultDialogTitle vault={vault} mode="Withdraw" />
				<VaultAdvisory vault={vault} accept={() => setAccepted(true)} type={badgerVault.withdrawAdvisory} />
			</Dialog>
		);
	}

	const withdrawFees = (
		<>
			<AmountTextField
				variant="outlined"
				fullWidth
				placeholder="Type an amount to withdraw"
				inputProps={inputProps}
				value={amount || ''}
				onChange={onValidChange(setAmount)}
			/>
			<Grid container justifyContent="space-between" className={classes.rate}>
				<Typography className={classes.rateLabel} color="textSecondary" display="inline">
					Withdraw Rate
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{`1 ${bTokenSymbol} = ${vault.pricePerFullShare} ${depositTokenSymbol}`}
				</Typography>
			</Grid>
			<Grid container className={classes.fees}>
				<VaultConversionAndFee vault={vault} balance={withdrawAmount} />
			</Grid>
		</>
	);

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
			<VaultDialogTitle vault={vault} mode="Withdraw" />
			<VaultDialogContent dividers className={classes.content}>
				<Grid container alignItems="center">
					<Grid item xs={12} sm={6}>
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
				{withdrawFees}
				<ActionButton
					aria-label="Withdraw"
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
			</VaultDialogContent>
		</Dialog>
	);
});
