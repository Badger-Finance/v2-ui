<<<<<<< HEAD
import { Button, ButtonGroup, Container, Grid, makeStyles, Typography, Paper, Tabs, Tab } from "@material-ui/core";
import { observer } from 'mobx-react-lite';

import DashboardCard from "./DashboardCard";
import Info from "./Info";
import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/store-context";
=======
import { Button, ButtonGroup, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import DashboardCard from './DashboardCard';
import Info from './Info';
import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/store-context';
>>>>>>> develop

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	filters: {
		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'right',
		},
		marginTop: 'auto',
		marginBottom: 'auto',
	},
	buttonGroup: {
		marginRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			marginLeft: theme.spacing(2),
			marginRight: theme.spacing(0),
		},
	},
<<<<<<< HEAD
	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		minHeight: '100%',
	},
=======
>>>>>>> develop
}));

export const Digg = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		uiState: {},
	} = store;
	const spacer = () => <div className={classes.before} />;
<<<<<<< HEAD
=======
	const [graphSelected, setGraphSelected] = useState<string>('Supply');
>>>>>>> develop

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={2}>
				{spacer()}

				<Grid item sm={6} xs={12}>
					<Typography variant="h5" color="textPrimary">
						Digg
					</Typography>
					<Typography variant="subtitle2" color="textPrimary">
						Rebasing Bitcoin
					</Typography>
				</Grid>
				<Grid item sm={6} xs={12} className={classes.filters}>
					<ButtonGroup disabled variant="outlined" size="small" className={classes.buttonGroup}>
						<Button>Deposit</Button>
						<Button>Stake (0.00% APY)</Button>
					</ButtonGroup>
				</Grid>

				<Info />

<<<<<<< HEAD
				<Grid item xs={12}>
					<DashboardCard accent="#152554" />
=======
				<ButtonGroup
					variant="outlined"
					size="small"
					className={classes.buttonGroup}
					aria-label="outlined button group"
				>
					<Button
						onClick={() => setGraphSelected('Supply')}
						variant={graphSelected === 'Supply' ? 'contained' : 'outlined'}
					>
						Supply
					</Button>
					<Button
						onClick={() => setGraphSelected('Price')}
						variant={graphSelected === 'Price' ? 'contained' : 'outlined'}
					>
						Price
					</Button>
					<Button
						onClick={() => setGraphSelected('Market cap')}
						variant={graphSelected === 'Market cap' ? 'contained' : 'outlined'}
					>
						Market cap
					</Button>
				</ButtonGroup>

				<Grid item xs={12}>
					<DashboardCard title={graphSelected} accent="#152554" />
>>>>>>> develop
				</Grid>
				{spacer()}
			</Grid>
		</Container>
	);
});
