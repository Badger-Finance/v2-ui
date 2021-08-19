import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SettActionButton } from '../../common/SettActionButtons';

const useStyles = makeStyles((theme) => ({
	root: {
		position: 'sticky',
		bottom: 0,
		backgroundColor: '#181818',
		padding: theme.spacing(2),
		width: '100%',
		zIndex: 999,
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
}));

interface Props {
	isWithdrawDisabled?: boolean;
	isDepositDisabled?: boolean;
	onWithdrawClick: () => void;
	onDepositClick: () => void;
}

export const MobileStickyActionButtons = ({
	isDepositDisabled = false,
	isWithdrawDisabled = false,
	onWithdrawClick,
	onDepositClick,
}: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Grid container spacing={1}>
				<Grid item xs>
					<SettActionButton
						color="primary"
						variant="outlined"
						fullWidth
						disabled={isWithdrawDisabled}
						onClick={onWithdrawClick}
					>
						Withdraw
					</SettActionButton>
				</Grid>
				<Grid item xs>
					<SettActionButton
						color="primary"
						variant={isDepositDisabled ? 'outlined' : 'contained'}
						disabled={isDepositDisabled}
						fullWidth
						onClick={onDepositClick}
					>
						Deposit
					</SettActionButton>
				</Grid>
			</Grid>
		</div>
	);
};
