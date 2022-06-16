import { VaultDTO } from '@badger-dao/sdk';
import { Card, Grid, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import React, { MouseEvent, useContext } from 'react';

import routes from '../../config/routes';
import { useVaultInformation } from '../../hooks/useVaultInformation';
import CurrencyDisplay from '../common/CurrencyDisplay';
import VaultListItemTags from '../VaultListItemTags';
import VaultItemApr from './VaultItemApr';
import VaultLogo from './VaultLogo';

const useStyles = makeStyles((theme) => ({
	root: {
		borderBottom: `1px solid ${theme.palette.background.default}`,
		alignItems: 'center',
		marginBottom: theme.spacing(2),
		padding: '20px 42px',
		transition: '.2s background ease-out',
		cursor: 'pointer',
		'&:hover': {
			background: '#3a3a3a',
		},
	},
	enabledVault: {
		transition: '.2s background ease-out',
		cursor: 'pointer',
		'&:hover': {
			background: '#3a3a3a',
		},
	},
	itemText: {
		fontSize: 16,
	},
	tvl: {
		[theme.breakpoints.down('md')]: {
			display: 'none',
		},
	},
	iconBadgeContainer: {
		width: 110,
		alignSelf: 'stretch',
		justifyContent: 'flex-end',
		[theme.breakpoints.up('lg')]: {
			width: 106,
			margin: -4,
			'& > *': {
				padding: 2,
			},
		},
	},
	vaultName: {
		fontSize: 16,
	},
	tabletTvl: {
		whiteSpace: 'pre',
	},
	tagsContainer: {
		marginTop: 8,
	},
	tabletLogo: {
		flexDirection: 'row',
	},
}));

interface VaultListItemProps {
	vault: VaultDTO;
}

const VaultListItem = observer(({ vault }: VaultListItemProps): JSX.Element | null => {
	const classes = useStyles();
	const { router, vaults } = useContext(StoreContext);
	const currency = vaults.vaultsFilters.currency;
	const { vaultBoost, depositBalanceDisplay } = useVaultInformation(vault);
	const isTablet = useMediaQuery(useTheme().breakpoints.only('md'));

	const goToVaultDetail = async () => {
		await router.goTo(
			routes.vaultDetail,
			{ vaultName: vaults.getSlug(vault.vaultToken) },
			{ chain: router.queryParams?.chain },
		);
	};

	const handleStatusClick = (event: MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		vaults.openStatusInformationPanel();
	};

	const handleRewardsClick = (event: MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		vaults.openRewardsInformationPanel();
	};

	return (
		<Grid container direction="column" component={Card} className={classes.root} onClick={goToVaultDetail}>
			<Grid item container spacing={2}>
				{!isTablet && (
					<Grid item container xs="auto" className={classes.iconBadgeContainer}>
						<VaultLogo tokens={vault.tokens} />
					</Grid>
				)}
				<Grid item xs lg={4}>
					<Typography variant="subtitle1" className={classes.vaultName}>
						{vault.name}
					</Typography>
				</Grid>
				<Grid item xs container justifyContent="flex-end">
					<VaultItemApr vault={vault} boost={vaultBoost} />
				</Grid>
				<Grid item xs container justifyContent="flex-end">
					<CurrencyDisplay
						displayValue={depositBalanceDisplay}
						variant="body1"
						justifyContent="flex-start"
						TypographyProps={{ className: classes.itemText }}
					/>
				</Grid>
				<Grid item xs container justifyContent="flex-end">
					<CurrencyDisplay
						displayValue={inCurrency(new BigNumber(vault.value), currency, 0)}
						variant="body1"
						justifyContent="flex-start"
						TypographyProps={{ className: classes.itemText }}
					/>
				</Grid>
			</Grid>
			<Grid item container className={classes.tagsContainer} spacing={2} alignItems="center">
				<Grid item xs="auto" className={classes.iconBadgeContainer}>
					{isTablet && <VaultLogo tokens={vault.tokens} className={classes.tabletLogo} />}
				</Grid>
				<Grid item xs>
					<VaultListItemTags
						vault={vault}
						showLabels
						onStatusClick={handleStatusClick}
						onRewardsClick={handleRewardsClick}
					/>
				</Grid>
			</Grid>
		</Grid>
	);
});
export default VaultListItem;
