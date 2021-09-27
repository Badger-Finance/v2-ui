import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Dialog, Grid, Link, Typography } from '@material-ui/core';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { useNumericInput } from 'utils/useNumericInput';
import { SettDialogTitle } from './SettDialogTitle';
import { PercentageSelector } from '../PercentageSelector';
import { Sett } from '../../../mobx/model/setts/sett';
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer, SettDialogContent } from './styled';
import { ContractNamespace } from '../../../web3/config/contract-namespace';
import { StrategyFee } from '../../../mobx/model/system-config/stategy-fees';
import { SettWithdrawFee } from './SettWithdrawFee';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import WarningIcon from '@material-ui/icons/Warning';
import { getStrategyFee } from 'mobx/utils/fees';

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
	const {
		network: { network },
		wallet: { connectedAddress },
		user,
		contracts,
		setts,
	} = useContext(StoreContext);

	const classes = useStyles();
	const [amount, setAmount] = useState('');
	const { onValidChange, inputProps } = useNumericInput();

	const userBalance = user.getBalance(ContractNamespace.Sett, badgerSett);
	const userHasStakedDeposits = badgerSett.geyser
		? user.getBalance(ContractNamespace.Geyser, badgerSett).balance.gt(0)
		: false;

	const userHasBalance = !userHasStakedDeposits && userBalance.balance.gt(0);

	const networkSett = network.setts.find(({ vaultToken }) => vaultToken.address === sett.vaultToken);
	const settStrategy = networkSett ? network.strategies[networkSett.vaultToken.address] : undefined;
	const withdrawFee = settStrategy ? getStrategyFee(sett.strategy, StrategyFee.withdraw) : undefined;

	const depositToken = setts.getToken(sett.underlyingToken);
	const bToken = setts.getToken(sett.vaultToken);

	const vaultSymbol = setts.getToken(badgerSett.vaultToken.address)?.symbol || sett.asset;
	const depositTokenSymbol = depositToken?.symbol || '';
	const bTokenSymbol = bToken?.symbol || '';

	const canWithdraw = !!connectedAddress && !!amount && userHasBalance;
	const isLoading = contracts.settsBeingWithdrawn[sett.vaultToken];

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

	const stakedInfo = (
		<Alert
			className={classes.geyserDeposit}
			severity="info"
			iconMapping={{ info: <WarningIcon fontSize="inherit" className={classes.geyserIcon} /> }}
		>
			Staked deposits are deprecated. You can use the
			<Link href="https://legacy.badger.finance" target="_blank" rel="noopener" className={classes.legacyAppLink}>
				Legacy app
			</Link>
			to withdraw them
		</Alert>
	);

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
					{`1 ${bTokenSymbol} = ${sett.ppfs} ${depositTokenSymbol}`}
				</Typography>
			</Grid>
			{withdrawFee && (
				<Grid container className={classes.fees}>
					<SettWithdrawFee sett={sett} fee={withdrawFee} amount={amount || 0} />
				</Grid>
			)}
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
							disabled={userHasStakedDeposits}
							options={[25, 50, 75, 100]}
							onChange={handlePercentageChange}
						/>
					</PercentagesContainer>
				</Grid>
				{userHasStakedDeposits ? stakedInfo : withdrawFees}
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
