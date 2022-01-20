import React, { useContext } from 'react';
import { Grid, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import VaultFiltersDialog from '../landing/VaultFiltersDialog';

const useStyles = makeStyles((theme) => ({
	paperSm: {
		maxWidth: 275,
	},
	title: {
		padding: theme.spacing(3, 3, 0, 3),
	},
	content: {
		padding: theme.spacing(2, 3, 3, 3),
	},
	closeButton: {
		position: 'absolute',
		right: 8,
		top: 18,
	},
	selectedOption: {
		border: `2px solid ${theme.palette.primary.main}`,
		color: theme.palette.primary.main,
	},
	nonSelectedOption: {
		border: '2px solid #848484',
	},
	option: {
		borderRadius: 8,
	},
	confirmButton: {
		marginTop: theme.spacing(4),
	},
	currencySection: {
		marginTop: theme.spacing(2),
	},
	filterButton: {
		padding: 4,
	},
	filtersCount: {
		fontWeight: 700,
		color: theme.palette.primary.main,
		cursor: 'pointer',
	},
}));

const VaultListFiltersWidget = (): JSX.Element => {
	const { vaults } = useContext(StoreContext);
	const classes = useStyles();

	const toggleShowDialog = () => {
		vaults.showVaultFilters = !vaults.showVaultFilters;
	};

	return (
		<>
			<Grid container justifyContent="flex-end" alignItems="center">
				<IconButton
					className={classes.filterButton}
					aria-label="Open Vaults Filters"
					onClick={toggleShowDialog}
				>
					<img src="/assets/icons/vault-filters.svg" alt="vault filters" />
				</IconButton>
				{!!vaults.vaultsFiltersCount && (
					<Typography className={classes.filtersCount}>({vaults.vaultsFiltersCount})</Typography>
				)}
			</Grid>
			<VaultFiltersDialog open={vaults.showVaultFilters} onClose={toggleShowDialog} />
		</>
	);
};

export default observer(VaultListFiltersWidget);
