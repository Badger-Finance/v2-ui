import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { StoreContext } from 'mobx/store-context';
import { Button, DialogContent, TextField, DialogActions, ButtonGroup } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from 'components/Loader';
import { BigNumber } from 'bignumber.js';
import { useForm } from 'react-hook-form';

const TEXTFIELD_ID = 'amountField';

const useStyles = makeStyles((theme) => ({
	button: {
		marginBottom: theme.spacing(1),
	},
	field: {
		margin: theme.spacing(1, 0, 1),
	},
}));
export const VaultDeposit = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { vault } = props;
	const { register, handleSubmit, watch, setValue } = useForm({ mode: 'all' });

	const {
		wallet: { connectedAddress },
	} = store;

	const percentageOfBalance = (percent: number) => {
		return vault.underlyingToken.balance
			.dividedBy(10 ** vault.underlyingToken.decimals)
			.multipliedBy(percent / 100)
			.toFixed(vault.underlyingToken.decimals, BigNumber.ROUND_HALF_FLOOR);
	};

	const setAmount = (percent: number) => {
		setValue(
			'amount',
			vault.underlyingToken.balance
				.dividedBy(10 ** vault.underlyingToken.decimals)
				.multipliedBy(percent / 100)
				.toFixed(vault.underlyingToken.decimals, BigNumber.ROUND_HALF_FLOOR),
		);
	};

	const onSubmit = (params: any) => {
		const amount = new BigNumber(params.amount);
		vault.deposit(amount);
	};

	if (!vault) {
		return <Loader />;
	}

	const canDeposit = !!watch().amount && !!connectedAddress && vault.underlyingToken.balance.gt(0);

	const renderAmounts = (
		<ButtonGroup size="small" className={classes.button} disabled={!connectedAddress}>
			{[25, 50, 75, 100].map((amount: number) => (
				<Button
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
					<Typography variant="body1" color={'textSecondary'} style={{ marginBottom: '.2rem' }}>
						Available: {totalAvailable}
					</Typography>
					{renderAmounts}
				</div>
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
