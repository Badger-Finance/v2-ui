import { makeStyles, Typography, Button, Grid } from '@material-ui/core';
import React, { useContext } from 'react';
import views from '../../config/routes';
import { Route } from 'mobx-router';
import { RootStore } from 'mobx/RootStore';
import { StoreContext } from '../../mobx/store-context';
import { SettState } from '../../mobx/model/setts/sett-state';
import { QueryParams } from '../../../node_modules/mobx-router/src/route';

const useStyles = makeStyles((theme) => ({
	messageContainer: {
		paddingTop: theme.spacing(8),
		textAlign: 'center',
	},
	titleText: {
		paddingBottom: theme.spacing(2),
	},
	linkContainer: {
		paddingTop: theme.spacing(2),
	},
}));

const linkObjects = (
	state: SettState,
	goTo: <
		P extends QueryParams = Record<string, string | number | boolean | undefined>,
		Q extends QueryParams = Record<string, string | number | boolean | undefined>
	>(
		route: Route<RootStore, P, Q>,
		paramsObj?: P | undefined,
		queryParamsObj?: Q | undefined,
	) => Promise<void>,
) => {
	const linkStates = Object.values(SettState).filter((s) => s !== state);
	const links: JSX.Element[] = [];
	linkStates.forEach((linkState) => {
		switch (linkState) {
			case SettState.Experimental:
				links.push(
					<Grid item xs={2}>
						<Button variant="outlined" color="primary" onClick={() => goTo(views.experimental)}>
							{SettState.Experimental}
						</Button>
					</Grid>,
				);
				break;
			case SettState.Open:
				links.push(
					<Grid item xs={2}>
						<Button variant="outlined" color="primary" onClick={() => goTo(views.home)}>
							{SettState.Open}
						</Button>
					</Grid>,
				);
				break;
			case SettState.Guarded:
				links.push(
					<Grid item xs={2}>
						<Button variant="outlined" color="primary" onClick={() => goTo(views.guarded)}>
							{SettState.Guarded}
						</Button>
					</Grid>,
				);
				break;
		}
	});
	return links;
};

export default function NoVaults(props: { state: SettState; network: string }): JSX.Element {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { state, network } = props;
	const {
		router: { goTo },
	} = store;
	return (
		<div className={classes.messageContainer}>
			<img src={'/assets/icons/builder.png'} />
			<Typography
				className={classes.titleText}
				variant="h4"
			>{`There are currently no ${state} vaults on ${network}.`}</Typography>
			<Typography variant="h6">Check our other zones for more potential vaults</Typography>
			<Grid className={classes.linkContainer} container justify="center">
				{linkObjects(state, goTo)}
			</Grid>
		</div>
	);
}
