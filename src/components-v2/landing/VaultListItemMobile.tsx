import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Grid, makeStyles, Typography } from '@material-ui/core';
import { VaultDTO } from '@badger-dao/sdk';
import VaultItemApr from './VaultItemApr';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { useVaultInformation } from '../../hooks/useVaultInformation';
import routes from '../../config/routes';
import { StoreContext } from '../../mobx/store-context';
import VaultListItemTags from '../VaultListItemTags';

const useStyles = makeStyles(() => ({
	root: {
		padding: '16px 20px',
		marginBottom: 10,
	},
	info: {
		margin: '26px 0px',
	},
}));

interface Props {
	vault: VaultDTO;
}

const VaultListItemMobile = ({ vault }: Props): JSX.Element => {
	const classes = useStyles();
	const { router, vaults } = useContext(StoreContext);
	const vaultInformation = useVaultInformation(vault);

	const goToVaultDetail = async () => {
		await router.goTo(routes.settDetails, { settName: vaults.getSlug(vault.vaultToken) });
	};

	const { vaultBoost, depositBalanceDisplay } = vaultInformation;

	return (
		<Grid container direction="column" component={Card} onClick={goToVaultDetail} className={classes.root}>
			<Grid item container>
				<Typography variant="subtitle1">{vault.name}</Typography>
			</Grid>
			<Grid item container className={classes.info}>
				<Grid item xs container direction="column">
					<Typography>{vaults.vaultsFilters.showAPR ? 'APR' : 'APY'}</Typography>
					<VaultItemApr vault={vault} boost={vaultBoost} />
				</Grid>
				<Grid item xs container direction="column">
					<Typography>My Deposits</Typography>
					<CurrencyDisplay displayValue={depositBalanceDisplay} variant="body1" justifyContent="flex-start" />
				</Grid>
			</Grid>
			<Grid item>
				<VaultListItemTags vault={vault} spacing={1} />
			</Grid>
		</Grid>
	);
};

export default observer(VaultListItemMobile);
