import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Button, DialogContent, TextField, DialogActions, ButtonGroup } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { useForm } from 'react-hook-form';
import { StrategyInfo } from './StrategyInfo';
import { SettModalProps } from './VaultDeposit';
import { TokenBalance } from 'mobx/model/token-balance';

const TEXTFIELD_ID = 'amountField';

const useStyles = makeStyles((theme) => ({
	button: {
		marginBottom: theme.spacing(1),
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
}));

export const VaultWithdraw = observer((props: SettModalProps) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { sett, badgerSett } = props;
	const { register, handleSubmit, watch, setValue } = useForm({ mode: 'all' });

	const {
		wallet: { connectedAddress, network },
		user: { settBalances },
		setts: { settMap },
		contracts,
		rewards,
	} = store;

	const userBalance = settBalances[badgerSett.vaultToken.address];
	const settPpfs = settMap ? settMap[badgerSett.vaultToken.address].ppfs : 1;
	const underlying = userBalance.tokenBalance.multipliedBy(settPpfs);
	const underlyingBalance = new TokenBalance(rewards, userBalance.token, underlying, userBalance.price);

	// TODO: Clean up duplicate logic in all these components
	const percentageOfBalance = (percent: number): string => {
		return userBalance.scaledBalanceDisplay(percent);
	};

	const setAmount = (percent: number) => {
		setValue('amount', percentageOfBalance(percent));
	};

	const onSubmit = (params: any) => {
		const withdrawBalance = TokenBalance.fromBalance(userBalance, params.amount);
		contracts.withdraw(sett, badgerSett, userBalance, withdrawBalance);
	};

	const canDeposit = !!watch().amount && !!connectedAddress && userBalance.balance.gt(0);
	const renderAmounts = (
		<ButtonGroup size="small" className={classes.button} disabled={!connectedAddress}>
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
						<Typography variant="body2" color={'textSecondary'} style={{ marginBottom: '.2rem' }}>
							Underlying {sett.asset}:{' '}
							{!!connectedAddress ? (
								underlyingBalance.balanceDisplay()
							) : (
								<Skeleton animation="wave" className={classes.skeleton} />
							)}
						</Typography>
						<Typography variant="body1" color={'textSecondary'} style={{ marginBottom: '.2rem' }}>
							Deposited {`b${sett.asset}`}:{' '}
							{!!connectedAddress && !!totalAvailable ? (
								totalAvailable
							) : (
								<Skeleton animation="wave" className={classes.skeleton} />
							)}
						</Typography>
					</div>
					{renderAmounts}
				</div>
				<StrategyInfo vaultAddress={badgerSett.vaultToken.address} network={network} />
				<TextField
					autoComplete="off"
					name="amount"
					disabled={!connectedAddress}
					inputRef={register}
					id={TEXTFIELD_ID}
					className={classes.field}
					variant="outlined"
					fullWidth
					placeholder="Type an amount to withdraw"
				/>
			</DialogContent>
			<DialogActions>
				<Button
					aria-label="Withdraw"
					size="large"
					disabled={!canDeposit}
					onClick={handleSubmit(onSubmit)}
					variant="contained"
					color="primary"
					fullWidth
					className={classes.button}
				>
					Withdraw
				</Button>
			</DialogActions>
		</>
	);
});
