import React from 'react';
import { Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	root: {
		position: 'sticky',
		bottom: 0,
		backgroundColor: '#181818',
		padding: theme.spacing(2),
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
}));

export const MobileStickyActionButtons = (): JSX.Element => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Grid container spacing={1}>
				<Grid item xs>
					<Button color="primary" variant="outlined" fullWidth>
						Withdraw
					</Button>
				</Grid>
				<Grid item xs>
					<Button color="primary" variant="contained" fullWidth>
						Deposit
					</Button>
				</Grid>
			</Grid>
		</div>
	);
};
