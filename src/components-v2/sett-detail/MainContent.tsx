import React from 'react';
import { Grid, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { SpecsCard } from './specs/SpecsCard';
import { ChartsCard } from './charts/ChartsCard';
import { Holdings } from './holdings/Holdings';
import { Sett } from '../../mobx/model/setts/sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';

const useStyles = makeStyles((theme) => ({
	content: {
		margin: 'auto',
	},
	holdingsContainer: {
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
		const isMediumSizeScreen = useMediaQuery(useTheme().breakpoints.up('sm'));
		const settBalance = accountDetails?.balances.find((settBalance) => settBalance.id === sett.vaultToken);

		return (
			<Grid container className={classes.content}>
				{settBalance && (
					<Grid container className={classes.holdingsContainer}>
						<Holdings settBalance={settBalance} />
					</Grid>
				)}
				<Grid container spacing={1}>
					<Grid item xs={12} md={4} lg={3}>
						<SpecsCard sett={sett} badgerSett={badgerSett} />
					</Grid>
					{isMediumSizeScreen && (
						<Grid item xs={12} md={8} lg={9}>
							<ChartsCard sett={sett} />
						</Grid>
					)}
				</Grid>
			</Grid>
		);
	},
);
