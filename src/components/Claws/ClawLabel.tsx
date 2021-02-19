/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';

interface Props {
	firstLabel: string;
	secondLabel: string;
	thirdLabel: string;
}

const useStyles = makeStyles((theme) => ({
	availableText: {
		[theme.breakpoints.up('sm')]: {
			justifyContent: 'flex-end',
		},
	},
}));

export const ClawLabel: FC<Props> = ({ firstLabel, secondLabel, thirdLabel }) => {
	const classes = useStyles();

	return (
		<Grid container spacing={1}>
			<Grid item xs={12} sm={6}>
				<Typography variant="body2" color="textSecondary">
					{firstLabel}
				</Typography>
			</Grid>
			<Grid item xs={12} sm={6}>
				<Grid container className={classes.availableText} spacing={1}>
					<Grid item>
						<Typography variant="body2" color="textSecondary">
							{secondLabel}
						</Typography>
					</Grid>
					<Grid item>
						<Typography variant="body2" color="textPrimary">
							{thirdLabel}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default ClawLabel;
