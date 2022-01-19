import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useState, useContext } from 'react';
import { Typography, Grid, Box, Link } from '@material-ui/core';
import { LayoutContainer, PageHeaderContainer } from 'components-v2/common/Containers';
import PageHeader from 'components-v2/common/PageHeader';
import { Beneficiary, SaleStatus, CitadelBond } from './bonds.config';
import BondOffering from './BondOffering';
import BondModal from './BondModal';
import { ONE_DAY_MS } from 'config/constants';
import { FLAGS } from 'config/environment';
import { BigNumber, ethers } from 'ethers';
import clsx from 'clsx';
import { StoreContext } from 'mobx/store-context';

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
	headerText: {
		letterSpacing: '0.25px',
		fontWeight: 'normal',
	},
	countdownText: {
		fontWeight: 'bold',
	},
}));

const SALE_OPEN_EPOCH = 1642515600;
const SALE_OPEN_MS = SALE_OPEN_EPOCH * 1000;

// Adapted from
// https://stackoverflow.com/questions/36098913/convert-seconds-to-days-hours-minutes-and-seconds
function toCountDown(seconds: number): string {
	let countdown = seconds;
	if (seconds < 0) {
		countdown = 0;
	}
	var d = Math.floor(countdown / (3600 * 24));
	var h = Math.floor((countdown % (3600 * 24)) / 3600);
	var m = Math.floor((countdown % 3600) / 60);
	var dDisplay = d + 'd ';
	var mDisplay = m + 'm';
	var hDisplay = h + 'h ';
	return dDisplay + hDisplay + mDisplay;
}

const SALE_DURATION = ONE_DAY_MS / 1000;

const CitadelEarlyBonding = observer((): JSX.Element | null => {
	const { bondStore } = useContext(StoreContext);
	const classes = useStyles();
	const isSmallScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
	const [selectedBond, setSelectedBond] = useState<CitadelBond | null>(null);

	const launchTime = (SALE_OPEN_MS - Date.now()) / 1000;
	const saleStatus =
		launchTime > 0 ? SaleStatus.Pending : launchTime + SALE_DURATION > 0 ? SaleStatus.Open : SaleStatus.Closed;
	const saleStarted = saleStatus !== SaleStatus.Pending;
	const saleText = saleStatus === SaleStatus.Pending ? 'Event Starts in' : 'Time Remaining';
	const countdownDisplay = toCountDown(saleStarted ? launchTime + SALE_DURATION : launchTime);

	const totalSold = bondStore.bonds.reduce((total, bond) => total.add(bond.totalSold), BigNumber.from('0'));
	const totalSoldDisplay = Number(ethers.utils.formatUnits(totalSold, 9)).toFixed();

	if (!FLAGS.CITADEL_SALE) {
		return null;
	}

	return (
		<LayoutContainer>
			<Grid container justifyContent="center">
				<PageHeaderContainer item container xs={12}>
					<Grid item container>
						<Grid item xs={12} sm={8}>
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
						<Grid
							container
							item
							xs={12}
							sm={4}
							alignItems="flex-end"
							direction={isSmallScreen ? 'row-reverse' : 'row'}
						>
							{saleStarted && (
								<Grid item xs={6}>
									<Box
										display="flex"
										flexDirection="column"
										alignItems={isSmallScreen ? 'flex-start' : 'flex-end'}
									>
										<Typography variant="body2" color="textSecondary">
											Total Sales
										</Typography>
										<Typography variant="body2" color="textPrimary" className={classes.headerText}>
											{totalSoldDisplay} CTDL
										</Typography>
									</Box>
								</Grid>
							)}
							<Grid item xs={saleStarted ? 6 : 12}>
								<Box
									display="flex"
									flexDirection="column"
									alignItems={isSmallScreen ? 'flex-start' : 'flex-end'}
									className={classes.countdown}
								>
									<Typography variant="body2" color="textSecondary">
										{saleText}
									</Typography>
									<Typography
										variant="body1"
										color="textPrimary"
										className={clsx(classes.headerText, classes.countdownText)}
									>
										{countdownDisplay}
									</Typography>
								</Box>
							</Grid>
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
				{bondStore.bonds.map((bond) => {
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
