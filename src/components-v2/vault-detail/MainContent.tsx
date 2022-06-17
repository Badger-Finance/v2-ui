import { VaultDTO, VaultState } from '@badger-dao/sdk';
import { Grid, makeStyles } from '@material-ui/core';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { ChartsCard } from './charts/ChartsCard';
import { Holdings } from './holdings/Holdings';
import { NewVaultWarning } from './NewVaultWarning';
import SpecsCard from './specs/SpecsCard';
import { defaultVaultBalance } from './utils';

const useStyles = makeStyles((theme) => ({
	content: {
		margin: 'auto',
	},
	holdingsContainer: {
		marginBottom: theme.spacing(2),
	},
	guardedVault: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
	},
	settInfoTitle: {
		fontSize: 24,
		fontWeight: 500,
	},
	chartsContainer: {
		[theme.breakpoints.down('sm')]: {
			minHeight: 600,
		},
	},
}));

interface Props {
	vault: VaultDTO;
}

export const MainContent = observer(({ vault }: Props): JSX.Element => {
	const { user, wallet } = React.useContext(StoreContext);

	const classes = useStyles();
	const userData = user.accountDetails?.data[vault.vaultToken] ?? defaultVaultBalance(vault);

	return (
		<Grid container className={classes.content}>
			{wallet.isConnected && (
				<Grid container className={classes.holdingsContainer}>
					<Holdings vault={vault} userData={userData} />
				</Grid>
			)}
			<Grid container spacing={1}>
				<Grid item xs={12} md={4} lg={3}>
					<SpecsCard vault={vault} />
				</Grid>
				<Grid item xs={12} md={8} lg={9} className={classes.chartsContainer}>
					<ChartsCard vault={vault} />
				</Grid>
			</Grid>
			{vault.state === VaultState.Guarded && (
				<Grid container className={classes.guardedVault}>
					<NewVaultWarning />
				</Grid>
			)}
		</Grid>
	);
});
