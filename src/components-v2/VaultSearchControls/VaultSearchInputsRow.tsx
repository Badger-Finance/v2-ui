import React, { useContext } from 'react';
import { Button, Grid, makeStyles } from '@material-ui/core';
import VaultStatusSelector from './VaultStatusSelector';
import VaultPlatformSelector from './VaultsPlatformSelector';
import VaultsRewardsSelector from './VaultsRewardsSelector';
import VaultSearchBar from './VaultSearchBar';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles({
	root: {
		width: 'calc(100% + 20px)',
		margin: -10,
		'& > *': {
			padding: 10,
		},
	},
});

const VaultSearchInputsRow = (): JSX.Element => {
	const {
		vaults: { vaultsFilters, setVaultsFilter, clearFilters },
	} = useContext(StoreContext);
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			<Grid item xs>
				<VaultStatusSelector
					statuses={vaultsFilters.statuses}
					onChange={(statuses) => setVaultsFilter('statuses', statuses)}
				/>
			</Grid>
			<Grid item xs>
				<VaultPlatformSelector
					platforms={vaultsFilters.protocols}
					onChange={(platforms) => setVaultsFilter('protocols', platforms)}
				/>
			</Grid>
			<Grid item xs>
				<VaultsRewardsSelector
					rewards={vaultsFilters.behaviors}
					onChange={(behaviors) => setVaultsFilter('behaviors', behaviors)}
				/>
			</Grid>
			<Grid item xs md lg={6}>
				<VaultSearchBar
					search={vaultsFilters.search}
					onChange={(change) => setVaultsFilter('search', change)}
				/>
			</Grid>
			<Grid item xs="auto">
				<Button fullWidth color="primary" variant="text" onClick={clearFilters}>
					CLEAR ALL
				</Button>
			</Grid>
		</Grid>
	);
};

export default observer(VaultSearchInputsRow);
