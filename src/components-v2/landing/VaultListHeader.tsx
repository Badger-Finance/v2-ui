import React, { useContext } from 'react';
import { Grid, IconButton, makeStyles, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { VaultSortOrder } from '../../mobx/model/ui/vaults-filters';
import VaultListFiltersWidget from '../common/VaultListFiltersWidget';

export const NAME_COLUMN_MAX_WIDTH = '40%';
export const INFORMATION_SECTION_MAX_WIDTH = '75%';

const useStyles = makeStyles((theme) => ({
	title: {
		display: 'flex',
		textTransform: 'uppercase',
	},
	sortIcon: {
		padding: theme.spacing(1),
	},
	sortInfoIcon: {
		marginLeft: 10,
	},
	nonSetSort: {
		display: 'none',
		opacity: 0.5,
	},
	nonSetSortMobile: {
		opacity: 0.5,
	},
	columnTitle: {
		'&:hover button:first-of-type': {
			display: 'block',
		},
	},
	nameColumn: {
		display: 'flex',
		[theme.breakpoints.up('lg')]: {
			flexGrow: 0,
			maxWidth: NAME_COLUMN_MAX_WIDTH,
			flexBasis: NAME_COLUMN_MAX_WIDTH,
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
	mobileColumn: {
		minHeight: 37,
	},
	filtersCount: {
		fontWeight: 700,
		color: theme.palette.primary.main,
		marginLeft: theme.spacing(1),
	},
}));

interface Props {
	title: string;
	helperText?: string;
}

const VaultListHeader = observer(({ title, helperText }: Props): JSX.Element => {
	const classes = useStyles();
	const { vaults } = useContext(StoreContext);
	const { sortOrder } = vaults.vaultsFilters;
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

	if (isMobile) {
		return (
			<Grid container justifyContent="space-between" className={classes.mobileContainer}>
				<Grid item xs={6} container alignItems="center" className={classes.mobileColumn}>
					<Typography className={classes.title} variant="body2" color="textSecondary" display="inline">
						{title}
					</Typography>
					{helperText && (
						<Tooltip title={helperText} placement="top" arrow color="primary">
							<img
								src="/assets/icons/vault-sort-info.svg"
								className={classes.sortInfoIcon}
								alt="List description"
							/>
						</Tooltip>
					)}
				</Grid>
				<Grid
					item
					xs={6}
					container
					justifyContent="flex-end"
					alignItems="center"
					className={classes.mobileColumn}
				>
					<Typography
						className={classes.title}
						variant="body2"
						color="textSecondary"
						onClick={handleSortByApr}
					>
						APR
					</Typography>
					<Tooltip
						title="An annual percentage rate (APR), is the yearly rate earned by staking in each vault."
						placement="top"
						arrow
						color="primary"
					>
						<img
							src="/assets/icons/vault-sort-info.svg"
							className={classes.sortInfoIcon}
							alt="What is APR?"
						/>
					</Tooltip>
					{sortOrder === VaultSortOrder.APR_DESC && (
						<IconButton className={classes.sortIcon} onClick={handleSortByApr}>
							<ArrowDownwardIcon aria-label="sort ascending by APR" color="primary" />
						</IconButton>
					)}
					{sortOrder === VaultSortOrder.APR_ASC && (
						<IconButton
							className={classes.sortIcon}
							onClick={handleSortByApr}
							aria-label="reset sort by APR"
						>
							<ArrowUpwardIcon color="primary" />
						</IconButton>
					)}
				</Grid>
			</Grid>
		);
	}

	// leave 3 grid spaces for the action buttons section which has no column name
	return (
		<>
			<Grid item container className={classes.root}>
				<Grid item container xs={12} md={9} lg alignItems="center" className={classes.titlesContainer}>
					<Grid item xs={12} md={6} lg className={clsx(classes.title, classes.nameColumn)}>
						<Typography className={classes.title} variant="body2" color="textSecondary">
							{title}
						</Typography>
						{helperText && (
							<Tooltip title={helperText} placement="top" arrow color="primary">
								<img
									src="/assets/icons/vault-sort-info.svg"
									className={classes.sortInfoIcon}
									alt="List description"
								/>
							</Tooltip>
						)}
					</Grid>
					<Grid
						item
						container
						xs={12}
						md
						alignItems="center"
						className={clsx(classes.title, classes.columnTitle)}
					>
						<Typography variant="body2" color="textSecondary">
							APR
						</Typography>
						<Tooltip
							title="An annual percentage rate (APR), is the yearly rate earned by staking in each vault."
							placement="top"
							arrow
							color="primary"
						>
							<img
								src="/assets/icons/vault-sort-info.svg"
								className={classes.sortInfoIcon}
								alt="What is APR?"
							/>
						</Tooltip>
						{sortOrder !== VaultSortOrder.APR_ASC && sortOrder !== VaultSortOrder.APR_DESC && (
							<IconButton
								className={clsx(classes.sortIcon, classes.nonSetSort)}
								onClick={handleSortByApr}
								aria-label="sort descending by APR"
							>
								<ArrowDownwardIcon color="primary" />
							</IconButton>
						)}
						{sortOrder === VaultSortOrder.APR_DESC && (
							<IconButton
								className={classes.sortIcon}
								onClick={handleSortByApr}
								aria-label="sort ascending by APR"
							>
								<ArrowDownwardIcon color="primary" />
							</IconButton>
						)}
						{sortOrder === VaultSortOrder.APR_ASC && (
							<IconButton
								className={classes.sortIcon}
								onClick={handleSortByApr}
								aria-label="reset sort by APR"
							>
								<ArrowUpwardIcon color="primary" />
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
						<Tooltip
							title="Total value locked (TVL) represents the dollar value of all the assets staked in each vault."
							placement="top"
							arrow
							color="primary"
						>
							<img
								src="/assets/icons/vault-sort-info.svg"
								className={classes.sortInfoIcon}
								alt="What is TVL?"
							/>
						</Tooltip>
						{sortOrder !== VaultSortOrder.TVL_ASC && sortOrder !== VaultSortOrder.TVL_DESC && (
							<IconButton
								className={clsx(classes.sortIcon, classes.nonSetSort)}
								onClick={handleSortByTvl}
								aria-label="sort descending by TVL"
							>
								<ArrowDownwardIcon color="primary" />
							</IconButton>
						)}
						{sortOrder === VaultSortOrder.TVL_DESC && (
							<IconButton
								className={classes.sortIcon}
								onClick={handleSortByTvl}
								aria-label="sort ascending by TVL"
							>
								<ArrowDownwardIcon color="primary" />
							</IconButton>
						)}
						{sortOrder === VaultSortOrder.TVL_ASC && (
							<IconButton
								className={classes.sortIcon}
								onClick={handleSortByTvl}
								aria-label="reset sort by TVL"
							>
								<ArrowUpwardIcon color="primary" />
							</IconButton>
						)}
					</Grid>
					<Grid
						item
						container
						xs={12}
						md
						alignItems="center"
						className={clsx(classes.title, classes.columnTitle)}
					>
						<Typography variant="body2" color="textSecondary">
							MY DEPOSITS
						</Typography>
						<Tooltip
							title="It represents the dollar value of all assets, you deposited in each vault."
							placement="top"
							arrow
							color="primary"
						>
							<img
								src="/assets/icons/vault-sort-info.svg"
								className={classes.sortInfoIcon}
								alt="What represent My Deposits?"
							/>
						</Tooltip>
						{sortOrder !== VaultSortOrder.BALANCE_ASC && sortOrder !== VaultSortOrder.BALANCE_DESC && (
							<IconButton
								className={clsx(classes.sortIcon, classes.nonSetSort)}
								onClick={handleSortByBalance}
								aria-label="sort descending by balance"
							>
								<ArrowDownwardIcon color="primary" />
							</IconButton>
						)}
						{sortOrder === VaultSortOrder.BALANCE_DESC && (
							<IconButton
								className={classes.sortIcon}
								onClick={handleSortByBalance}
								aria-label="sort ascending by balance"
							>
								<ArrowDownwardIcon color="primary" />
							</IconButton>
						)}
						{sortOrder === VaultSortOrder.BALANCE_ASC && (
							<IconButton
								className={classes.sortIcon}
								onClick={handleSortByBalance}
								aria-label="reset sort by balance"
							>
								<ArrowUpwardIcon color="primary" />
							</IconButton>
						)}
					</Grid>
				</Grid>
				<Grid item container md justifyContent="flex-end">
					<VaultListFiltersWidget />
				</Grid>
			</Grid>
		</>
	);
});

export default VaultListHeader;
