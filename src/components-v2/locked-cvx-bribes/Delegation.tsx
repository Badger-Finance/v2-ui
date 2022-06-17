import { formatBalance } from '@badger-dao/sdk';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import DelegationButton from './DelegationButton';

const useStyles = makeStyles((theme) => ({
	icon: {
		width: 24,
		height: 24,
	},
	delegationAmount: {
		marginLeft: theme.spacing(1),
	},
	buttonContainer: {
		textAlign: 'end',
	},
	section: {
		textAlign: 'center',
	},
	delegationTitle: {
		fontWeight: 400,
		marginBottom: theme.spacing(1),
	},
}));

const Delegation = (): JSX.Element => {
	const {
		lockedCvxDelegation: { lockedCVXBalance },
	} = useContext(StoreContext);

	const classes = useStyles();
	const balancePlaceHolder = lockedCVXBalance === null ? 'N/A' : <Skeleton width={30} />;

	return (
		<Grid container alignItems="center" spacing={2}>
			<Grid item xs={12} md className={classes.section}>
				<Typography className={classes.delegationTitle}>Vote Locked Convex</Typography>
				<Grid container alignItems="center" justifyContent="center">
					<img className={classes.icon} src="assets/icons/bvecvx.png" alt="locked cvx balance" />
					<Typography display="inline" variant="h4" className={classes.delegationAmount}>
						{lockedCVXBalance ? formatBalance(lockedCVXBalance) : balancePlaceHolder}
					</Typography>
				</Grid>
			</Grid>
			<Grid item xs={12} md className={classes.section}>
				<DelegationButton />
			</Grid>
		</Grid>
	);
};

export default observer(Delegation);
