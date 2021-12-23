import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import SpecsCard from './specs/SpecsCard';
import { ChartsCard } from './charts/ChartsCard';
import { Holdings } from './holdings/Holdings';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { BadgerVault } from '../../mobx/model/vaults/badger-vault';
import { NewVaultWarning } from './NewVaultWarning';
import { BalanceNamespace } from 'web3/config/namespaces';
import { Vault, VaultState } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	content: {
		margin: 'auto',
	},
	holdingsContainer: {
		marginBottom: theme.spacing(2),
	},
	guardedVault: {
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
	vault: Vault;
	badgerVault: BadgerVault;
}

export const MainContent = observer(
	({ badgerVault, vault }: Props): JSX.Element => {
		const { user, onboard } = React.useContext(StoreContext);

		const classes = useStyles();
		const tokenBalance = user.getBalance(BalanceNamespace.Token, badgerVault);
		const settBalance = user.getVaultBalance(vault);

		return (
			<Grid container className={classes.content}>
				{onboard.isActive() && (
					<Grid container className={classes.holdingsContainer}>
						<Holdings
							vault={vault}
							badgerVault={badgerVault}
							tokenBalance={tokenBalance}
							userData={settBalance}
						/>
					</Grid>
				)}
				<Grid container spacing={1}>
					<Grid item xs={12} md={4} lg={3}>
						<SpecsCard vault={vault} badgerVault={badgerVault} />
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
	},
);
