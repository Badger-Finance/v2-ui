import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Grid, Dialog, Typography, DialogContent, Button } from '@material-ui/core';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { useNumericInput } from 'utils/useNumericInput';
import { SettDialogTitle } from './SettDialogTitle';
import { SettAvailableDeposit } from './SettAvailableDeposit';
import { PercentageSelector } from '../PercentageSelector';
import { ActionButton, AmountTextField, LoaderSpinner, PercentagesContainer } from './styled';
import { makeStyles } from '@material-ui/core/styles';
import { BalanceNamespace } from '../../../web3/config/namespaces';
import { NewVaultWarning } from '../../sett-detail/NewVaultWarning';
import { DepositFeesInformation } from '../DepositFeesInformation';
import { SettFees } from '../SettFees';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import VaultAdvisory from './VaultAdvisory';
import { Sett, SettState } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	content: {
		padding: theme.spacing(3),
	},
	guardedVault: {
		marginBottom: theme.spacing(2),
	},
	fees: {
		marginTop: theme.spacing(2),
	},
	backButton: {
		display: 'flex',
		alignItems: 'center',
		textTransform: 'none',
	},
	arrowIcon: {
		marginRight: 4,
		fontSize: 16,
		transform: 'rotate(-180deg)',
	},
}));

export interface SettModalProps {
	open?: boolean;
	sett: Sett;
	badgerSett: BadgerSett;
	onClose: () => void;
}

export const SettDeposit = observer(({ open = false, sett, badgerSett, onClose }: SettModalProps) => {
	const store = useContext(StoreContext);
	const { contracts, user, wallet } = store;

	const [accepted, setAccepted] = useState(badgerSett.vaultAdvisory ? false : true);
	const [showFees, setShowFees] = useState(false);
	const [amount, setAmount] = useState('');
	const { onValidChange, inputProps } = useNumericInput();
	const classes = useStyles();

	const userBalance = user.getBalance(BalanceNamespace.Token, badgerSett);
	const depositBalance = TokenBalance.fromBalance(userBalance, amount ?? '0');
	const vaultCaps = user.vaultCaps[sett.settToken];
	const isLoading = contracts.settsBeingDeposited[sett.settToken];

	let canDeposit = !!wallet.connectedAddress && !!amount && depositBalance.tokenBalance.gt(0);

	if (canDeposit && vaultCaps) {
		const vaultHasSpace = vaultCaps.vaultCap.tokenBalance.gte(depositBalance.tokenBalance);
		const userHasSpace = vaultCaps.userCap.tokenBalance.gte(depositBalance.tokenBalance);
		const userHasBalance = userBalance.tokenBalance.gte(depositBalance.tokenBalance);
		canDeposit = vaultHasSpace && userHasSpace && userHasBalance;
	}

	const handlePercentageChange = (percent: number) => {
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = async (): Promise<void> => {
		if (!amount) {
			return;
		}
		await contracts.deposit(sett, badgerSett, userBalance, depositBalance);
	};

	if (!accepted && badgerSett.vaultAdvisory) {
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
				<SettDialogTitle sett={sett} mode="Deposit" />
				<VaultAdvisory accept={() => setAccepted(true)} type={badgerSett.vaultAdvisory} />
			</Dialog>
		);
	}

	if (showFees) {
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
				<DepositFeesInformation
					closeIcon={
						<Button color="primary" onClick={() => setShowFees(false)} className={classes.backButton}>
							<ArrowRightAltIcon className={classes.arrowIcon} />
							Back
						</Button>
					}
				/>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<SettDialogTitle sett={sett} mode="Deposit" />
			<DialogContent dividers className={classes.content}>
				{sett.state === SettState.Guarded && (
					<Grid container className={classes.guardedVault}>
						<NewVaultWarning />
					</Grid>
				)}
				<Grid container alignItems="center">
					<Grid item xs={12} sm={6}>
						<Typography variant="body1" color="textSecondary">
							{`Available: ${userBalance.balanceDisplay()}`}
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
				<SettFees
					sett={sett}
					showNoFees={false}
					className={classes.fees}
					onHelpClick={() => setShowFees(true)}
				/>
				<ActionButton
					aria-label="Deposit"
					size="large"
					disabled={isLoading || !canDeposit}
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					fullWidth
				>
					{isLoading ? (
						<>
							Deposit In Progress
							<LoaderSpinner size={20} />
						</>
					) : (
						'Deposit'
					)}
				</ActionButton>
			</DialogContent>
			{user.vaultCaps[sett.settToken] && <SettAvailableDeposit vaultCapInfo={user.vaultCaps[sett.settToken]} />}
		</Dialog>
	);
});
