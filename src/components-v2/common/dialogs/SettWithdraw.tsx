import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Dialog, Grid, Typography } from '@material-ui/core';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { useNumericInput } from 'utils/useNumericInput';
import { SettDialogTitle } from './SettDialogTitle';
import { PercentageSelector } from '../PercentageSelector';
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer, SettDialogContent } from './styled';
import { BalanceNamespace } from '../../../web3/config/namespaces';
import { SettConversionAndFee } from './SettConversionAndFee';
import { makeStyles } from '@material-ui/core/styles';
import { Sett } from '@badger-dao/sdk';

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

export interface SettModalProps {
	open?: boolean;
	sett: Sett;
	badgerSett: BadgerSett;
	onClose: () => void;
}

export const SettWithdraw = observer(({ open = false, sett, badgerSett, onClose }: SettModalProps) => {
	const { onboard, user, contracts, setts } = useContext(StoreContext);

	const classes = useStyles();
	const [amount, setAmount] = useState('');
	const { onValidChange, inputProps } = useNumericInput();

	const userBalance = user.getBalance(BalanceNamespace.Sett, badgerSett);
	const userHasBalance = userBalance.balance.gt(0);

	const depositToken = setts.getToken(sett.underlyingToken);
	const bToken = setts.getToken(sett.settToken);

	const vaultSymbol = setts.getToken(badgerSett.vaultToken.address)?.symbol || sett.asset;
	const depositTokenSymbol = depositToken?.symbol || '';
	const bTokenSymbol = bToken?.symbol || '';

	const canWithdraw = onboard.isActive() && !!amount && userHasBalance;
	const isLoading = contracts.settsBeingWithdrawn[sett.settToken];

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
			<Grid container justify="space-between" className={classes.rate}>
				<Typography className={classes.rateLabel} color="textSecondary" display="inline">
					Withdraw Rate
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{`1 ${bTokenSymbol} = ${sett.pricePerFullShare} ${depositTokenSymbol}`}
				</Typography>
			</Grid>
			<Grid container className={classes.fees}>
				<SettConversionAndFee sett={sett} amount={amount || 0} />
			</Grid>
		</>
	);

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<SettDialogTitle sett={sett} mode="Withdraw" />
			<SettDialogContent dividers className={classes.content}>
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
