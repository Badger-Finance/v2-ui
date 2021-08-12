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

interface Props {
	onWithdrawClick: () => void;
	onDepositClick: () => void;
}

export const MobileStickyActionButtons = ({ onWithdrawClick, onDepositClick }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Grid container spacing={1}>
				<Grid item xs>
					<Button color="primary" variant="outlined" fullWidth onClick={onWithdrawClick}>
						Withdraw
					</Button>
				</Grid>
				<Grid item xs>
					<Button color="primary" variant="contained" fullWidth onClick={onDepositClick}>
						Deposit
					</Button>
				</Grid>
			</Grid>
		</div>
	);
};
