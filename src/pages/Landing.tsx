import { Grid, makeStyles, Button, useMediaQuery, useTheme, Typography } from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';
import { StoreContext } from '../mobx/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { PageHeaderContainer, LayoutContainer } from '../components-v2/common/Containers';
import { VaultState } from '@badger-dao/sdk';
import VaultListFiltersWidget from '../components-v2/common/VaultListFiltersWidget';
import CurrencyDisplay from '../components-v2/common/CurrencyDisplay';
import { inCurrency } from '../mobx/utils/helpers';
import { Skeleton } from '@material-ui/lab';
import { getFormattedNetworkName } from '../utils/componentHelpers';
import BigNumber from 'bignumber.js';
import VaultListDisplay from '../components-v2/landing/VaultListDisplay';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	marginTop: {
		marginTop: theme.spacing(3),
	},
	rewardContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
		marginLeft: 'auto',
		marginRight: 'auto',
		display: 'flex',
		flexDirection: 'column',
	},
	widgetContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		height: '2.2rem',
		marginBottom: theme.spacing(1),
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: theme.spacing(3),
		},
	},
	rewardText: {
		marginRight: theme.spacing(3),
		textAlign: 'left',
	},
	statPaper: {
		padding: theme.spacing(2),
	},
	rewardItem: {
		padding: 0,
		flexWrap: 'wrap',
	},
	walletContainer: {
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(1),
		},
	},
	pickerContainer: {
		display: 'flex',
		marginRight: theme.spacing(1),
		alignItems: 'flex-end',
		[theme.breakpoints.down('xs')]: {
			marginBottom: theme.spacing(2),
			marginTop: theme.spacing(-1),
		},
	},
	announcementButton: {
		marginTop: theme.spacing(1),
		pointerEvents: 'none',
	},
	linkButton: {
		marginTop: theme.spacing(3),
		marginRight: 'auto',
		marginLeft: 'auto',
	},
	delegationBanner: {
		marginTop: theme.spacing(3),
	},
	announcementContainer: {
		display: 'flex',
		justifyContent: 'center',
		marginBottom: theme.spacing(2),
	},
	loader: {
		display: 'inline-flex',
		marginLeft: 4,
	},
	deposits: {
		whiteSpace: 'pre-wrap',
	},
	badgerMobileOverview: {
		width: '100%',
		padding: '18px 0px',
		borderBottom: `1px solid ${theme.palette.divider}`,
	},
	badgerOverviewItem: {
		display: 'flex',
		alignItems: 'center',
		whiteSpace: 'pre-wrap',
	},
	badgerOverviewValueTitle: {
		marginRight: theme.spacing(1),
	},
	badgerOverviewValueText: {
		fontWeight: 700,
		fontSize: 14,
	},
	filterWidgetContainer: {
		textAlign: 'end',
	},
}));

interface LandingProps {
	title: string;
	subtitle?: string | React.ReactNode;
	state: VaultState;
}

const Landing = observer((props: LandingProps) => {
	const {
		onboard,
		user,
		prices,
		uiState: { currency },
		network: { network },
		vaults: { protocolSummary },
	} = useContext(StoreContext);

	const { title, subtitle, state } = props;
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const isTablet = useMediaQuery(useTheme().breakpoints.only('md'));

	const badgerToken = network.deploy.token.length > 0 ? network.deploy.token : undefined;
	const badgerPrice = badgerToken ? prices.getPrice(badgerToken) : undefined;
	const totalValueLocked = protocolSummary ? new BigNumber(protocolSummary.totalValue) : undefined;
	const portfolioValue = onboard.isActive() && user.initialized ? user.portfolioValue : new BigNumber(0);
	const valuePlaceholder = <Skeleton animation="wave" width={32} className={classes.loader} />;
	const chainName = getFormattedNetworkName(network);

	return (
		<>
			{isMobile && (
				<div className={classes.badgerMobileOverview}>
					<LayoutContainer>
						<Grid container alignItems="center" spacing={1}>
							<Grid item container xs={6} alignItems="center">
								<Typography
									variant="body2"
									className={classes.badgerOverviewValueTitle}
								>{`${chainName} TVL:`}</Typography>
								{totalValueLocked ? (
									<CurrencyDisplay
										displayValue={inCurrency(totalValueLocked, currency, 0)}
										variant="subtitle2"
										justifyContent="flex-start"
										TypographyProps={{ className: classes.badgerOverviewValueText }}
									/>
								) : (
									valuePlaceholder
								)}
							</Grid>
							<Grid item container xs={6} alignItems="center">
								<Typography variant="body2" className={classes.badgerOverviewValueText}>
									Badger Price:
								</Typography>
								{badgerPrice ? (
									<CurrencyDisplay
										displayValue={inCurrency(badgerPrice, currency)}
										variant="body2"
										justifyContent="flex-start"
										TypographyProps={{ className: classes.badgerOverviewValueText }}
									/>
								) : (
									valuePlaceholder
								)}
							</Grid>
						</Grid>
					</LayoutContainer>
				</div>
			)}
			<LayoutContainer>
				{/* Landing Metrics Cards */}
				<Grid container justifyContent="center">
					<PageHeaderContainer item container xs={12} alignItems="center">
						<Grid item xs={10} md={6}>
							<PageHeader title={title} subtitle={subtitle} />
						</Grid>
						{isTablet && (
							<Grid item container xs={2} md={6} alignItems="center" justifyContent="flex-end">
								<Typography
									variant="body2"
									className={clsx(classes.badgerOverviewValueText, classes.badgerOverviewValueTitle)}
								>
									My Assets:
								</Typography>
								<CurrencyDisplay
									displayValue={inCurrency(portfolioValue, currency)}
									variant="body2"
									justifyContent="flex-start"
									TypographyProps={{ className: classes.badgerOverviewValueText }}
								/>
							</Grid>
						)}
					</PageHeaderContainer>
				</Grid>

				{isMobile && (
					<Grid container>
						<Grid item container xs={10} alignItems="center">
							<Typography
								variant="body2"
								className={clsx(classes.badgerOverviewValueText, classes.badgerOverviewValueTitle)}
							>
								My Assets:
							</Typography>
							<CurrencyDisplay
								displayValue={inCurrency(portfolioValue, currency)}
								variant="body2"
								justifyContent="flex-start"
								TypographyProps={{ className: classes.badgerOverviewValueText }}
							/>
						</Grid>
						<Grid item container xs={2} justifyContent="flex-end" className={classes.filterWidgetContainer}>
							<VaultListFiltersWidget />
						</Grid>
					</Grid>
				)}

				{state === VaultState.Guarded && (
					<div className={classes.announcementContainer}>
						<Button className={classes.announcementButton} size="small" variant="outlined" color="primary">
							Note: New Vaults may take up to 2 weeks from launch to reach full efficiency.
						</Button>
					</div>
				)}

				<VaultListDisplay state={state} />
			</LayoutContainer>
		</>
	);
});

export default Landing;
