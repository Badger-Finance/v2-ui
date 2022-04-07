import React, { useContext } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { Breadcrumb } from './Breadcrumb';
import { Description } from './description/Description';
import { VaultDTO, VaultState } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { DEPRECATED_VAULT_WARNINGS_INFO } from '../../config/deprecated-vaults-warnings.config';
import VaultDeprecationWarning from '../VaultDeprecationWarning';

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: theme.spacing(4),
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
	content: {
		margin: 'auto',
		[theme.breakpoints.up('md')]: {
			marginTop: theme.spacing(2),
		},
	},
	descriptionSection: {
		justifyContent: 'space-between',
	},
	breadcrumbContainer: {
		marginBottom: theme.spacing(1),
	},
	holdingsContainer: {
		marginBottom: theme.spacing(2),
	},
}));

interface Props {
	vault: VaultDTO;
}

export const TopContent = observer(({ vault }: Props): JSX.Element => {
	const { network } = useContext(StoreContext);
	const classes = useStyles();
	const deprecatedWarnings = DEPRECATED_VAULT_WARNINGS_INFO[network.network.id][vault.vaultToken];

	return (
		<Grid container className={classes.root}>
			<Grid item container xs>
				<Grid container className={classes.breadcrumbContainer}>
					<Breadcrumb vault={vault} />
				</Grid>
				<Grid container className={classes.descriptionSection}>
					<Description vault={vault} />
				</Grid>
			</Grid>
			{vault.state === VaultState.Deprecated && (
				<Grid item container xs>
					<VaultDeprecationWarning
						migratingVault={deprecatedWarnings?.migratingVault}
						link={deprecatedWarnings?.link}
					/>
				</Grid>
			)}
		</Grid>
	);
});
