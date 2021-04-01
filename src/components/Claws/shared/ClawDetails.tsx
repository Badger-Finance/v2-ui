/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';

interface Props {
	details: Record<string, string | undefined>;
}

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: '100%',
	},
	row: {
		marginTop: theme.spacing(1),
	},
	detail: {
		wordBreak: 'break-word',
		textAlign: 'end',
	},
	placeholder: {
		wordBreak: 'break-word',
		textAlign: 'center',
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
					<Grid item xs={6} className={[classes.detail].join(' ')}>
						<Typography variant="body2" color="textSecondary">
							{key}
						</Typography>
					</Grid>
					<Grid item xs={6} className={[details[key] ? classes.detail : classes.placeholder].join(' ')}>
						<Typography variant="body2" color="textPrimary">
							{details[key] || '-'}
						</Typography>
					</Grid>
				</Grid>
			))}
		</Grid>
	);
};

export default ClawDetails;
