import { Grid, IconButton, makeStyles, Typography } from '@material-ui/core';
import React, { useContext } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { VaultSortOrder } from '../../mobx/model/ui/vaults-filters';

export const NAME_COLUMN_MAX_WIDTH = '45%';
export const APR_COLUMN_MAX_WIDTH = '19%';
export const INFORMATION_SECTION_MAX_WIDTH = '72.5%';

const useStyles = makeStyles((theme) => ({
	hiddenMobile: {
		display: 'flex',
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	amount: {
		marginLeft: 5,
	},
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
		[theme.breakpoints.up('md')]: {
			flexGrow: 0,
			maxWidth: NAME_COLUMN_MAX_WIDTH,
			flexBasis: NAME_COLUMN_MAX_WIDTH,
		},
	},
	aprColumn: {
		[theme.breakpoints.up('md')]: {
			flexGrow: 0,
			maxWidth: APR_COLUMN_MAX_WIDTH,
			flexBasis: APR_COLUMN_MAX_WIDTH,
		},
	},
	root: {
		minHeight: 48,
	},
	titlesContainer: {
		paddingLeft: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			flexGrow: 0,
			maxWidth: INFORMATION_SECTION_MAX_WIDTH,
			flexBasis: INFORMATION_SECTION_MAX_WIDTH,
		},
	},
}));

interface TableHeaderProps {
	title: string;
}

const TableHeader = observer(({ title }: TableHeaderProps): JSX.Element => {
	const classes = useStyles();
	const { uiState } = useContext(StoreContext);
	const { sortOrder } = uiState.vaultsFilters;

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

	// leave 3 grid spaces for the action buttons section which has no column name
	return (
		<Grid item container className={classes.root}>
			<Grid item container xs={12} md alignItems="center" className={classes.titlesContainer}>
				<Grid item xs={12} md className={clsx(classes.title, classes.nameColumn, classes.hiddenMobile)}>
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
					className={clsx(classes.hiddenMobile, classes.title, classes.columnTitle, classes.aprColumn)}
				>
					<Typography variant="body2" color="textSecondary">
						APR
					</Typography>
					{sortOrder !== VaultSortOrder.APR_ASC && sortOrder !== VaultSortOrder.APR_DESC && (
						<IconButton className={clsx(classes.sortIcon, classes.nonSetSort)} onClick={handleSortByApr}>
							<img src="/assets/icons/sort-down.svg" alt="sort desc by apr" />
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.APR_DESC && (
						<IconButton className={classes.sortIcon} onClick={handleSortByApr}>
							<img src="/assets/icons/sort-down.svg" alt="sort asc by apr" />
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.APR_ASC && (
						<IconButton className={classes.sortIcon} onClick={handleSortByApr}>
							<img src="/assets/icons/sort-up.svg" alt="reset sort by apr" />
						</IconButton>
					)}
				</Grid>
				<Grid
					item
					container
					xs={12}
					md
					alignItems="center"
					className={clsx(classes.hiddenMobile, classes.title, classes.columnTitle)}
				>
					<Typography variant="body2" color="textSecondary">
						TVL
					</Typography>
					{sortOrder !== VaultSortOrder.TVL_ASC && sortOrder !== VaultSortOrder.TVL_DESC && (
						<IconButton className={clsx(classes.sortIcon, classes.nonSetSort)} onClick={handleSortByTvl}>
							<img src="/assets/icons/sort-down.svg" alt="sort desc by tvl" />
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.TVL_DESC && (
						<IconButton className={classes.sortIcon} onClick={handleSortByTvl}>
							<img src="/assets/icons/sort-down.svg" alt="sort asc by tvl" />
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.TVL_ASC && (
						<IconButton className={classes.sortIcon} onClick={handleSortByTvl}>
							<img src="/assets/icons/sort-up.svg" alt="reset sort de by tvl" />
						</IconButton>
					)}
				</Grid>
				<Grid
					item
					container
					xs={12}
					md
					alignItems="center"
					className={clsx(classes.hiddenMobile, classes.title)}
				>
					<Typography variant="body2" color="textSecondary">
						MY DEPOSITS
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
});

export default TableHeader;
