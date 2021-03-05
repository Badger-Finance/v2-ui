import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { StoreContext } from '../../../mobx/store-context';
import { Button, DialogContent, TextField, DialogActions, ButtonGroup } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../../Loader';
import { BigNumber } from 'bignumber.js';
import { useForm } from 'react-hook-form';
import { formatBalanceStaked } from 'mobx/reducers/statsReducers';

const TEXTFIELD_ID = 'amountField';

const useStyles = makeStyles((theme) => ({
	button: {
		marginBottom: theme.spacing(1),
	},
	field: {
		margin: theme.spacing(1, 0, 1),
	},
}));
export const GeyserUnstake = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { vault } = props;
	const { register, handleSubmit, watch, setValue } = useForm({ mode: 'all' });

	const {
		wallet: { connectedAddress },
	} = store;

	const percentageOfBalance = (percent: number) => {
		return vault.geyser.balance
			.dividedBy(10 ** vault.decimals)
			.multipliedBy(percent / 100)
			.toFixed(parseInt(vault.decimals), BigNumber.ROUND_HALF_FLOOR);
	};

	const setAmount = (percent: number) => {
		// (document.getElementById(TEXTFIELD_ID)! as HTMLInputElement).value = uiStats.availableFull[percent];
		setValue(
			'amount',
			vault.geyser.balance
				.dividedBy(10 ** parseInt(vault.decimals))
				.multipliedBy(percent / 100)
				.toFixed(parseInt(vault.decimals), BigNumber.ROUND_HALF_FLOOR),
		);
	};

	const onSubmit = (params: any) => {
		const amount = new BigNumber(params.amount);
		vault.geyser.unstake(amount);
	};

	if (!vault) {
		return <Loader />;
	}

	const canUnstake = !!connectedAddress && vault && vault.geyser.balance.gt(0);

	const renderAmounts = (
		<ButtonGroup size="small" className={classes.button} disabled={!connectedAddress}>
			{[25, 50, 75, 100].map((amount: number) => (
				<Button
					aria-label={`${amount}%`}
					onClick={() => {
						setAmount(amount);
					}}
					variant={!!canUnstake && watch().amount === percentageOfBalance(amount) ? 'contained' : 'outlined'}
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
							Underlying {vault.underlyingToken.symbol}: {formatBalanceStaked(vault.geyser)}
						</Typography>
						<Typography variant="body1" color={'textSecondary'} style={{ marginBottom: '.2rem' }}>
							Staked {vault.symbol}: {totalAvailable}
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
					placeholder="Type an amount to unstake"
				/>
			</DialogContent>
			<DialogActions>
				<Button
					aria-label="Unstake"
					size="large"
					disabled={!canUnstake}
					onClick={handleSubmit(onSubmit)}
					variant="contained"
					color="primary"
					fullWidth
					className={classes.button}
				>
					Unstake
				</Button>
			</DialogActions>
		</>
	);
});
