import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { ChartsCard } from './charts/ChartsCard';
import { Holdings } from './holdings/Holdings';
import { Sett } from '../../mobx/model/setts/sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';
import { NewVaultWarning } from './NewVaultWarning';
import { SettState } from '../../mobx/model/setts/sett-state';
import { ContractNamespace } from 'web3/config/contract-namespace';
import SpecsCard from './specs/SpecsCard';

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
			wallet: { connectedAddress },
		} = React.useContext(StoreContext);

		const classes = useStyles();
		const tokenBalance = user.getBalance(ContractNamespace.Token, badgerSett);
		const settBalance = user.getSettBalance(sett);

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
				<Grid container spacing={1} className={classes.cardsContainer}>
					<Grid item xs={12} md={4} lg={3}>
						<SpecsCard sett={sett} badgerSett={badgerSett} />
					</Grid>
					<Grid item xs={12} md={8} lg={9}>
						<ChartsCard sett={sett} />
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
