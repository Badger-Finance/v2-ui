import { makeStyles, Typography } from '@material-ui/core';
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';

const useStyles = makeStyles((theme) => ({
	boostText: {
		fontSize: '2.5rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.4rem',
		},
	},
	boostRankText: {
		color: theme.palette.text.secondary,
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
			<div>
				<Typography className={classes.boostText}>Boost: {accountDetails.boost.toFixed(2)}</Typography>
				<Typography className={classes.boostRankText}>Rank: {accountDetails.boostRank}</Typography>
			</div>
		) : (
			<> </>
		);
	},
);

export default BadgerBoost;
