import React, { useContext } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { ChartTimeframeControls } from './ChartTimeframeControls';
import { makeStyles } from '@material-ui/core/styles';
import { ChartModeTitles } from '../utils';
import { ChartMode, VaultChartTimeframe } from '../../../mobx/model/vaults/vault-charts';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';

const useStyles = makeStyles((theme) => ({
	titleText: {
		[theme.breakpoints.down('xs')]: {
			textAlign: 'center',
		},
	},
	buttonGroupContainer: {
		textAlign: 'end',
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(1),
			textAlign: 'center',
		},
	},
}));

interface Props {
	mode: ChartMode;
	timeframe: VaultChartTimeframe;
	onTimeframeChange: (timeframe: VaultChartTimeframe) => void;
}

export const ChartsHeader = observer(({ mode, timeframe, onTimeframeChange }: Props): JSX.Element => {
	const {
		vaults: { vaultsFilters },
	} = useContext(StoreContext);

	const classes = useStyles();

	let description;
	switch (mode) {
		case ChartMode.AccountBalance:
			description = 'Deposited assets';
			break;
		case ChartMode.Ratio:
			description = 'bToken to deposit token ratio';
			break;
		case ChartMode.Value:
			description = 'Total assets under management';
			break;
		default:
			const boostMode = vaultsFilters.showAPR ? 'APR' : 'APY';
			description = `Vault Boost ${boostMode} breakdown`;
	}

	return (
		<Grid container alignItems="center" justifyContent="space-between">
			<Grid container item xs={12} sm={6} direction="column" className={classes.titleText}>
				<Typography variant="h6">{ChartModeTitles[mode]}</Typography>
				<Typography variant="body2" color="textSecondary">
					{description}
				</Typography>
			</Grid>
			{mode !== ChartMode.BoostMultiplier && (
				<Grid item xs={12} sm={6} className={classes.buttonGroupContainer}>
					<ChartTimeframeControls mode={mode} value={timeframe} onChange={onTimeframeChange} />
				</Grid>
			)}
		</Grid>
	);
});
