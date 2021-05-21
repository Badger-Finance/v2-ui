import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Button, DialogContent, TextField, DialogActions, ButtonGroup } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { useForm } from 'react-hook-form';
import { SettAvailableDeposit } from '../Setts/SettAvailableDeposit';
import { StrategyInfo } from './StrategyInfo';
import { BadgerSett } from 'mobx/model/badger-sett';
import { Sett } from 'mobx/model';
import { TokenBalance } from 'mobx/model/token-balance';
import { ContractNamespace } from 'web3/config/contract-namespace';

const TEXTFIELD_ID = 'amountField';

const useStyles = makeStyles((theme) => ({
	button: {
		marginBottom: theme.spacing(1),
	},
	feeButton: {
		marginBottom: theme.spacing(1),
		marginLeft: theme.spacing(3),
	},
	field: {
		margin: theme.spacing(1, 0, 1),
	},
	balanceDiv: {
		flexGrow: 1,
	},
	skeleton: {
		display: 'inline-flex',
		width: '25%',
		paddingLeft: theme.spacing(1),
	},
	noWallet: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(5),
		flexDirection: 'column',
	},
	badgerIcon: {
		height: '82px',
		width: '82px',
		marginTop: theme.spacing(5),
		marginBottom: theme.spacing(1),
	},
}));

// TODO: Find a way to better integrate this data
export interface SettModalProps {
	sett: Sett;
	badgerSett: BadgerSett;
}

export const VaultDeposit = observer((props: SettModalProps) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { register, handleSubmit, watch, setValue } = useForm({ mode: 'all' });

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
		return (
			<div className={classes.noWallet}>
				<Typography>{'No wallet connected.'}</Typography>
				<img src={'./assets/icons/badger_head.svg'} className={classes.badgerIcon} />
				<Typography>{`Connect a wallet to deposit ${sett.name}`}</Typography>
			</div>
		);
	}

	const userBalance = user.getBalance(ContractNamespace.Token, badgerSett);
	const percentageOfBalance = (percent: number): string => {
		return userBalance.scaledBalanceDisplay(percent);
	};

	const setAmount = (percent: number) => {
		setValue('amount', userBalance.scaledBalanceDisplay(percent));
	};

	const onSubmit = (params: any) => {
		const depositBalance = TokenBalance.fromBalance(userBalance, params.amount);
		contracts.deposit(sett, badgerSett, userBalance, depositBalance);
	};

	const availableDepositLimit = (amount: number): boolean => {
		// Deposit limits are defined in the network model and coded into the
		// cappedDeposit object.  If a vault is present there, there is a deposit
		// limit.
		if (!network.cappedDeposit[vaultToken.address]) {
			return true;
		}

		const availableDeposit = accountDetails?.depositLimits[vaultToken.address].available;
		const totalAvailableDeposit = settMap
			? settMap[vaultToken.address]?.affiliate?.availableDepositLimit
			: undefined;

		if (!availableDeposit || !totalAvailableDeposit) return true;

		return (
			availableDeposit > 1e-8 &&
			totalAvailableDeposit > 1e-8 &&
			amount <= availableDeposit &&
			amount <= totalAvailableDeposit
		);
	};

	const canDeposit =
		!!watch().amount && !!connectedAddress && userBalance.balance.gt(0) && availableDepositLimit(watch().amount);

	const renderAmounts = (
		<ButtonGroup size="small" className={classes.feeButton} disabled={!connectedAddress}>
			{[25, 50, 75, 100].map((amount: number) => (
				<Button
					aria-label={`${amount}%`}
					onClick={() => {
						setAmount(amount);
					}}
					variant={!!canDeposit && watch().amount === percentageOfBalance(amount) ? 'contained' : 'outlined'}
					color="default"
					key={amount}
				>
					{amount}%
				</Button>
			))}
		</ButtonGroup>
	);

	const totalAvailable = percentageOfBalance(100);

	return (
		<>
			<DialogContent>
				<div
					style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
				>
					<div className={classes.balanceDiv}>
						<Typography variant="body1" color={'textSecondary'} style={{ marginBottom: '.2rem' }}>
							Available:{' '}
							{!!connectedAddress && !!totalAvailable ? (
								totalAvailable
							) : (
								<Skeleton animation="wave" className={classes.skeleton} />
							)}
						</Typography>
					</div>

					{renderAmounts}
				</div>
				{network.cappedDeposit[vaultToken.address] ? (
					<SettAvailableDeposit
						accountDetails={accountDetails}
						vault={vaultToken.address}
						assetName={sett.name}
						sett={settMap ? settMap[vaultToken.address] : undefined}
					/>
				) : (
					<></>
				)}

				<StrategyInfo vaultAddress={vaultToken.address} network={network} />

				<TextField
					autoComplete="off"
					name="amount"
					disabled={!connectedAddress}
					inputRef={register}
					id={TEXTFIELD_ID}
					className={classes.field}
					variant="outlined"
					fullWidth
					placeholder="Type an amount to deposit"
				/>
			</DialogContent>
			<DialogActions>
				<Button
					aria-label="Deposit"
					size="large"
					disabled={!canDeposit}
					onClick={handleSubmit(onSubmit)}
					variant="contained"
					color="primary"
					fullWidth
					className={classes.button}
				>
					Deposit
				</Button>
			</DialogActions>
		</>
	);
});
