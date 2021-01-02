import { Button, ButtonGroup, Container, Grid, makeStyles, Typography } from "@material-ui/core";
import { observer } from 'mobx-react-lite';

import DashboardCard from "./DashboardCard";
import Info from "./Info";
import React, { useContext } from "react";
import { StoreContext } from "../../../context/store-context";


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
	filters: {
		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'right'
		},
	},
	buttonGroup: {
		marginRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			marginLeft: theme.spacing(2),
			marginRight: theme.spacing(0),

		},
	},



}));

export const Digg = observer((props: any) => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const { uiState: { rebaseStats } } = store

	const spacer = () => <div className={classes.before} />;

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={2}>

				{spacer()}

				<Grid item sm={6} xs={12}  >
					<Typography variant="h5" color="textPrimary" >Digg</Typography>
					<Typography variant="subtitle2" color="textPrimary" >Rebasing Bitcoin</Typography>
				</Grid>
				<Grid item sm={6} xs={12} className={classes.filters}>
					<ButtonGroup disabled variant="outlined" size="small" className={classes.buttonGroup}>
						<Button>Deposit</Button>
						<Button>Stake (0.00% APY)</Button>
					</ButtonGroup>
				</Grid>


				<Info />

				<Grid item xs={12} >
					<DashboardCard title="Supply" accent="#152554" />
				</Grid>
				<Grid item xs={12}>
					<DashboardCard title="Price" accent="#152554" />
				</Grid>
				<Grid item xs={12}>
					<DashboardCard title="Market cap" accent="#152554" />
				</Grid>
				{spacer()}

			</Grid>
		</Container>
	);
})