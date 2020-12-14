import React, { useContext, useState } from 'react';
import { AnyKindOfDictionary, map } from 'lodash';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import { OpenSeaAsset } from 'opensea-js/lib/types';
import {
	Grid, CircularProgress, Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,
	TableContainer,
	TableBody,
	Table,
	TableHead,
	TableRow,
	TableCell,
	Container,
	TextField,
	Button
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import BigNumber from 'bignumber.js'
import Submit from '@material-ui/icons/ArrowForward'
import { useForm } from "react-hook-form";
import _ from 'lodash';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { Share } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({

	// root: { marginTop: theme.spacing(2) },
	stat: {
		margin: theme.spacing(2, 2, 0, 0),
		display: 'flex',
		justifyContent: 'space-between'
	},
	card: {
		overflow: 'hidden',

		padding: theme.spacing(0, 2, 2, 2)
	},
	field: {
		maxWidth: "75%"
	}

}));
export const VaultFunction = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { row, method } = props
	const { register, handleSubmit, watch, errors } = useForm({ mode: 'all' });

	const { router: { params, goTo }, app: { vault, collection, callMethod, refresh } } = store;

	const [state, setState] = useState<any>({ status: method.type })

	const onSubmit = (params: any) => {
		console.log(vault)

		let inputs = !!params[method.name] ? params[method.name].map((param: string) => {
			return /\-?\d+\.*\d+/.test(param) ? new BigNumber(parseFloat(param)).multipliedBy(1e18) : param;
		}) : []
		console.log(inputs)
		callMethod(vault.address, method.name, inputs, collection.config.abi, onTransaction)
	}

	const onTransaction = (transaction: PromiEvent<Contract>) => {
		transaction
			.on('transactionHash', (hash: string) => {
				setState({ status: 'pending', hash: hash })
			}).on('receipt', (reciept: any) => {
				setState({ status: 'success', hash: state.hash })

				refresh()
			}).catch((error: any) => {
				setState({ status: 'error', hash: state.hash })

			})
	}


	const actionInput = (type: string, name: string, index: number) => {
		switch (type) {
			case 'address':
				return <TextField type="text" disabled={state.status == "pending"} autoComplete="off" placeholder="Type an address" name={`${method.name}[${index}]`} inputRef={register} fullWidth className={classes.field} />
			case 'uint256':
				return <TextField type="text" disabled={state.status == "pending"} autoComplete="off" placeholder="Type a number" name={`${method.name}[${index}]`} inputRef={register} fullWidth className={classes.field} />
			case 'bytes':
				return <TextField type="text" disabled={state.status == "pending"} autoComplete="off" placeholder="Type some bytes" name={`${method.name}[${index}]`} inputRef={register} fullWidth className={classes.field} />
		}
	}

	const formatValue = (value: any) => {
		if (BigNumber.isBigNumber(value)) {
			return value.div(1e18).toFixed(18)
		}
		return value
	}


	if (!row) {
		return <Loader />
	}


	return <Grid item xs={6} key={method.name}>
		<Card >
			<CardHeader

				title={method.name}
				subheader={state.status || method.type}

				action={state.hash && <IconButton href={`https://etherscan.io/tx/${state.hash}`} target="_"><Share /></IconButton>}

			/>
			<CardContent className={classes.card} >
				{method.inputs.length == 0 &&
					<Typography variant="subtitle1" color={!!row[method.name] ? "textSecondary" : "inherit"}>
						{!!row[method.name] ? formatValue(row[method.name]) : "No inputs required."}
					</Typography>
				}
				{method.inputs
					.map((input: any, index: number) => {

						return <div className={classes.stat}>
							<Typography variant="subtitle1">{input.name}</Typography>
							{actionInput(input.type, input.name, index)}
						</div>
					})}
			</CardContent>
			<CardActions >
				<IconButton disabled={state.status == "pending"} style={{ marginLeft: 'auto' }} onClick={handleSubmit(onSubmit)} >
					<Submit />
				</IconButton>
			</CardActions>
		</Card>
	</Grid>


});

