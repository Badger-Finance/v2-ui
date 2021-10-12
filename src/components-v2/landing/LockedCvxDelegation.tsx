import React from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { NETWORK_IDS } from '../../config/constants';
import { DelegationState } from '../../mobx/model/setts/locked-cvx-delegation';
import { Button, makeStyles, Tooltip, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	badgerDelegated: {
		marginTop: theme.spacing(3),
		padding: theme.spacing(1),
		border: `1px solid ${theme.palette.primary.main}`,
		borderRadius: 8,
		fontSize: 13,
		textTransform: 'uppercase',
		fontWeight: 'bold',
	},
	linkButton: {
		marginTop: theme.spacing(3),
	},
}));

const LockedCvxDelegationAction = observer(() => {
	const {
		lockedCvxDelegation,
		network: { network },
	} = React.useContext(StoreContext);

	const classes = useStyles();

	const { delegationState } = lockedCvxDelegation;
	const canUserDelegateLockedCVX = delegationState === DelegationState.Eligible || DelegationState.Delegated;

	if (network.id !== NETWORK_IDS.ETH || !delegationState) {
		return null;
	}

	if (delegationState === DelegationState.Ineligible) {
		return (
			<Tooltip arrow placement="top" title="You don't have any locked CVX balance to delegate.">
				<span>
					<Button className={classes.linkButton} size="small" variant="contained" color="primary" disabled>
						Click here to delegate your locked CVX balance to Badger
					</Button>
				</span>
			</Tooltip>
		);
	}

	if (delegationState === DelegationState.BadgerDelegated) {
		return (
			<Typography
				color="primary"
				className={classes.badgerDelegated}
			>{`You delegated your locked CVX to Badger. Thanks, you're a top badger!`}</Typography>
		);
	}

	return (
		<Button
			className={classes.linkButton}
			size="small"
			variant="contained"
			color="primary"
			disabled={!canUserDelegateLockedCVX}
			onClick={() => lockedCvxDelegation.delegateLockedCVX()}
		>
			Click here to delegate your locked CVX balance to Badger
		</Button>
	);
});

export default LockedCvxDelegationAction;
