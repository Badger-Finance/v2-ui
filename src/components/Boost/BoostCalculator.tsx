import React, { useState } from 'react';
import { Divider, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BorderedText } from './Common';
import { BoostCalculatorContainer } from './BoostCalculatorContent';

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

export const BoostCalculator: React.FC = () => {
	const classes = useStyles();
	const [native, setNative] = useState(0);
	const [nonNative, setNonNative] = useState(0);

	return (
		<Paper className={classes.rootContainer}>
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
			<BoostCalculatorContainer
				native={native}
				nonNative={nonNative}
				onNativeChange={setNative}
				onNonNativeChange={setNonNative}
			/>
		</Paper>
	);
};
