import { makeStyles } from '@material-ui/core';
import { Store } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Paper, Card, Typography, Grid, Box, Link } from '@material-ui/core';
import { LayoutContainer, PageHeaderContainer } from 'components-v2/common/Containers';
import PageHeader from 'components-v2/common/PageHeader';
import { allBonds, IBond } from './bonds.config';
import BondOffering from './BondOffering';
import BondModal from './BondModal';
import { reduceTimeSinceLastCycle } from 'mobx/reducers/statsReducers';
import { ONE_DAY_MS, ONE_HOUR_MS, ONE_MIN_MS } from 'config/constants';

const useStyles = makeStyles((theme) => ({
	bondContainer: {
		display: 'flex',
		justifyContent: 'center',
		marginTop: theme.spacing(2),
	},
	countdown: {
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(3),
		},
	},
}));

export const toCountDown = (time: number): string => {
	const timestamp = time * 1000;
	const difference = Math.abs(Date.now() - timestamp);
	let timeString = '';
	const oneMonthMs = ONE_DAY_MS * 30;
	const months = Math.floor(difference / oneMonthMs);
	if (months > 0) {
		timeString += `${months}mo`;
	}
	const differenceDays = difference - (months * (oneMonthMs));
	const days = Math.floor(differenceDays / ONE_DAY_MS);
	if (timeString.length > 0) {
		timeString += ' ';
	}
	timeString += `${days}d`;
	const differenceHours = differenceDays - (days * (ONE_DAY_MS));
	const hours = Math.floor(differenceHours / ONE_HOUR_MS);
	if (timeString.length > 0) {
		timeString += ' ';
	}
	timeString += `${hours}h`;
	const differenceMinutes = differenceHours - (hours * (ONE_HOUR_MS));
	const minutes = Math.floor(differenceMinutes / ONE_MIN_MS);
	if (timeString.length > 0) {
		timeString += ' ';
	}
	timeString += `${minutes}m`;
	return timeString;
};

const CitadelEarlyBonding = observer((): JSX.Element => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const [selectedBond, setSelectedBond] = useState<IBond | null>(null);
	const launchTimeDisplay = toCountDown(1644500000);

	return (
		<LayoutContainer>
			<Grid container justifyContent="center">
				<PageHeaderContainer item container xs={12}>
					<Grid item container>
						<Grid item xs={12} sm={10}>
							<PageHeader
								title="Citadel Early Bonding"
								subtitle={
									<Box display="flex" alignItems="center">
										<Typography variant="body2" color="textSecondary">
											Update this Citadel Tag Text @william!{' '}
											<Link
												color="primary"
												target="_blank"
												// TODO: Update this link
												href="https://badger.com/new-to-defi"
												rel="noreferrer"
											>
												Learn More
											</Link>
										</Typography>
									</Box>
								}
							/>
						</Grid>
						<Grid item xs={12} sm={2} className={classes.countdown}>
							<Box display="flex" flexDirection="column" alignItems="flex-start">
								<Typography variant="body2" color="textSecondary">
									STARTS IN
								</Typography>
								<Typography variant="h6" color="textPrimary">
									{launchTimeDisplay}
								</Typography>
							</Box>
						</Grid>
					</Grid>
				</PageHeaderContainer>
			</Grid>
			<BondModal bond={selectedBond} clear={() => setSelectedBond(null)} />
			<Grid container spacing={4}>
				{allBonds.map((bond) => {
					return (
						<Grid item key={bond.address} xs={12} sm={6} md={4}>
							<BondOffering bond={bond} select={setSelectedBond} />
						</Grid>
					);
				})}
			</Grid>
		</LayoutContainer>
	);
});

export default CitadelEarlyBonding;
