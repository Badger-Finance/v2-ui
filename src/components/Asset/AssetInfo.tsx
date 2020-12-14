import React, { useContext } from 'react';
import { OpenSeaAsset } from 'opensea-js/lib/types';
import {
	Grid, CircularProgress, Typography,
	Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,
	Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Web3 from 'web3';

const useStyles = makeStyles((theme) => ({

	media: {
		height: 0,
		paddingTop: '56.25%', // 16:9
		backgroundSize: "contain",
		width: "100%"
	},
	root: {
		width: "100%"
	},
	price: {
		display: 'flex',
		alignItems: 'center',
		margin: theme.spacing(2, 0)
	},
	priceCopy: {
		marginRight: theme.spacing(2)
	},
	name: {
		marginBottom: theme.spacing(2)
	}


}));

export const AssetInfo = (props: { asset: OpenSeaAsset, buyClicked: any }) => {
	const { asset, buyClicked } = props;
	const classes = useStyles();

	if (!asset) {
		return <CircularProgress />
	}


	return <Card className={classes.root}>
		<CardHeader
			avatar={
				<Avatar aria-label="recipe" src={asset.owner.profileImgUrl} >

				</Avatar>
			}
			action={
				<IconButton aria-label="settings" onClick={() => { }}>
					<MoreVertIcon />
				</IconButton>
			}
			title={asset.owner.user?.username}
			subheader={asset.collection.name}
		/>

		<CardContent>
			<Typography variant="h2" className={classes.name}>
				{asset.name}
			</Typography>
			{asset.sellOrders!.length > 0 && <div className={classes.price}>
				<Typography variant="body2" className={classes.priceCopy}>
					Current Price:
				</Typography>
				<Button variant="outlined" size="large" onClick={() => buyClicked(asset.sellOrders![0])}>
					{Web3.utils.fromWei(asset.sellOrders![0].currentPrice!.toString())}Ξ
			</Button>
			</div>
			}
			<Typography variant="body1" component="p">
				{asset.description || "No Description"}
			</Typography>
		</CardContent>


	</Card>



}
