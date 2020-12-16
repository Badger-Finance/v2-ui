import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import {
	Card, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import BigNumber from 'bignumber.js'

const useStyles = makeStyles((theme) => ({

	// root: { marginTop: theme.spacing(2) },
	stat: {
		float: "left",
		width: "33%",
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


}));
export const VaultCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { config, contract } = props

	const { router: { params, goTo }, contracts: { vaults, tokens }, uiState: { collection } } = store;

	const openVault = (asset: string) => {
		goTo(views.vault, { collection: collection.id, id: asset })
	}

	const stat = (key: any, value: any) => <div key={key} className={classes.stat}>
		<Typography color="textSecondary" variant="subtitle2">{key}</Typography>
		<Typography variant="body1">{value}</Typography>
		<img src={require("../../assets/fade.png")} className={classes.fade} />
	</div>


	if (!contract || !config) {
		return <Loader />
	}

	const underlying = contract[config.underlying]

	return <>
		<Card>
			<CardActionArea onClick={() => openVault(contract.address)}>

				<CardContent className={classes.card} >

					{Object.keys(contract).filter((key) => config.table.includes(key))
						.map((key: string) => {
							let value = contract[key]
							if (BigNumber.isBigNumber(value)) {
								value = value.div(1e18).toFixed(18)
							}
							return stat(key, value)
						})}
				</CardContent>

			</CardActionArea>

		</Card>

	</>


});

