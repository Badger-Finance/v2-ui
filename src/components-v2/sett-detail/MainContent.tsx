import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { SpecsCard } from './specs/SpecsCard';
import { ChartsCard } from './charts/ChartsCard';
import { Holdings } from './holdings/Holdings';
import { Sett } from '../../mobx/model/setts/sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';
import { NewVaultWarning } from './NewVaultWarning';
import { SettState } from '../../mobx/model/setts/sett-state';

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
}));

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
}

export const MainContent = observer(
	({ sett, badgerSett }: Props): JSX.Element => {
		const store = React.useContext(StoreContext);
		const { accountDetails } = store.user;

		const classes = useStyles();
		const settBalance = accountDetails?.balances.find((settBalance) => settBalance.id === sett.vaultToken);

		return (
			<Grid container className={classes.content}>
				{settBalance && (
					<Grid container className={classes.holdingsContainer}>
						<Holdings sett={sett} settBalance={settBalance} />
					</Grid>
				)}
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
