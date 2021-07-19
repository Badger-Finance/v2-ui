import { makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';

const useStyles = makeStyles(() => ({
	suggestionContainer: {
		marginLeft: 'auto',
	},
	amountToNextRank: {
		fontSize: 12,
	},
}));

const BoostSuggestion = observer((): JSX.Element | null => {
	const { user } = useContext(StoreContext);
	const { accountDetails } = user;
	const classes = useStyles();

	if (!accountDetails || accountDetails.nonNativeBalance > 0) {
		return null;
	}

	return (
		<div className={classes.suggestionContainer}>
			<Typography className={classes.amountToNextRank} color="textSecondary">
				Add Non Native assets to be able to improve your boost
			</Typography>
		</div>
	);
});

export default BoostSuggestion;
