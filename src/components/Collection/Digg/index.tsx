import { Container, Grid, makeStyles, Typography } from "@material-ui/core";
import { observer } from 'mobx-react-lite';

import DashboardCard from "./DashboardCard";
import Info from "./Info";
import React from "react";


const useStyles = makeStyles((theme) => ({

	root: {
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(28),
			marginTop: theme.spacing(2),
		},
	},
	before: {
		marginTop: theme.spacing(3),
		width: "100%"
	},

}));

export const Digg = observer((props: any) => {
	const classes = useStyles();

	const spacer = () => <div className={classes.before} />;

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={2}>

				{spacer()}

				<Grid item xs={12}  >
					<Typography variant="h5" color="textPrimary" >Badger</Typography>
					<Typography variant="subtitle2" color="textPrimary" >Accelerating BTC in DeFi</Typography>
				</Grid>

				<Info />

				<Grid item xs={12} md={12}>
					<DashboardCard title="Supply" accent="#152554" />
				</Grid>
				<Grid item xs={12} md={6}>
					<DashboardCard title="Price" accent="#152554" />
				</Grid>
				<Grid item xs={12} md={6}>
					<DashboardCard title="Market cap" accent="#152554" />
				</Grid>
				{spacer()}

			</Grid>
		</Container>
	);
})