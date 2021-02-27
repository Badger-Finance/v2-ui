import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { Button, DialogContent, TextField, DialogActions, ButtonGroup } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../../Loader';
import { BigNumber } from 'bignumber.js';
import { useForm } from 'react-hook-form';
import { formatDialogBalanceUnderlying } from 'mobx/reducers/statsReducers';

const TEXTFIELD_ID = 'amountField';

const useStyles = makeStyles((theme) => ({
	button: {
		marginBottom: theme.spacing(1),
	},
	field: {
		margin: theme.spacing(1, 0, 1),
	},
}));
export const GeyserStake = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { vault } = props;
	const { register, handleSubmit, watch, setValue } = useForm({ mode: 'all' });

	const {
		wallet: { connectedAddress },
	} = store;

	const percentageOfBalance = (percent: number) => {
		return vault.balance
			.dividedBy(10 ** vault.decimals)
			.multipliedBy(percent / 100)
			.toFixed(18, BigNumber.ROUND_HALF_FLOOR);
	};

	const setAmount = (percent: number) => {
		setValue(
			'amount',
			vault.balance
				.dividedBy(10 ** vault.decimals)
				.multipliedBy(percent / 100)
				.toFixed(18, BigNumber.ROUND_HALF_FLOOR),
		);
	};

	const onSubmit = (params: any) => {
		const amount = new BigNumber(params.amount);
		vault.geyser.stake(amount);
	};

	if (!vault) {
		return <Loader />;
	}

	const canDeposit = !!watch().amount && !!connectedAddress && vault.balance.gt(0);

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
					<div>
						<Typography variant="body2" color={'textSecondary'} style={{ marginBottom: '.2rem' }}>
							Underlying {vault.underlyingToken.symbol}: {formatDialogBalanceUnderlying(vault)}
						</Typography>
						<Typography variant="body1" color={'textSecondary'} style={{ marginBottom: '.2rem' }}>
							Available {vault.symbol}: {totalAvailable}
						</Typography>
					</div>
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
					placeholder="Type an amount to stake"
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
					Stake
				</Button>
			</DialogActions>
		</>
	);
});
