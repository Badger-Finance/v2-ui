import { Grid, Typography, Paper, makeStyles } from "@material-ui/core";

import React, { useState, useContext } from "react";
import { StoreContext } from "../../../context/store-context";
import useInterval from "@use-it/interval";
import { observer } from "mobx-react-lite";
import { Loader } from "../../Loader";
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

	const store = useContext(StoreContext);
	const { uiState: { rebaseStats } } = store
	const classes = useStyles();

	const [nextRebase, setNextRebase] = useState("00:00:00");

	if (!rebaseStats) {
		return <Loader />
	}

	useInterval(() => {
		if (!!rebaseStats && !!rebaseStats.nextRebase) {
			let zero = new Date(0);

			zero.setTime(rebaseStats.nextRebase.getTime() - new Date().getTime());
			setNextRebase(zero.toISOString().substr(11, 8));
		}
	}, 1000);

	return <>
		<Grid item xs={12} md={3}>
			<Paper className={classes.statPaper}>

				<Typography variant="subtitle1">Next Rebase</Typography>
				<Typography variant="h5">{nextRebase || '...'}</Typography>
			</Paper>
		</Grid>
		<Grid item xs={6} md={3}>
			<Paper className={classes.statPaper}>

				<Typography variant="subtitle1">Oracle rate</Typography>
				<Typography variant="h5">{rebaseStats.oracleRate || '...'}</Typography>
			</Paper>
		</Grid>
		<Grid item xs={6} md={3}>
			<Paper className={classes.statPaper}>

				<Typography variant="subtitle1">Price target</Typography>
				<Typography variant="h5">₿ 1.00000</Typography>
			</Paper>
		</Grid>
		<Grid item xs={12} md={3}>
			<Paper className={classes.statPaper}>

				<Typography variant="subtitle1">Total Supply</Typography>
				<Typography variant="h5">
					{rebaseStats.totalSupply || '...'}
				</Typography>
			</Paper>
		</Grid>
	</>

});

export default Info;
