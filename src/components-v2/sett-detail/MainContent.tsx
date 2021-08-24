import React from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { SpecsCard } from './specs/SpecsCard';
import { ChartsCard } from './charts/ChartsCard';
import { Holdings } from './holdings/Holdings';
import { Sett } from '../../mobx/model/setts/sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';
import { NewVaultWarning } from './NewVaultWarning';
import { SettState } from '../../mobx/model/setts/sett-state';
import { ContractNamespace } from 'web3/config/contract-namespace';
import { defaultSettBalance } from './utils';

const useStyles = makeStyles((theme) => ({
	content: {
		margin: 'auto',
	},
	cardsContainer: {
		marginBottom: theme.spacing(2),
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
}));

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
}

export const MainContent = observer(
	({ badgerSett, sett }: Props): JSX.Element => {
		const {
			user,
			user: { accountDetails },
			wallet: { connectedAddress },
		} = React.useContext(StoreContext);

		const classes = useStyles();
		const tokenBalance = user.getBalance(ContractNamespace.Token, badgerSett);
		const currentSettBalance = user.getBalance(ContractNamespace.Sett, badgerSett);
		let settBalance = accountDetails?.balances.find((settBalance) => settBalance.id === sett.vaultToken);

		/**
		 * settBalance data is populated via events from TheGraph and it is possible for it to be behind / fail.
		 * As such, the app also has internally the state of user deposits. Should a settBalance not be available
		 * for a user - this is likely because they have *just* deposited and their deposit does not show in the
		 * graph yet.
		 *
		 * This override simulates a zero earnings settBalance and providers the proper currently deposited
		 * underlying token amount in the expected downstream object.
		 */
		if (!settBalance) {
			settBalance = defaultSettBalance(sett);
			settBalance.balance = currentSettBalance.balance.toNumber() * sett.ppfs;
		}

		return (
			<Grid container className={classes.content}>
				{connectedAddress && (
					<Grid container className={classes.holdingsContainer}>
						<Holdings
							sett={sett}
							badgerSett={badgerSett}
							tokenBalance={tokenBalance}
							settBalance={settBalance}
						/>
					</Grid>
				)}
				<Grid container>
					<Typography className={classes.settInfoTitle}>Sett Vault Info</Typography>
				</Grid>
				<Grid container spacing={1} className={classes.cardsContainer}>
					<Grid item xs={12} md={4} lg={3}>
						<SpecsCard sett={sett} badgerSett={badgerSett} />
					</Grid>
					<Grid item xs={12} md={8} lg={9}>
						<ChartsCard sett={sett} settBalance={settBalance} />
					</Grid>
				</Grid>
				{sett.state === SettState.Guarded && (
					<Grid container className={classes.guardedVault}>
						<NewVaultWarning />
					</Grid>
				)}
			</Grid>
		);
	},
);
