import React, { useContext, useEffect, useState } from 'react';
import { VaultDTO } from '@badger-dao/sdk';
import { Grid, Tab, Tabs } from '@material-ui/core';
import { CardContainer } from '../vault-detail/styled';
import { makeStyles } from '@material-ui/core/styles';
import InfluenceVaultPerfomanceTab from './InfluenceVaultPerfomanceTab';
import { ChartMode, VaultChartData, VaultChartTimeframe } from '../../mobx/model/vaults/vault-charts';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { ChartsHeader } from '../vault-detail/charts/ChartsHeader';
import ChartContent from '../vault-detail/charts/ChartContent';
import { VaultChart } from '../vault-detail/charts/VaultChart';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		maxWidth: '100%',
		flexGrow: 1,
	},
	header: {
		marginBottom: theme.spacing(3),
	},
	tabHeader: { background: 'rgba(0,0,0,.2)' },
	content: {
		flexGrow: 1,
		maxWidth: '100%',
		flexShrink: 0,
		padding: theme.spacing(2, 3),
	},
}));

interface Props {
	vault: VaultDTO;
}

type TabType = 'performance' | 'value';

const InfluenceVaultInfoPanel = ({ vault }: Props): JSX.Element => {
	const classes = useStyles();
	const { influenceVaultStore } = useContext(StoreContext);
	const influenceVault = influenceVaultStore.getInfluenceVault(vault.vaultToken);
	const [timeframe, setTimeframe] = useState(VaultChartTimeframe.Week);
	const [mode, setMode] = useState<TabType>('performance');
	const data = influenceVault?.vaultChartData?.map((d: VaultChartData) => ({
		x: d.timestamp.getTime(),
		y: d.balance,
	}));

	const handleTimeFrameChange = async (timeframe: VaultChartTimeframe) => {
		setTimeframe(timeframe);
		await influenceVaultStore.loadChartInfo(timeframe, vault);
	};

	const valueChart = (
		<Grid container direction="column" className={classes.content}>
			<Grid item container alignItems="center" justifyContent="space-between" className={classes.header}>
				<ChartsHeader
					mode={ChartMode.Balance}
					timeframe={timeframe}
					onTimeframeChange={handleTimeFrameChange}
				/>
			</Grid>
			<Grid item container xs justifyContent="center" alignItems="center">
				<ChartContent data={data ?? null} loading={influenceVault.processingChartData}>
					<VaultChart mode={ChartMode.Balance} timeframe={timeframe} data={data ?? null} />
				</ChartContent>
			</Grid>
		</Grid>
	);

	useEffect(() => {
		influenceVaultStore.init(vault.vaultToken);
	}, [influenceVaultStore, vault.vaultToken]);

	return (
		<CardContainer className={classes.root}>
			<Tabs
				variant="fullWidth"
				className={classes.tabHeader}
				textColor="primary"
				aria-label="chart view options"
				indicatorColor="primary"
				value={mode}
			>
				<Tab onClick={() => setMode('performance')} value="performance" label="Performance" />
				<Tab onClick={() => setMode('value')} value="value" label="Tokens Managed" />
			</Tabs>
			<Grid container direction="column" className={classes.content}>
				{mode === 'performance' && <InfluenceVaultPerfomanceTab vault={vault} />}
				{mode === 'value' && valueChart}
			</Grid>
		</CardContainer>
	);
};

export default observer(InfluenceVaultInfoPanel);
