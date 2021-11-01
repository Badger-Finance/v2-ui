import React from 'react';
import { TimelockEvent } from '../../mobx/model/governance-timelock/timelock-event';
import { Grid, Typography, List, ListItem, makeStyles, Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
	},
	title: {
		marginTop: theme.spacing(6),
		marginBottom: theme.spacing(2),
	},
	hiddenMobile: {
		display: 'flex',
		alignItems: 'flex-end',
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	list: {
		width: '100%',
		borderRadius: theme.shape.borderRadius,
		overflow: 'hidden',
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1],
		marginBottom: theme.spacing(2),
	},
	listItem: {
		padding: 0,
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2),
		'&:last-child div': {
			borderBottom: 0,
		},
	},
	mobileLabel: {
		textAlign: 'right',
		paddingRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
	},
	tooltipWrap: {
		cursor: 'help',
		borderBottom: '1px dotted',
		fontFamily: 'monospace',
	},
	name: {
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
}));

export interface EventTableProps {
	events?: TimelockEvent[];
}

const EventsTable = ({ events }: EventTableProps): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			<Typography variant="h4" className={classes.title}>
				Recent Timelock Activity
			</Typography>
			<Grid item container xs={12} className={classes.root}>
				<Grid item container xs={12} sm={3}>
					<Typography variant="body2" color="textSecondary">
						Block Number
					</Typography>
				</Grid>
				<Grid item xs={12} sm className={classes.hiddenMobile}>
					<Typography variant="body2" color="textSecondary">
						Event
					</Typography>
				</Grid>
				<Grid item xs={12} sm className={classes.hiddenMobile}>
					<Typography variant="body2" color="textSecondary">
						Action
					</Typography>
				</Grid>
			</Grid>
			<List className={classes.list}>
				{events &&
					events.map((event, i) => (
						<ListItem className={classes.listItem} key={'event-' + i}>
							<Grid container className={classes.root}>
								<Grid container item xs={12}>
									<Grid item xs={12} sm={3} className={classes.name} container>
										{event.blockNumber}
									</Grid>
									<Grid item className={classes.mobileLabel} xs={6} md>
										<Typography variant="body2" color="textSecondary">
											Event
										</Typography>
									</Grid>
									<Grid item xs={6} md>
										{event.event}
									</Grid>
									<Grid item className={classes.mobileLabel} xs={6} md>
										<Typography variant="body2" color={'textSecondary'}>
											Action
										</Typography>
									</Grid>
									<Grid item xs={6} md>
										{event.functionName}
										<span>(</span>
										{event.parameterTypes.length &&
											event.parameterTypes.map((param, ind) => (
												<span key={'param-' + ind}>
													<Tooltip
														className={classes.tooltipWrap}
														title={
															event.decodedParameters
																? (Object.values(event.decodedParameters)[
																		ind
																  ] as string)
																: 'Could not decode'
														}
													>
														<span>{param}</span>
													</Tooltip>
													{event.parameterTypes.length - 1 > ind && ', '}
												</span>
											))}
										<span>)</span>
									</Grid>
								</Grid>
							</Grid>
						</ListItem>
					))}
			</List>
		</>
	);
};

export default EventsTable;
