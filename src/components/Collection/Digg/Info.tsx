import { Grid, Typography, Paper, makeStyles } from "@material-ui/core";

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
const useStyles = makeStyles((theme) => ({

	before: {
		marginTop: theme.spacing(3),
		width: "100%"
	},
	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center'
	},

}));
const Info = observer((props: any) => {
	// const { getContractStats, contractStats } = useStore();
	const classes = useStyles();

	const [nextRebase, setNextRebase] = useState("00:00:00");


	return <>
		<Grid item xs={12} md={3}>
			<Paper className={classes.statPaper}>

				<Typography variant="subtitle1">Next Rebase</Typography>
				<Typography variant="h5">{nextRebase}</Typography>
			</Paper>
		</Grid>
		<Grid item xs={6} md={3}>
			<Paper className={classes.statPaper}>

				<Typography variant="subtitle1">Oracle rate</Typography>
				<Typography variant="h5">...</Typography>
			</Paper>
		</Grid>
		<Grid item xs={6} md={3}>
			<Paper className={classes.statPaper}>

				<Typography variant="subtitle1">Price target</Typography>
				<Typography variant="h5">1 BTC</Typography>
			</Paper>
		</Grid>
		<Grid item xs={12} md={3}>
			<Paper className={classes.statPaper}>

				<Typography variant="subtitle1">Circulating / Total Supply</Typography>
				<Typography variant="h5">
					0/0
			</Typography>
			</Paper>
		</Grid>
	</>

});

export default Info;
