import React from 'react';
import { Grid, Link, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: 20,
	},
	harvestFrequency: {
		fontSize: 12,
		width: '100%',
	},
	infoLink: {
		fontSize: 10,
		width: '100%',
	},
	harvest: {
		padding: '4px 6px',
		borderRadius: 4,
		fontSize: 12,
		border: `1px solid ${theme.palette.divider}`,
	},
	harvestContainer: {
		textAlign: 'end',
	},
}));

export const Harvests = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			<Typography>Harvests</Typography>
			<StyledDivider />
			<Grid container alignItems="center">
				<Grid item container xs={7}>
					<Typography className={classes.harvestFrequency} color="textSecondary">
						Harvest Frequency
					</Typography>
					<Link className={classes.infoLink}>See Vault Harvest Stats</Link>
				</Grid>
				<Grid item xs className={classes.harvestContainer}>
					<Typography className={classes.harvest} display="inline">
						~24 Hours
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
};
