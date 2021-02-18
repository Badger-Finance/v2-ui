/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';

interface Props {
	details: Record<string, string>[];
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
}));

export const ClawDetails: FC<Props> = ({ details }) => {
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			{details.map((detail, index) => (
				<Grid container className={classes.row} key={`${detail}_${index}`}>
					{Object.keys(detail).map((key, _index) => (
						<React.Fragment key={`${key}_${_index}`}>
							<Grid item xs className={classes.detail}>
								<Typography variant="body2" color="textSecondary">
									{key}
								</Typography>
							</Grid>
							<Grid item xs className={classes.detail}>
								<Typography variant="body2" color="textPrimary">
									{detail[key]}
								</Typography>
							</Grid>
						</React.Fragment>
					))}
				</Grid>
			))}
		</Grid>
	);
};

export default ClawDetails;
