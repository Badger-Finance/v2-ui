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
		margin: theme.spacing(1, 0, 1)
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
export const GeyserUnstake = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const {
		onClose,
		uiStats } = props
	const { register, handleSubmit, watch, errors, setValue } = useForm({ mode: 'all' });

	const { router: { params, goTo }, contracts: { vaults, tokens, unstakeAndUnwrap }, uiState: { txStatus } } = store;

	const setAmount = (percent: number) => {
		// (document.getElementById(TEXTFIELD_ID)! as HTMLInputElement).value = uiStats.depositedFull[percent];
		setValue('amount', uiStats.depositedFull[percent])
	}

	const onSubmit = (params: any) => {
		let amount = new BigNumber(params.amount).multipliedBy(1e18)
		unstakeAndUnwrap(uiStats.geyser, amount)
	}

	if (!uiStats) {
		return <Loader />
	}

	let renderAmounts = <ButtonGroup size="small" >
		<Button onClick={() => { setAmount(25) }} variant={watch().amount === uiStats.depositedFull[25] ? "contained" : "outlined"} color="primary">25%</Button>
		<Button onClick={() => { setAmount(50) }} variant={watch().amount === uiStats.depositedFull[50] ? "contained" : "outlined"} color="primary">50%</Button>
		<Button onClick={() => { setAmount(75) }} variant={watch().amount === uiStats.depositedFull[75] ? "contained" : "outlined"} color="primary">75%</Button>
		<Button onClick={() => { setAmount(100) }} variant={watch().amount === uiStats.depositedFull[100] ? "contained" : "outlined"} color="primary">100%</Button>
	</ButtonGroup>


	let anyAvailable = !!uiStats.availableBalance && parseFloat(uiStats.availableBalance) !== 0
	return <>
		<DialogContent style={{ textAlign: "center" }}>

			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
				<Typography variant="body1" color={'textSecondary'} style={{ marginBottom: ".2rem" }}>
					Deposited: {uiStats.depositedFull[100]}

				</Typography>
				{renderAmounts}
			</div>

			<TextField autoComplete="off" name="amount" inputRef={register} id={TEXTFIELD_ID} className={classes.field} variant="outlined" fullWidth placeholder="Type an amount to unstake" />


			<Button size="large" onClick={handleSubmit(onSubmit)} variant="contained" color="primary" fullWidth className={classes.button}>Unstake & Withdraw</Button>

		</DialogContent>
	</>


});

