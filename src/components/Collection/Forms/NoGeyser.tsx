import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';

interface Props {
	settName: string;
}

const useStyles = makeStyles((theme) => ({
	noGeyser: {
		paddingBottom: theme.spacing(2),
	},
	saiyanIcon: {
		height: '82px',
		width: '82px',
		margin: theme.spacing(2, 0),
	},
}));

export const NoGeyser = ({ settName }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container direction="column" justify="center" alignItems="center" className={classes.noGeyser}>
			<Typography>{`${settName} has no geyser.`}</Typography>
			<img
				src={'./assets/icons/badger_saiyan.png'}
				className={classes.saiyanIcon}
				alt="No geyser for this sett"
			/>
			<Typography>{'Rewards are earned from Sett deposits.'}</Typography>
		</Grid>
	);
};
