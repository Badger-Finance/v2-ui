import { Button, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { DelegationState } from '../../mobx/model/vaults/locked-cvx-delegation';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	badgerDelegatedTextContainer: {
		marginTop: theme.spacing(1),
	},
	badgerDelegatedText: {
		fontSize: 13,
		fontWeight: 400,
	},
}));

const DelegationButton = observer(() => {
	const { lockedCvxDelegation } = React.useContext(StoreContext);

	const classes = useStyles();
	const { delegationState, canUserDelegate } = lockedCvxDelegation;

	if (delegationState === DelegationState.BadgerDelegated) {
		return (
			<div>
				<Button size="small" variant="contained" color="primary" disabled>
					Delegate to Badger
				</Button>
				<div className={classes.badgerDelegatedTextContainer}>
					<Typography className={classes.badgerDelegatedText}>{"You've already delegated."}</Typography>
					<Typography className={classes.badgerDelegatedText}>{"Thanks, you're a top badger!"}</Typography>
				</div>
			</div>
		);
	}

	return (
		<Button
			size="small"
			variant="contained"
			color="primary"
			disabled={!canUserDelegate}
			onClick={() => lockedCvxDelegation.delegateLockedCVX()}
		>
			Delegate to Badger
		</Button>
	);
});

export default DelegationButton;
