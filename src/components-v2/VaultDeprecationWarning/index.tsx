import React, { useContext } from 'react';
import { Divider, Grid, Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CallMadeIcon from '@material-ui/icons/CallMade';
import { VaultDTO } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import { DEPRECATED_VAULTS_MIGRATIONS } from '../../config/deprecated-vaults-migrations.config';

const useStyles = makeStyles({
	root: {
		backgroundColor: '#FFB62B40',
		borderRadius: 8,
		padding: '10px 15px',
		cursor: 'pointer',
	},
	divider: {
		margin: '4px 0',
	},
	link: {
		display: 'flex',
		alignItems: 'center',
		marginLeft: 4,
	},
});

interface Props {
	vault: VaultDTO;
}

const VaultDeprecationWarning = ({ vault }: Props): JSX.Element => {
	const { vaults, network, router } = useContext(StoreContext);
	const classes = useStyles();
	const migratingVaultAddress = DEPRECATED_VAULTS_MIGRATIONS[network.network.id][vault.vaultToken];
	const migratingVault = migratingVaultAddress ? vaults.getVault(migratingVaultAddress) : null;

	const handleLinkClick = async () => {
		if (migratingVault) {
			await router.goTo(routes.vaultDetail, { vaultName: vaults.getSlug(migratingVault.vaultToken) });
		}
	};

	return (
		<Grid container direction="column" className={classes.root} onClick={handleLinkClick}>
			<Grid item container alignItems="center">
				<Typography variant="h6" display="inline">
					Vault Discontinued
				</Typography>
				{migratingVault && (
					<Link color="textPrimary" className={classes.link}>
						<CallMadeIcon />
					</Link>
				)}
			</Grid>
			<Divider className={classes.divider} />
			<Grid item>
				<Typography variant="body2">
					{migratingVault
						? `This vault has been discontinued and will no longer receive rewards. Move your funds to the
							${migratingVault.name} vault to continue earning with BadgerDAO.`
						: 'This vault has been discontinued and will no longer receive rewards.'}
				</Typography>
			</Grid>
		</Grid>
	);
};

export default observer(VaultDeprecationWarning);
