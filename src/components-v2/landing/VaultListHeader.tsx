import { Grid, IconButton, makeStyles, Paper, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import clsx from 'clsx';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import { VaultSortOrder } from '../../mobx/model/ui/vaults-filters';

const useStyles = makeStyles((theme) => ({
	title: {
		display: 'flex',
		textTransform: 'capitalize',
	},
	sortIcon: {
		padding: 4,
	},
	sortInfoIcon: {
		marginLeft: 10,
		width: 20,
	},
	nonSetSort: {
		display: 'none',
		opacity: 0.5,
	},
	nonSetSortMobile: {
		opacity: 0.5,
	},
	columnTitle: {
		flexWrap: 'nowrap',
		'&:hover button:first-of-type': {
			display: 'block',
		},
	},
	tvlColumn: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	root: {
		minHeight: 48,
		padding: '10px 42px',
		margin: '15px 0px',
	},
	titlesContainer: {
		paddingLeft: theme.spacing(12),
	},
	spacingItem: {
		width: 106,
		margin: -4,
		[theme.breakpoints.down('md')]: {
			display: 'none',
		},
	},
	sortUp: {
		rotate: '180deg',
	},
}));

const VaultListHeader = observer((): JSX.Element => {
	const classes = useStyles();
	const { vaults } = useContext(StoreContext);
	const { sortOrder } = vaults.vaultsFilters;
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

	const handleSortByName = (): void => {
		let toggledOrder: VaultSortOrder | undefined;

		switch (sortOrder) {
			case VaultSortOrder.NAME_ASC:
				toggledOrder = undefined;
				break;
			case VaultSortOrder.NAME_DESC:
				toggledOrder = VaultSortOrder.NAME_ASC;
				break;
			default:
				toggledOrder = VaultSortOrder.NAME_DESC;
		}

		vaults.vaultsFilters = { ...vaults.vaultsFilters, sortOrder: toggledOrder };
	};

	const handleSortByApr = (): void => {
		let toggledOrder: VaultSortOrder | undefined;

		switch (sortOrder) {
			case VaultSortOrder.APR_ASC:
				toggledOrder = undefined;
				break;
			case VaultSortOrder.APR_DESC:
				toggledOrder = VaultSortOrder.APR_ASC;
				break;
			default:
				toggledOrder = VaultSortOrder.APR_DESC;
		}

		vaults.vaultsFilters = { ...vaults.vaultsFilters, sortOrder: toggledOrder };
	};

	const handleSortByTvl = (): void => {
		let toggledOrder: VaultSortOrder | undefined;

		switch (sortOrder) {
			case VaultSortOrder.TVL_ASC:
				toggledOrder = undefined;
				break;
			case VaultSortOrder.TVL_DESC:
				toggledOrder = VaultSortOrder.TVL_ASC;
				break;
			default:
				toggledOrder = VaultSortOrder.TVL_DESC;
		}

		vaults.vaultsFilters = { ...vaults.vaultsFilters, sortOrder: toggledOrder };
	};

	const handleSortByBalance = (): void => {
		let toggledOrder: VaultSortOrder | undefined;

		switch (sortOrder) {
			case VaultSortOrder.BALANCE_ASC:
				toggledOrder = undefined;
				break;
			case VaultSortOrder.BALANCE_DESC:
				toggledOrder = VaultSortOrder.BALANCE_ASC;
				break;
			default:
				toggledOrder = VaultSortOrder.BALANCE_DESC;
		}

		vaults.vaultsFilters = { ...vaults.vaultsFilters, sortOrder: toggledOrder };
	};

	return (
		<Grid item container className={classes.root} component={Paper}>
			<Grid container spacing={2}>
				<Grid item xs="auto" className={classes.spacingItem} />
				<Grid item xs lg={4} container alignItems="center" className={clsx(classes.title, classes.columnTitle)}>
					<Typography
						className={classes.title}
						variant="body2"
						color="textSecondary"
						onClick={isMobile ? handleSortByName : undefined}
					>
						Vault
					</Typography>
					{sortOrder !== VaultSortOrder.NAME_ASC && sortOrder !== VaultSortOrder.NAME_DESC && (
						<IconButton
							className={clsx(classes.sortIcon, classes.nonSetSort)}
							onClick={handleSortByName}
							aria-label="sort descending by name"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								alt="sort-icon"
								className={classes.sortIcon}
							/>
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.NAME_DESC && (
						<IconButton
							className={classes.sortIcon}
							onClick={handleSortByName}
							aria-label="sort ascending by name"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								alt="sort-icon"
								className={classes.sortIcon}
							/>
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.NAME_ASC && (
						<IconButton
							className={classes.sortIcon}
							onClick={handleSortByName}
							aria-label="reset sort by name"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								className={clsx(classes.sortUp, classes.sortIcon)}
								alt="sort-icon"
							/>
						</IconButton>
					)}
				</Grid>
				<Grid
					item
					container
					xs
					alignItems="center"
					justifyContent={isMobile ? undefined : 'flex-end'}
					className={clsx(classes.title, classes.columnTitle)}
				>
					<Typography variant="body2" color="textSecondary" onClick={isMobile ? handleSortByApr : undefined}>
						{vaults.vaultsFilters.showAPR ? 'APR' : 'APY'}
					</Typography>
					{sortOrder !== VaultSortOrder.APR_ASC && sortOrder !== VaultSortOrder.APR_DESC && (
						<IconButton
							className={clsx(classes.sortIcon, classes.nonSetSort)}
							onClick={handleSortByApr}
							aria-label="sort descending by APR"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								alt="sort-icon"
								className={classes.sortIcon}
							/>
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.APR_DESC && (
						<IconButton
							className={classes.sortIcon}
							onClick={handleSortByApr}
							aria-label="sort ascending by APR"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								alt="sort-icon"
								className={classes.sortIcon}
							/>
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.APR_ASC && (
						<IconButton
							className={classes.sortIcon}
							onClick={handleSortByApr}
							aria-label="reset sort by APR"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								className={clsx(classes.sortUp, classes.sortIcon)}
								alt="sort-icon"
							/>
						</IconButton>
					)}
				</Grid>
				<Grid
					item
					container
					xs
					alignItems="center"
					justifyContent={isMobile ? undefined : 'flex-end'}
					className={clsx(classes.title, classes.columnTitle)}
				>
					<Typography
						variant="body2"
						color="textSecondary"
						onClick={isMobile ? handleSortByBalance : undefined}
					>
						My Deposits
					</Typography>
					{sortOrder !== VaultSortOrder.BALANCE_ASC && sortOrder !== VaultSortOrder.BALANCE_DESC && (
						<IconButton
							className={clsx(classes.sortIcon, classes.nonSetSort)}
							onClick={handleSortByBalance}
							aria-label="sort descending by balance"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								alt="sort-icon"
								className={classes.sortIcon}
							/>
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.BALANCE_DESC && (
						<IconButton
							className={classes.sortIcon}
							onClick={handleSortByBalance}
							aria-label="sort ascending by balance"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								alt="sort-icon"
								className={classes.sortIcon}
							/>
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.BALANCE_ASC && (
						<IconButton
							className={classes.sortIcon}
							onClick={handleSortByBalance}
							aria-label="reset sort by balance"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								className={clsx(classes.sortUp, classes.sortIcon)}
								alt="sort-icon"
							/>
						</IconButton>
					)}
				</Grid>
				<Grid
					item
					container
					xs
					justifyContent={isMobile ? undefined : 'flex-end'}
					alignItems="center"
					className={clsx(classes.title, classes.columnTitle, classes.tvlColumn)}
				>
					<Typography variant="body2" color="textSecondary">
						TVL
					</Typography>
					{sortOrder !== VaultSortOrder.TVL_ASC && sortOrder !== VaultSortOrder.TVL_DESC && (
						<IconButton
							className={clsx(classes.sortIcon, classes.nonSetSort)}
							onClick={handleSortByTvl}
							aria-label="sort descending by TVL"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								alt="sort-icon"
								className={classes.sortIcon}
							/>
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.TVL_DESC && (
						<IconButton
							className={classes.sortIcon}
							onClick={handleSortByTvl}
							aria-label="sort ascending by TVL"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								alt="sort-icon"
								className={classes.sortIcon}
							/>
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.TVL_ASC && (
						<IconButton
							className={classes.sortIcon}
							onClick={handleSortByTvl}
							aria-label="reset sort by TVL"
						>
							<img
								src="/assets/icons/vaults-sort-icon.svg"
								className={clsx(classes.sortUp, classes.sortIcon)}
								alt="sort-icon"
							/>
						</IconButton>
					)}
				</Grid>
			</Grid>
		</Grid>
	);
});

export default VaultListHeader;
