import { Button, ButtonGroup, Container, Grid, makeStyles, Typography, Paper, Tabs, Tab } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import DashboardCard from './DashboardCard';
import Info from './Info';
import React, { useContext, useState } from 'react';
import { StoreContext } from '../../mobx/store-context';
import views from '../../config/routes';

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	before: {
		marginTop: theme.spacing(5),
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
	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		minHeight: '100%',
	},
	heroPaper: {
		padding: theme.spacing(0, 0, 5),
		minHeight: '100%',
		background: 'none',
		textAlign: 'center',
		[theme.breakpoints.up('md')]: {
			padding: theme.spacing(0, 5, 5),
		},
	},
}));

export const Digg = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		router: { goTo },
		uiState: { openSidebar, notification },
	} = store;
	const spacer = () => <div className={classes.before} />;

	return (
		<Container className={classes.root} maxWidth="lg">
			<Grid container spacing={1}>
				{spacer()}

				<Grid item sm={12} xs={12}>
					<div className={classes.heroPaper}>
						<Typography variant="h4" color="textPrimary">
							DIGG – Pegged to Bitcoin
						</Typography>
						<Typography variant="subtitle1" color="textSecondary">
							An elastic supply cryptocurrency pegged to the price of Bitcoin & governed by BadgerDAO.
						</Typography>
					</div>
				</Grid>
				<Info />

				<Grid item xs={12}>
					<DashboardCard accent="#152554" />
				</Grid>
				{spacer()}
			</Grid>
		</Container>
	);
});
