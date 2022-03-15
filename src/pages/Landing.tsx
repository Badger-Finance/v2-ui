import { Grid, makeStyles, useMediaQuery, useTheme, Typography } from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';
import { StoreContext } from '../mobx/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { PageHeaderContainer, LayoutContainer } from '../components-v2/common/Containers';
import VaultListFiltersWidget from '../components-v2/common/VaultListFiltersWidget';
import CurrencyDisplay from '../components-v2/common/CurrencyDisplay';
import { inCurrency } from '../mobx/utils/helpers';
import BigNumber from 'bignumber.js';
import VaultListDisplay from '../components-v2/landing/VaultListDisplay';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
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
}

const Landing = observer((props: LandingProps) => {
	const {
		onboard,
		user,
		uiState: { currency },
	} = useContext(StoreContext);

	const { title, subtitle } = props;
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const isTablet = useMediaQuery(useTheme().breakpoints.only('md'));
	const portfolioValue = onboard.isActive() && user.initialized ? user.portfolioValue : new BigNumber(0);
	const userAssets = (
		<>
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
		</>
	);

	return (
		<LayoutContainer>
			<Grid container justifyContent="center">
				<PageHeaderContainer item container xs={12} alignItems="center">
					<Grid item xs={10} md={6}>
						<PageHeader title={title} subtitle={subtitle} />
					</Grid>
					{isTablet && (
						<Grid item container alignItems="center" justifyContent="flex-end" md>
							{userAssets}
						</Grid>
					)}
				</PageHeaderContainer>
			</Grid>
			{isMobile && (
				<Grid container>
					<Grid item container xs={10} alignItems="center">
						{userAssets}
					</Grid>
					<Grid item container xs={2} className={classes.filterWidgetContainer}>
						<VaultListFiltersWidget />
					</Grid>
				</Grid>
			)}
			<VaultListDisplay />
		</LayoutContainer>
	);
});

export default Landing;
