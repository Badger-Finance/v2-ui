import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';
import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	makeStyles,
	Typography,
	useTheme,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import OnlyDepositsControl from './OnlyDepositsControl';
import PortfolioDustControl from './PortfolioDustControl';
import BoostedVaultsControl from './BoostedVaultsControl';
import VaultStatusSelector from './VaultStatusSelector';
import VaultsPlatformSelector from './VaultsPlatformSelector';
import VaultsRewardsSelector from './VaultsRewardsSelector';
import VaultSearchBar from './VaultSearchBar';
import VaultsAprControl from './VaultsAprControl';
import VaultsCurrencyControl from './VaultsCurrencyControl';
import { FLAGS } from '../../config/environment';

const useStyles = makeStyles(() => ({
	title: {
		padding: '17px 35px 0px 35px',
	},
	content: {
		padding: '0px 37px 20px 37px',
	},
	closeButton: {
		marginRight: -12,
	},
	select: {
		marginBottom: 20,
	},
	divider: {
		width: 'calc(100% + 74px)',
		margin: '20px 0px 20px -37px',
	},
	topDivider: {
		width: 'calc(100% + 74px)',
		margin: '13px 0px 20px -37px',
	},
	apr: {
		marginRight: 20,
	},
}));

const VaultFiltersDialogV2 = () => {
	const { vaults } = useContext(StoreContext);
	const classes = useStyles();
	const { vaultsFiltersV2, networkHasBoostVaults } = vaults;
	const closeDialogTransitionDuration = useTheme().transitions.duration.leavingScreen;
	const [onlyDeposits, setOnlyDeposits] = useState(vaultsFiltersV2.onlyDeposits);
	const [showAPR, setShowAPR] = useState(vaultsFiltersV2.showAPR);
	const [boostedVaults, setBoostedVaults] = useState(vaultsFiltersV2.onlyBoostedVaults);
	const [hideDust, setHideDust] = useState(vaultsFiltersV2.hidePortfolioDust);
	const [statuses, setStatuses] = useState(vaultsFiltersV2.statuses);
	const [platforms, setPlatforms] = useState(vaultsFiltersV2.protocols);
	const [rewards, setRewards] = useState(vaultsFiltersV2.behaviors);
	const [search, setSearch] = useState(vaultsFiltersV2.search);
	const [currency, setCurrency] = useState(vaultsFiltersV2.currency);

	const syncPersistedFiltersValues = useCallback(() => {
		setOnlyDeposits(vaultsFiltersV2.onlyDeposits);
		setShowAPR(vaultsFiltersV2.showAPR);
		setBoostedVaults(vaultsFiltersV2.onlyBoostedVaults);
		setHideDust(vaultsFiltersV2.hidePortfolioDust);
		setStatuses(vaultsFiltersV2.statuses);
		setPlatforms(vaultsFiltersV2.protocols);
		setRewards(vaultsFiltersV2.behaviors);
		setSearch(vaultsFiltersV2.search);
		setCurrency(vaultsFiltersV2.currency);
	}, [vaultsFiltersV2]);

	const handleClose = () => {
		vaults.showVaultFilters = false;
		setTimeout(syncPersistedFiltersValues, closeDialogTransitionDuration);
	};

	const handleSave = () => {
		vaults.vaultsFiltersV2 = {
			...vaults.vaultsFiltersV2,
			statuses: statuses,
			onlyDeposits,
			showAPR,
			currency,
			protocols: platforms,
			behaviors: rewards,
			search: search,
			onlyBoostedVaults: boostedVaults,
			hidePortfolioDust: hideDust,
		};
		handleClose();
	};

	const handleClearAll = () => {
		setOnlyDeposits(false);
		setShowAPR(false);
		setBoostedVaults(false);
		setHideDust(false);
		setCurrency(vaultsFiltersV2.currency);
		setStatuses(undefined);
		setPlatforms(undefined);
		setRewards(undefined);
		setSearch('');
	};

	useEffect(() => {
		syncPersistedFiltersValues();
	}, [vaultsFiltersV2, syncPersistedFiltersValues]);

	return (
		<Dialog open={FLAGS.VAULT_FILTERS_V2 && vaults.showVaultFilters} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle disableTypography className={classes.title}>
				<Grid container justifyContent="space-between" alignItems="center">
					<Typography variant="h5" display="inline">
						Filter & Search
					</Typography>
					<IconButton aria-label="close vault filters" className={classes.closeButton} onClick={handleClose}>
						<CloseIcon />
					</IconButton>
				</Grid>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<Divider className={classes.topDivider} />
				<Grid container direction="column">
					<Grid item>
						<OnlyDepositsControl checked={onlyDeposits} onChange={(check) => setOnlyDeposits(check)} />
					</Grid>
					<Grid item>
						<PortfolioDustControl checked={hideDust} onChange={(check) => setHideDust(check)} />
					</Grid>
					{networkHasBoostVaults && (
						<Grid item>
							<BoostedVaultsControl
								checked={boostedVaults}
								onChange={(check) => setBoostedVaults(check)}
							/>
						</Grid>
					)}
				</Grid>
				<Divider className={classes.divider} />
				<Grid container direction="column">
					<Grid item className={classes.select}>
						<VaultStatusSelector statuses={statuses} onChange={(status) => setStatuses(status)} />
					</Grid>
					<Grid item className={classes.select}>
						<VaultsPlatformSelector platforms={platforms} onChange={(platform) => setPlatforms(platform)} />
					</Grid>
					<Grid item className={classes.select}>
						<VaultsRewardsSelector rewards={rewards} onChange={(rewards) => setRewards(rewards)} />
					</Grid>
					<Grid item>
						<VaultSearchBar search={search} onChange={(change) => setSearch(change)} onSearch={() => {}} />
					</Grid>
				</Grid>
				<Divider className={classes.divider} />
				<Grid container>
					<Grid item className={classes.apr}>
						<VaultsAprControl showAPR={showAPR} onShowAPRChange={(checked) => setShowAPR(checked)} />
					</Grid>
					<Grid item>
						<VaultsCurrencyControl
							currency={currency}
							onCurrencyChange={(currency) => setCurrency(currency)}
						/>
					</Grid>
				</Grid>
				<Divider className={classes.divider} />
				<Grid container spacing={2} justifyContent="flex-end">
					<Grid item>
						<Button variant="text" onClick={handleClearAll} color="primary">
							Clear All
						</Button>
					</Grid>
					<Grid item>
						<Button variant="contained" onClick={handleSave} color="primary">
							Apply Filters
						</Button>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default observer(VaultFiltersDialogV2);
