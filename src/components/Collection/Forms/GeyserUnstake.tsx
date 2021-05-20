import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { Button, DialogContent, TextField, DialogActions, ButtonGroup } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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
	noGeyser: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(5),
		flexDirection: 'column',
	},
	saiyanIcon: {
		height: '82px',
		width: '82px',
		marginTop: theme.spacing(5),
		marginBottom: theme.spacing(1),
	},
}));

export const GeyserUnstake = observer((props: SettModalProps) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { register, handleSubmit, watch, setValue } = useForm({ mode: 'all' });
	const { sett, badgerSett } = props;

	const {
		wallet: { connectedAddress, network },
		user: { geyserBalances },
		contracts,
		rewards,
	} = store;

	if (!badgerSett.geyser) {
		return (
			<div className={classes.noGeyser}>
				<Typography>{`${sett.name} has no geyser.`}</Typography>
				<img src={'./assets/icons/badger_saiyan.png'} className={classes.saiyanIcon} />
				<Typography>{'Rewards are earned from Sett deposits.'}</Typography>
			</div>
		);
	}

	const userBalance = geyserBalances[badgerSett.geyser];
	const underlying = userBalance.tokenBalance.multipliedBy(sett.ppfs);
	const underlyingBalance = new TokenBalance(rewards, userBalance.token, underlying, userBalance.price);

	// remove rendudant code
	const percentageOfBalance = (percent: number): string => {
		return userBalance.scaledBalanceDisplay(percent);
	};

	const setAmount = (percent: number) => {
		setValue('amount', percentageOfBalance(percent));
	};

	const onSubmit = (params: any) => {
		const unstakeBalance = TokenBalance.fromBalance(userBalance, params.amount);
		contracts.unstake(sett, badgerSett, userBalance, unstakeBalance);
	};

	const canUnstake = () => {
		return !!connectedAddress && userBalance.balance.gt(0);
	};

	const renderAmounts = (
		<ButtonGroup size="small" className={classes.button} disabled={!connectedAddress}>
			{[25, 50, 75, 100].map((amount: number) => (
				<Button
					aria-label={`${amount}%`}
					onClick={() => {
						setAmount(amount);
					}}
					variant={
						!!canUnstake() && watch().amount === percentageOfBalance(amount) ? 'contained' : 'outlined'
					}
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
							Staked {`b${sett.asset}`}:{' '}
							{connectedAddress && totalAvailable ? (
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
