import React from 'react';
import { observer } from 'mobx-react-lite';
import { Divider, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BoostBadge } from './BoostBadge';
import { BoostSlider } from './BoostSlider';
import { BorderedText } from './Common';

const useStyles = makeStyles((theme) => ({
	rootContainer: {
		margin: 'auto',
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		maxWidth: 650,
		flexDirection: 'column',
	},
	header: {
		marginBottom: theme.spacing(2),
		textAlign: 'center',
	},
	content: {
		marginBottom: 24,
	},
	divider: {
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(2),
		},
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(5),
	},

	boostText: {
		fontSize: theme.spacing(4),
	},
	boostValue: {
		marginLeft: 12,
	},
}));

export const BoostCalculator = observer(() => {
	const classes = useStyles();

	return (
		<Grid container component={Paper} className={classes.rootContainer}>
			<Grid item container justify="center" spacing={3} className={classes.header}>
				<Grid item container justify="center" alignItems="center" xs={12}>
					<Typography className={classes.boostText}>Boost: </Typography>
					<BorderedText className={classes.boostValue} variant="h5">
						1.98
					</BorderedText>
				</Grid>
				<Grid item xs={12} style={{ padding: 0 }}>
					<Typography color="textSecondary">Rank: 501</Typography>
				</Grid>
			</Grid>
			<Divider className={classes.divider} />
			<Grid item xs={12} container justify="center" className={classes.content}>
				<Grid item container xs={3} alignItems="center" justify="center">
					<Grid item justify="center" style={{ textAlign: 'center' }}>
						<Typography variant="h6">Native: </Typography>
						<BorderedText variant="h6">$10,000</BorderedText>
					</Grid>
				</Grid>
				<Grid item container xs>
					<BoostSlider />
					<BoostBadge />
					<BoostSlider />
				</Grid>
				<Grid item container xs={3} alignItems="center" justify="center">
					<Grid item justify="center" style={{ textAlign: 'center' }}>
						<Typography variant="h6">Non Native: </Typography>
						<BorderedText variant="h6">$5,000</BorderedText>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
});
