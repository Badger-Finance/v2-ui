import { Box, Grid, IconButton, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import React, { useContext } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { VaultSortOrder } from '../../mobx/model/ui/vaults-filters';

export const NAME_COLUMN_MAX_WIDTH = '45%';
export const APR_COLUMN_MAX_WIDTH = '16%';
export const INFORMATION_SECTION_MAX_WIDTH = '75%';

const useStyles = makeStyles((theme) => ({
	title: {
		textTransform: 'uppercase',
	},
	sortIcon: {
		padding: theme.spacing(1),
	},
	nonSetSort: {
		display: 'none',
		opacity: 0.5,
	},
	columnTitle: {
		'&:hover button:first-of-type': {
			display: 'block',
		},
	},
	nameColumn: {
		[theme.breakpoints.up('lg')]: {
			flexGrow: 0,
			maxWidth: NAME_COLUMN_MAX_WIDTH,
			flexBasis: NAME_COLUMN_MAX_WIDTH,
		},
	},
	aprColumn: {
		[theme.breakpoints.up('lg')]: {
			flexGrow: 0,
			maxWidth: APR_COLUMN_MAX_WIDTH,
			flexBasis: APR_COLUMN_MAX_WIDTH,
		},
	},
	tvlColumn: {
		[theme.breakpoints.down('md')]: {
			display: 'none',
		},
	},
	root: {
		minHeight: 48,
	},
	titlesContainer: {
		paddingLeft: theme.spacing(2),
		[theme.breakpoints.up('lg')]: {
			flexGrow: 0,
			maxWidth: INFORMATION_SECTION_MAX_WIDTH,
			flexBasis: INFORMATION_SECTION_MAX_WIDTH,
		},
	},
	mobileContainer: {
		paddingTop: theme.spacing(3),
		paddingBottom: theme.spacing(2),
	},
}));

interface TableHeaderProps {
	title: string;
}

const TableHeader = observer(({ title }: TableHeaderProps): JSX.Element => {
	const classes = useStyles();
	const { uiState } = useContext(StoreContext);
	const { sortOrder } = uiState.vaultsFilters;
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

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

		uiState.vaultsFilters = { ...uiState.vaultsFilters, sortOrder: toggledOrder };
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

		uiState.vaultsFilters = { ...uiState.vaultsFilters, sortOrder: toggledOrder };
	};

	if (isMobile) {
		return (
			<Grid container justifyContent="space-between" className={classes.mobileContainer}>
				<Typography className={classes.title} variant="body2" color="textSecondary" display="inline">
					{title}
				</Typography>
				<Box display="inline-block">
					<Typography className={classes.title} variant="body2" color="textSecondary">
						APR
						{sortOrder !== VaultSortOrder.APR_ASC && sortOrder !== VaultSortOrder.APR_DESC && (
							<IconButton className={classes.sortIcon} onClick={handleSortByApr}>
								<img src="/assets/icons/sort-down.svg" alt="sort descending by APR" />
							</IconButton>
						)}
						{sortOrder === VaultSortOrder.APR_DESC && (
							<IconButton className={classes.sortIcon} onClick={handleSortByApr}>
								<img src="/assets/icons/sort-down.svg" alt="sort ascending by APR" />
							</IconButton>
						)}
						{sortOrder === VaultSortOrder.APR_ASC && (
							<IconButton className={classes.sortIcon} onClick={handleSortByApr}>
								<img src="/assets/icons/sort-up.svg" alt="reset sort by APR" />
							</IconButton>
						)}
					</Typography>
				</Box>
			</Grid>
		);
	}

	// leave 3 grid spaces for the action buttons section which has no column name
	return (
		<Grid item container className={classes.root}>
			<Grid item container xs={12} md={9} lg alignItems="center" className={classes.titlesContainer}>
				<Grid item xs={12} md={7} lg className={clsx(classes.title, classes.nameColumn)}>
					<Typography className={classes.title} variant="body2" color="textSecondary">
						{title}
					</Typography>
				</Grid>
				<Grid
					item
					container
					xs={12}
					md
					alignItems="center"
					className={clsx(classes.title, classes.columnTitle, classes.aprColumn)}
				>
					<Typography variant="body2" color="textSecondary">
						APR
					</Typography>
					{sortOrder !== VaultSortOrder.APR_ASC && sortOrder !== VaultSortOrder.APR_DESC && (
						<IconButton className={clsx(classes.sortIcon, classes.nonSetSort)} onClick={handleSortByApr}>
							<img src="/assets/icons/sort-down.svg" alt="sort descending by APR" />
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.APR_DESC && (
						<IconButton className={classes.sortIcon} onClick={handleSortByApr}>
							<img src="/assets/icons/sort-down.svg" alt="sort ascending by APR" />
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.APR_ASC && (
						<IconButton className={classes.sortIcon} onClick={handleSortByApr}>
							<img src="/assets/icons/sort-up.svg" alt="reset sort by APR" />
						</IconButton>
					)}
				</Grid>
				<Grid
					item
					container
					xs={12}
					md
					alignItems="center"
					className={clsx(classes.title, classes.columnTitle, classes.tvlColumn)}
				>
					<Typography variant="body2" color="textSecondary">
						TVL
					</Typography>
					{sortOrder !== VaultSortOrder.TVL_ASC && sortOrder !== VaultSortOrder.TVL_DESC && (
						<IconButton className={clsx(classes.sortIcon, classes.nonSetSort)} onClick={handleSortByTvl}>
							<img src="/assets/icons/sort-down.svg" alt="sort descending by TVL" />
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.TVL_DESC && (
						<IconButton className={classes.sortIcon} onClick={handleSortByTvl}>
							<img src="/assets/icons/sort-down.svg" alt="sort ascending by TVL" />
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.TVL_ASC && (
						<IconButton className={classes.sortIcon} onClick={handleSortByTvl}>
							<img src="/assets/icons/sort-up.svg" alt="reset sort by TVL" />
						</IconButton>
					)}
				</Grid>
				<Grid item container xs={12} md alignItems="center" className={classes.title}>
					<Typography variant="body2" color="textSecondary">
						MY DEPOSITS
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
});

export default TableHeader;
