import React, { useContext } from 'react';
import { OpenSeaAsset } from 'opensea-js/lib/types';
import {
	Grid, CircularProgress, Typography,
	Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles((theme) => ({

	media: {
		height: 0,
		paddingTop: '100%', // 16:9
		backgroundSize: "contain",
		width: "100%"
	},
	root: {
		width: "100%"
	}


}));

export const AssetImage = (props: { asset: OpenSeaAsset }) => {
	const { asset } = props;
	const classes = useStyles();

	if (!asset) {
		return <CircularProgress />
	}


	return <Card className={classes.root}>
		<CardMedia
			className={classes.media}
			image={asset.imageUrlOriginal}
			title={asset.name}

		/>

	</Card>



}
