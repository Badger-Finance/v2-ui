import React, { useContext, useState } from 'react';
import { Grid, makeStyles, Tab, Tabs } from '@material-ui/core';
import { SettSpecs } from './specs/SettSpecs';
import { ChartsCard } from './charts/ChartsCard';
import { Sett } from '../../mobx/model/setts/sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';
import { NewVaultWarning } from './NewVaultWarning';
import { SettState } from '../../mobx/model/setts/sett-state';
import { CardContainer } from './styled';
import { SettDetailMode } from '../../mobx/model/setts/sett-detail';
import { SettModeTitles } from './utils';
import { ChartMode } from '../../mobx/model/setts/sett-charts';

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
	tabHeader: { background: 'rgba(0,0,0,.2)' },
	specs: {
		padding: theme.spacing(3),
		[theme.breakpoints.up('sm')]: {
			flexGrow: 0,
			maxWidth: '30%',
			flexBasis: '30%',
		},
	},
	charts: {
		padding: '24px 24px 24px 21px',
	},
}));

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
}

export const MainContent = observer(
	({ sett, badgerSett }: Props): JSX.Element => {
		const {
			settDetail,
			user: { accountDetails },
		} = useContext(StoreContext);

		const settBalance = accountDetails?.balances.find((settBalance) => settBalance.id === sett.vaultToken);
		const accountScalar = settBalance ? settBalance.value / sett.value : undefined;
		const shouldDefaultBeUserInfo = !!accountScalar && settDetail.shouldShowDirectAccountInformation;
		const defaultMode = shouldDefaultBeUserInfo ? SettDetailMode.userInformation : SettDetailMode.settInformation;
		const defaultChartMode = shouldDefaultBeUserInfo ? ChartMode.accountBalance : ChartMode.value;

		const classes = useStyles();
		const [mode, setMode] = useState(defaultMode);
		const [chartMode] = useState(defaultChartMode);

		return (
			<CardContainer>
				<Tabs
					variant="fullWidth"
					className={classes.tabHeader}
					textColor="primary"
					aria-label="chart view options"
					indicatorColor="primary"
					value={mode}
				>
					<Tab
						onClick={() => setMode(SettDetailMode.settInformation)}
						value={SettDetailMode.settInformation}
						label={SettModeTitles[SettDetailMode.settInformation]}
					/>
					{!!accountScalar && (
						<Tab
							onClick={() => setMode(SettDetailMode.userInformation)}
							value={SettDetailMode.userInformation}
							label={SettModeTitles[SettDetailMode.userInformation]}
						/>
					)}
				</Tabs>
				<Grid container>
					<Grid container>
						<Grid item xs={12} md={4} className={classes.specs}>
							<SettSpecs sett={sett} badgerSett={badgerSett} settBalance={settBalance} mode={mode} />
						</Grid>
						<Grid item xs={12} md={8} sm className={classes.charts}>
							<ChartsCard sett={sett} settBalance={settBalance} mode={chartMode} />
						</Grid>
					</Grid>
					{sett.state === SettState.Guarded && (
						<Grid container className={classes.guardedVault}>
							<NewVaultWarning />
						</Grid>
					)}
				</Grid>
			</CardContainer>
		);
	},
);
