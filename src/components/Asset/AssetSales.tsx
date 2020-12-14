import React, { useContext } from 'react';
import { OpenSeaAsset } from 'opensea-js/lib/types';
import {
	Grid, CircularProgress, Typography,
	Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,
	TableContainer,
	TableBody,
	Table,
	TableHead,
	TableRow,
	TableCell
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Web3 from 'web3';

const useStyles = makeStyles((theme) => ({

	root: {

	}


}));

export const AssetSales = (props: { orders: any[] | undefined }) => {
	const { orders } = props;
	const classes = useStyles();


	const renderSales = () => {
		return orders!.map((row) => (
			<TableRow key={row.v}>
				<TableCell align="left">{row.makerAccount?.user?.username}</TableCell>
				<TableCell align="left">{new Date(row.listingTime?.toNumber() || 0).toLocaleTimeString()}</TableCell>
				<TableCell align="left">{new Date(row.expirationTime?.toNumber() || 0).toLocaleDateString()}</TableCell>
				<TableCell align="right">{Web3.utils.fromWei(row.currentPrice!.toString())}Ξ</TableCell>
				<TableCell align="right">{row.quantity.toString()}</TableCell>
				<TableCell align="right">{!!row.cancelledOrFinalized ? row.taker == "0x0000000000000000000000000000000000000000" ? "Cancelled" : "Sold" : "Live"}</TableCell>
			</TableRow>
		))

	}

	if (!orders) {
		return <CircularProgress />
	}



	return <Card className={classes.root}>

		<CardHeader

			action={
				<IconButton aria-label="settings" onClick={() => { }}>
					<MoreVertIcon />
				</IconButton>
			}
			title={"Trading history"}
			subheader={orders.length > 0 ? orders.length + ' Events' : 'No history found.'}
		/>

		<CardContent>

			<TableContainer >
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell align="left">Listed by</TableCell>
							<TableCell align="left">Listing time</TableCell>
							<TableCell align="left">Expiration</TableCell>
							<TableCell align="right">Current Price</TableCell>
							<TableCell align="right">Quantity</TableCell>
							<TableCell align="right">Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{renderSales()}
					</TableBody>
				</Table>
			</TableContainer>
		</CardContent>


	</Card>




}
