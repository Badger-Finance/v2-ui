import React, { useContext } from 'react';
import { Grid, makeStyles, Paper, useMediaQuery, useTheme } from '@material-ui/core';
import OnlyDepositsControl from './OnlyDepositsControl';
import MobileFiltersButton from './MobileFiltersButton';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import VaultSearchInputsRow from './VaultSearchInputsRow';
import PortfolioDustControl from './PortfolioDustControl';
import BoostedVaultsControl from './BoostedVaultsControl';
import VaultsAprControl from './VaultsAprControl';
import VaultsCurrencyControl from './VaultsCurrencyControl';
import { Currency } from '../../config/enums/currency.enum';
import VaultFiltersDialogV2 from './VaultFiltersDialog';

const useStyles = makeStyles((theme) => ({
	firstRow: {
		marginBottom: 21,
	},
	checkbox: {
		marginRight: 20,
	},
	apr: {
		marginRight: 20,
	},
	paper: {
		width: '100%',
		padding: '20px 42px',
		marginBottom: '15px',
		[theme.breakpoints.down('sm')]: {
			padding: '21px 36px',
			marginBottom: 0,
		},
	},
}));

const VaultsSearchControls = () => {
	const {
		vaults: { vaultsFilters, setVaultsFilter, networkHasBoostVaults },
	} = useContext(StoreContext);
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const classes = useStyles();

	if (isMobile) {
		return (
			<Paper className={classes.paper}>
				<Grid container>
					<Grid item xs>
						<OnlyDepositsControl
							checked={vaultsFilters.onlyDeposits}
							onChange={(checked) => setVaultsFilter('onlyDeposits', checked)}
						/>
					</Grid>
					<Grid item container xs justifyContent="flex-end">
						<MobileFiltersButton />
					</Grid>
				</Grid>
				<VaultFiltersDialogV2 />
			</Paper>
		);
	}

	return (
		<Paper className={classes.paper}>
			<Grid container justifyContent="space-between" alignItems="center" className={classes.firstRow}>
				<div>
					<OnlyDepositsControl
						className={classes.checkbox}
						checked={vaultsFilters.onlyDeposits}
						onChange={(checked) => setVaultsFilter('onlyDeposits', checked)}
					/>
					<PortfolioDustControl
						className={classes.checkbox}
						checked={vaultsFilters.hidePortfolioDust}
						onChange={(checked) => setVaultsFilter('hidePortfolioDust', checked)}
					/>
					{networkHasBoostVaults && (
						<BoostedVaultsControl
							checked={vaultsFilters.onlyBoostedVaults}
							onChange={(checked) => setVaultsFilter('onlyBoostedVaults', checked)}
						/>
					)}
				</div>
				<div>
					<VaultsAprControl
						className={classes.apr}
						showAPR={vaultsFilters.showAPR}
						onShowAPRChange={(checked) => setVaultsFilter('showAPR', checked)}
					/>
					<VaultsCurrencyControl
						currency={vaultsFilters.currency ?? Currency.USD}
						onCurrencyChange={(change) => setVaultsFilter('currency', change)}
					/>
				</div>
			</Grid>
			<VaultSearchInputsRow />
			<VaultFiltersDialogV2 />
		</Paper>
	);
};

export default observer(VaultsSearchControls);
