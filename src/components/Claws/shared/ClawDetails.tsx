/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';

interface Props {
	details: Record<string, string>;
}

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: '100%',
	},
	row: {
		marginTop: theme.spacing(1),
	},
	detail: {
		textAlign: 'end',
	},
	rightMargin: {
		marginRight: theme.spacing(2),
	},
	leftMargin: {
		marginLeft: theme.spacing(2),
	},
}));

export const ClawDetails: FC<Props> = ({ details }) => {
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			{Object.keys(details).map((key, _index) => (
				<Grid container className={classes.row} key={`${key}_${_index}`}>
					<Grid item xs className={[classes.detail, classes.rightMargin].join(' ')}>
						<Typography variant="body2" color="textSecondary">
							{key}
						</Typography>
					</Grid>
					<Grid item xs className={[classes.detail, classes.leftMargin].join(' ')}>
						<Typography variant="body2" color="textPrimary">
							{details[key]}
						</Typography>
					</Grid>
				</Grid>
			))}
		</Grid>
	);
};

export default ClawDetails;
