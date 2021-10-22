import React, { useContext } from 'react';
import { Card, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Delegation from './Delegation';
import Earnings from './Earnings';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { NETWORK_IDS } from '../../config/constants';
import { DelegationState } from '../../mobx/model/setts/locked-cvx-delegation';

export const SAFE_BOX_ILLUSTRATION_BREAKPOINT = 1350;

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(4),
		backgroundColor: '#3A3A3A',
		position: 'relative',
	},
	delegationSection: {
		padding: theme.spacing(3),
	},
	title: {
		fontSize: 32,
		fontWeight: 'bolder',
		marginBottom: theme.spacing(2),
		position: 'relative',
		zIndex: 99,
	},
	descriptionSection: {
		marginBottom: theme.spacing(3),
	},
	safeLockImageLg: {
		position: 'absolute',
		bottom: 10,
		right: -10,
		height: 220,
		[theme.breakpoints.down(SAFE_BOX_ILLUSTRATION_BREAKPOINT)]: {
			display: 'none',
		},
	},
	safeLockImageSm: {
		margin: theme.spacing(2, 0, 4, 4),
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
	blueParticle: {
		width: 11.4,
		height: 11.4,
		backgroundColor: '#1682FE',
		position: 'absolute',
		top: 27,
		left: 0,
		[theme.breakpoints.down('xs')]: {
			display: 'none',
		},
	},
	greenParticle: {
		width: 11.4,
		height: 11.4,
		backgroundColor: '#60D8A4',
		position: 'absolute',
		top: 56.4,
		left: '50%',
		[theme.breakpoints.down('md')]: {
			display: 'none',
		},
	},
	diagonalParticles: {
		position: 'absolute',
		top: 29,
		left: '80%',
		[theme.breakpoints.down('xs')]: {
			display: 'none',
		},
	},
	descriptionText: {
		fontWeight: 400,
	},
}));

const Banner = (): JSX.Element | null => {
	const {
		lockedCvxDelegation: { delegationState },
		network: { network },
	} = useContext(StoreContext);

	const classes = useStyles();

	if (network.id !== NETWORK_IDS.ETH || !delegationState || delegationState === DelegationState.Ineligible) {
		return null;
	}

	return (
		<Card classes={{ root: classes.root }}>
			<Typography className={classes.title}>Delegate to Earn Rewards</Typography>
			<div className={classes.blueParticle} />
			<div className={classes.greenParticle} />
			<img src="assets/diagonal-particles.svg" className={classes.diagonalParticles} alt="diagonal-particles" />
			<Grid container spacing={3}>
				<Grid container item xs={12} sm>
					<img
						src="assets/locked-cvx-safebox-sm.png"
						className={classes.safeLockImageSm}
						alt="cvx locked safebox illustration"
					/>
					<div className={classes.descriptionSection}>
						<Typography variant="body1" className={classes.descriptionText}>
							Earn a portion of the Votium incentives by simply delegating your Vote Locked Convex to
							Badger today.
						</Typography>
					</div>
					<Grid container component={Card} className={classes.delegationSection}>
						<Delegation />
					</Grid>
				</Grid>
				<Grid item xs={12} sm>
					<Earnings />
				</Grid>
			</Grid>
			<img src="assets/locked-cvx-safebox-lg.png" className={classes.safeLockImageLg} alt="safe-lock-image" />
		</Card>
	);
};

export default observer(Banner);
