import React, { useContext, useEffect, useState } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
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
		vaults: { vaultsFiltersV2, setVaultsFilter },
	} = useContext(StoreContext);
	const classes = useStyles();
	const [search, setSearch] = useState(vaultsFiltersV2.search);

	const handleSearch = () => {
		setVaultsFilter('search', search);
	};

	useEffect(() => {
		setSearch(vaultsFiltersV2.search);
	}, [vaultsFiltersV2.search]);

	return (
		<Grid container className={classes.root}>
			<Grid item xs>
				<VaultStatusSelector
					status={vaultsFiltersV2.status}
					onChange={(status) => setVaultsFilter('status', status)}
				/>
			</Grid>
			<Grid item xs>
				<VaultPlatformSelector
					platform={vaultsFiltersV2.protocol}
					onChange={(platform) => setVaultsFilter('protocol', platform)}
				/>
			</Grid>
			<Grid item xs>
				<VaultsRewardsSelector
					reward={vaultsFiltersV2.behavior}
					onChange={(behavior) => setVaultsFilter('behavior', behavior)}
				/>
			</Grid>
			<Grid item xs md lg={6}>
				<VaultSearchBar search={search} onChange={(change) => setSearch(change)} onSearch={handleSearch} />
			</Grid>
		</Grid>
	);
};

export default observer(VaultSearchInputsRow);
