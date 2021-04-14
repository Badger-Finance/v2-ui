/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';

interface Props {
	name: string;
	balanceLabel?: string;
	balance?: string;
}

const useStyles = makeStyles((theme) => ({
	availableText: {
		[theme.breakpoints.up('sm')]: {
			justifyContent: 'flex-end',
		},
	},
	balanceText: {
		wordBreak: 'break-word',
	},
}));

export const TokenSelectorLabel: FC<Props> = ({ name, balanceLabel = '', balance = '' }): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container spacing={1}>
			<Grid item xs={12} sm={6}>
				<Typography variant="body2" color="textSecondary">
					{name}
				</Typography>
			</Grid>
			<Grid item xs={12} sm={6}>
				<Grid container className={classes.availableText} spacing={1}>
					<Grid item>
						<Typography variant="body2" color="textSecondary">
							{balanceLabel}
						</Typography>
					</Grid>
					<Grid item className={classes.balanceText}>
						<Typography variant="body2" color="textPrimary">
							{balance}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};
