import { makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Typography, Grid, Box, Link } from '@material-ui/core';
import { LayoutContainer, PageHeaderContainer } from 'components-v2/common/Containers';
import PageHeader from 'components-v2/common/PageHeader';
import { allBonds, IBond, Beneficiary, SaleStatus } from './bonds.config';
import BondOffering from './BondOffering';
import BondModal from './BondModal';
import { ONE_DAY_MS } from 'config/constants';

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
	countdownText: {
		fontWeight: 'bold',
		fontSize: '20px',
		lineHeight: '150%',
		letterSpacing: '0.25px',
	},
}));

const SALE_OPEN_EPOCH = 1644519600;
const SALE_OPEN_MS = SALE_OPEN_EPOCH * 1000;

// Adapted from
// https://stackoverflow.com/questions/36098913/convert-seconds-to-days-hours-minutes-and-seconds
function toCountDown(seconds: number): string {
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor((seconds % (3600 * 24)) / 3600);
	var m = Math.floor((seconds % 3600) / 60);
	var dDisplay = d + (d === 1 ? 'Day ' : 'Days ');
	var mDisplay = m > 0 ? m + (m === 1 ? 'Minute, ' : 'Minutes ') : '';
	var hDisplay = h > 0 ? h + (h === 1 ? 'Hour, ' : 'Hours ') : '';
	return dDisplay + hDisplay + mDisplay;
}

const SALE_DURATION = ONE_DAY_MS / 1000;

const CitadelEarlyBonding = observer((): JSX.Element => {
	const classes = useStyles();

	const [selectedBond, setSelectedBond] = useState<IBond | null>(null);

	const launchTime = (SALE_OPEN_MS - Date.now()) / 1000;
	const launchTimeDisplay = toCountDown(launchTime);
	const saleStatus =
		launchTime > 0 ? SaleStatus.Open : launchTime + SALE_DURATION > 0 ? SaleStatus.Open : SaleStatus.Closed;

	return (
		<LayoutContainer>
			<Grid container justifyContent="center">
				<PageHeaderContainer item container xs={12}>
					<Grid item container>
						<Grid item xs={12} sm={10} md={8}>
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
						<Grid item xs={12} sm={2} md={4} className={classes.countdown}>
							<Box display="flex" flexDirection="column" alignItems="flex-end">
								<Typography variant="body2" color="textSecondary">
									STARTS IN
								</Typography>
								<Typography variant="h6" color="textPrimary" className={classes.countdownText}>
									{launchTimeDisplay}
								</Typography>
							</Box>
						</Grid>
					</Grid>
				</PageHeaderContainer>
			</Grid>
			{/* TODO: Load user information, pass relevant qualifications */}
			<BondModal
				bond={selectedBond}
				clear={() => setSelectedBond(null)}
				qualifications={[
					Beneficiary.Convex,
					Beneficiary.Redacted,
					Beneficiary.Olympus,
					Beneficiary.Tokemak,
					Beneficiary.Frax,
					Beneficiary.Abracadabra,
				]}
			/>
			<Grid container spacing={4}>
				{allBonds.map((bond) => {
					return (
						<Grid item key={bond.address} xs={12} sm={6} md={4}>
							<BondOffering bond={bond} select={setSelectedBond} status={saleStatus} />
						</Grid>
					);
				})}
			</Grid>
		</LayoutContainer>
	);
});

export default CitadelEarlyBonding;
