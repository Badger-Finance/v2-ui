import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { StoreContext } from 'mobx/store-context';
import { Button, DialogContent, TextField, DialogActions, ButtonGroup } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { Loader } from 'components/Loader';
import { BigNumber } from 'bignumber.js';
import { useForm } from 'react-hook-form';
import { formatDialogBalanceUnderlying } from 'mobx/reducers/statsReducers';
import { StrategyInfo } from './StrategyInfo';

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
export const VaultWithdraw = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { vault } = props;
	const { register, handleSubmit, watch, setValue } = useForm({ mode: 'all' });

	const {
		wallet: { connectedAddress, network },
	} = store;

	const percentageOfBalance = (percent: number) => {
		return vault.balance
			.dividedBy(10 ** vault.decimals)
			.multipliedBy(percent / 100)
			.toFixed(vault.decimals, BigNumber.ROUND_HALF_FLOOR);
	};

	const setAmount = (percent: number) => {
		setValue(
			'amount',
			vault.balance
				.dividedBy(10 ** vault.decimals)
				.multipliedBy(percent / 100)
				.toFixed(vault.decimals, BigNumber.ROUND_HALF_FLOOR),
		);
	};

	const onSubmit = (params: any) => {
		const amount = new BigNumber(params.amount);
		vault.withdraw(amount);
	};

	if (!vault) {
		return <Loader />;
	}

	const canDeposit = !!watch().amount && !!connectedAddress && vault.balance.gt(0);

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
							Underlying {vault.underlyingToken.symbol}:{' '}
							{!!connectedAddress ? (
								formatDialogBalanceUnderlying(vault)
							) : (
								<Skeleton animation="wave" className={classes.skeleton} />
							)}
						</Typography>
						<Typography variant="body1" color={'textSecondary'} style={{ marginBottom: '.2rem' }}>
							Deposited {vault.symbol}:{' '}
							{!!connectedAddress && !!totalAvailable ? (
								totalAvailable
							) : (
								<Skeleton animation="wave" className={classes.skeleton} />
							)}
						</Typography>
					</div>
					{renderAmounts}
				</div>

				<StrategyInfo vaultAddress={vault.address} network={network} />

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
