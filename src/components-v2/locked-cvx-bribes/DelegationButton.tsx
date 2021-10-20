import React from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { DelegationState } from '../../mobx/model/setts/locked-cvx-delegation';
import { Button, makeStyles, Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	badgerDelegated: {
		'&.Mui-disabled': {
			opacity: 0.5,
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.common.black,
		},
	},
	spinner: {
		marginLeft: theme.spacing(1),
		color: 'white',
	},
}));

const DelegationButton = observer(() => {
	const { lockedCvxDelegation } = React.useContext(StoreContext);

	const classes = useStyles();
	const { delegationState } = lockedCvxDelegation;

	const canUserDelegateLockedCVX =
		delegationState === DelegationState.Eligible || delegationState === DelegationState.Delegated;

	if (delegationState === DelegationState.Ineligible) {
		return (
			<Tooltip arrow placement="top" title="You don't have any locked CVX balance to delegate.">
				<span>
					<Button size="small" variant="contained" color="primary" disabled>
						Delegate to Badger
					</Button>
				</span>
			</Tooltip>
		);
	}

	if (delegationState === DelegationState.BadgerDelegated) {
		return (
			<Button
				size="small"
				variant="contained"
				color="primary"
				classes={{ contained: classes.badgerDelegated }}
				disabled
			>
				Already Delegated
			</Button>
		);
	}

	return (
		<Button
			size="small"
			variant="contained"
			color="primary"
			disabled={!canUserDelegateLockedCVX}
			onClick={() => lockedCvxDelegation.delegateLockedCVX()}
		>
			Delegate to Badger
		</Button>
	);
});

export default DelegationButton;
