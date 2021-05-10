import { makeStyles, Typography } from '@material-ui/core';
import React, { useContext } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';

const useStyles = makeStyles((theme) => ({
	icon: {
		marginLeft: theme.spacing(4),
		marginRight: theme.spacing(4),
		marginBottom: theme.spacing(4),
		[theme.breakpoints.down('sm')]: {
			marginLeft: theme.spacing(2),
			marginRight: theme.spacing(2),
			marginBottom: theme.spacing(2),
		},
	},
	boostIcon: {
		height: 55,
		width: 55,
		[theme.breakpoints.down('sm')]: {
			height: 38,
			width: 38,
		},
	},
	headIcon: {
		height: 48,
		width: 48,
		[theme.breakpoints.down('sm')]: {
			height: 30,
			width: 30,
		},
	},
	boostContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: theme.spacing(3),
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
	boostInfo: {
		flexDirection: 'column',
	},
	boostText: {
		fontSize: '2.5rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.4rem',
		},
	},
	boostRankText: {
		fontSize: '1.3rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '0.8rem',
		},
	},
}));

const BadgerBoost = observer(
	(): JSX.Element => {
		const classes = useStyles();
		const store = useContext(StoreContext);
		const {
			user: { accountDetails },
		} = store;

		return accountDetails ? (
			<div className={classes.boostContainer}>
				<img className={clsx(classes.icon, classes.headIcon)} src="./assets/icons/badger_head.svg" />
				<div className={clsx(classes.boostInfo, classes.boostContainer)}>
					<Typography className={classes.boostText}>Boost: {accountDetails.boost.toFixed(2)}</Typography>
					<Typography className={classes.boostRankText}>Rank: {accountDetails.boostRank}</Typography>
				</div>
				<img className={clsx(classes.icon, classes.boostIcon)} src="./assets/icons/badger_saiyan.png" />
			</div>
		) : (
			<> </>
		);
	},
);

export default BadgerBoost;
