import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Dialog, Grid, Typography } from '@material-ui/core';
import { BadgerVault } from 'mobx/model/vaults/badger-vault';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { useNumericInput } from 'utils/useNumericInput';
import { VaultDialogTitle } from './VaultDialogTitle';
import { PercentageSelector } from '../PercentageSelector';
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer, VaultDialogContent } from './styled';
import { BalanceNamespace } from '../../../web3/config/namespaces';
import { VaultConversionAndFee } from './VaultConversionAndFee';
import { makeStyles } from '@material-ui/core/styles';
import { Vault } from '@badger-dao/sdk';
import VaultAdvisory from './VaultAdvisory';

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
	vault: Vault;
	badgerVault: BadgerVault;
	onClose: () => void;
}

export const VaultWithdraw = observer(({ open = false, vault, badgerVault, onClose }: VaultModalProps) => {
	const { onboard, user, contracts, vaults } = useContext(StoreContext);
	const classes = useStyles();
	
	const [accepted, setAccepted] = useState(badgerVault.withdrawAdvisory ? false : true);
	const [amount, setAmount] = useState('');
	const { onValidChange, inputProps } = useNumericInput();

	const userBalance = user.getBalance(BalanceNamespace.Vault, badgerVault);
	const userHasBalance = userBalance.balance.gt(0);

	const depositToken = vaults.getToken(vault.underlyingToken);
	const bToken = vaults.getToken(vault.vaultToken);

	const vaultSymbol = vaults.getToken(badgerVault.vaultToken.address)?.symbol || vault.asset;
	const depositTokenSymbol = depositToken?.symbol || '';
	const bTokenSymbol = bToken?.symbol || '';

	const canWithdraw = onboard.isActive() && !!amount && userHasBalance;
	const isLoading = contracts.settsBeingWithdrawn[vault.vaultToken];

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = async (): Promise<void> => {
		if (!amount) {
			return;
		}
		const withdrawBalance = TokenBalance.fromBalance(userBalance, amount);
		await contracts.withdraw(vault, badgerVault, userBalance, withdrawBalance);
	};

	if (!accepted && badgerVault.withdrawAdvisory) {
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
				<VaultDialogTitle vault={vault} mode="Withdraw" />
				<VaultAdvisory accept={() => setAccepted(true)} type={badgerVault.withdrawAdvisory} />
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
				<VaultConversionAndFee vault={vault} amount={amount || 0} />
			</Grid>
		</>
	);

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
