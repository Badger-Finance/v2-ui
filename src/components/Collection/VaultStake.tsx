import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import {
	Button,
	Grid,
	DialogContent,
	TextField,
	DialogActions,
	ButtonGroup
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { BigNumber } from 'bignumber.js'
import { useForm } from 'react-hook-form';

const TEXTFIELD_ID = 'amountField'

const useStyles = makeStyles((theme) => ({

	// root: { marginTop: theme.spacing(2) },
	stat: {
		float: "left",
		width: "25%",
		padding: theme.spacing(2, 2, 0, 0),
		wordWrap: "break-word",
		overflow: 'hidden',
		whiteSpace: "nowrap",
		position: 'relative'
	},
	card: {
		overflow: 'hidden',

		padding: theme.spacing(0, 2, 2, 2)
	},
	fade: {
		position: 'absolute',
		right: 0,
		bottom: 0
	}
	, buttons: {
		textAlign: "right"
	},
	button: {
		marginBottom: theme.spacing(1)
	},
	field: {
		margin: theme.spacing(0, 0, 1)
	},
	border: {
		border: `1px solid ${theme.palette.grey[800]}`,
		borderWidth: '1px 1px 1px 1px',
		// marginBottom: theme.spacing(1),
		// borderRadius: theme.shape.borderRadius,
		padding: theme.spacing(2, 1),
		alignItems: 'center'
	}

}));
export const VaultStake = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const {
		onClose,
		uiStats } = props
	const { register, handleSubmit, watch, errors, setValue } = useForm({ mode: 'all' });

	const { router: { params, goTo }, contracts: { vaults, tokens, depositAndStake }, wallet: { connectedAddress }, uiState: { txStatus } } = store;

	const setAmount = (percent: number) => {
		// (document.getElementById(TEXTFIELD_ID)! as HTMLInputElement).value = uiStats.availableFull[percent];
		setValue('amount', uiStats.availableFull[percent])
	}

	const onSubmit = (params: any) => {
		let amount = new BigNumber(params.amount).multipliedBy(1e18)
		depositAndStake(uiStats.vault, amount, uiStats.anyWrapped)
	}


	if (!uiStats) {
		return <Loader />
	}

	const canDeposit = !!connectedAddress && uiStats.availableFull[25] !== uiStats.availableFull[100]

	let renderAmounts = <ButtonGroup size="small" className={classes.button} disabled={!connectedAddress} >
		<Button onClick={() => { setAmount(25) }} variant={!!canDeposit && watch().amount === uiStats.availableFull[25] ? "contained" : "outlined"} color="primary">25%</Button>
		<Button onClick={() => { setAmount(50) }} variant={!!canDeposit && watch().amount === uiStats.availableFull[50] ? "contained" : "outlined"} color="primary">50%</Button>
		<Button onClick={() => { setAmount(75) }} variant={!!canDeposit && watch().amount === uiStats.availableFull[75] ? "contained" : "outlined"} color="primary">75%</Button>
		<Button onClick={() => { setAmount(100) }} variant={!!canDeposit && watch().amount === uiStats.availableFull[100] ? "contained" : "outlined"} color="primary">100%</Button>
	</ButtonGroup>


	let anyAvailable = !!uiStats.availableBalance && parseFloat(uiStats.availableBalance) !== 0
	return <>

		<DialogContent  >
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
				<Typography variant="body1" color={'textSecondary'} style={{ marginBottom: ".2rem" }}>
					Available: {uiStats.availableFull[100] || '0.000000000000000000'}
					{/* Wrapped: {uiStats.wrappedFull[100]} */}

				</Typography>
				{renderAmounts}
			</div>


			<TextField autoComplete="off" name="amount" disabled={!connectedAddress} inputRef={register} id={TEXTFIELD_ID} className={classes.field} variant="outlined" fullWidth placeholder="Type an amount to stake" />


			<Button size="large" disabled={!connectedAddress} onClick={handleSubmit(onSubmit)} variant="contained" color="primary" fullWidth className={classes.button}>Stake</Button>

		</DialogContent>
		<DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
			<Typography variant="body2" color="textPrimary">ROI:</Typography>
			<div style={{ display: 'flex' }}><Typography variant="body2" color="textPrimary">{uiStats.day}</Typography>&nbsp;
				<Typography variant="body2" color="textSecondary"> daily</Typography></div>
			<div style={{ display: 'flex' }}><Typography variant="body2" color="textPrimary">{uiStats.month}</Typography>&nbsp;
				<Typography variant="body2" color="textSecondary"> monthly</Typography></div>
			<div style={{ display: 'flex' }}><Typography variant="body2" color="textPrimary">{uiStats.year}</Typography>&nbsp;
				<Typography variant="body2" color="textSecondary"> yearly</Typography></div>
		</DialogActions>
	</>


});

