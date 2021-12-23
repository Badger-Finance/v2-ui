import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Performance, scalePerformance } from '../../../mobx/model/rewards/performance';
import ApyDisplayBadge, { ComparisonMode } from './ApyComparisonBadge';
import { formatWithoutExtraZeros } from '../../../mobx/utils/helpers';
import { ApyComparisonModeSelector } from './ApyComparisonModeSelector';
import { Vault } from '@badger-dao/sdk';

const reduceSourcePerformance = (prev: Performance, current: Performance) => {
	const {
		oneDay: prevOneDay = 0,
		threeDay: prevThreeDay = 0,
		sevenDay: prevSevenDay = 0,
		thirtyDay: prevThirtyDay = 0,
	} = prev;

	const {
		oneDay: currentOneDay = 0,
		threeDay: currentThreeDay = 0,
		sevenDay: currentSevenDay = 0,
		thirtyDay: currentThirtyDay = 0,
	} = current;

	return {
		oneDay: prevOneDay + currentOneDay,
		threeDay: prevThreeDay + currentThreeDay,
		sevenDay: prevSevenDay + currentSevenDay,
		thirtyDay: prevThirtyDay + currentThirtyDay,
	};
};

const getSourcesPerformanceSummary = (vault: Vault) => {
	const initialValue = { oneDay: 0, threeDay: 0, sevenDay: 0, thirtyDay: 0 };
	return vault.sources
		.map((source) => {
			// reduce sources to baseline - zero boost definitions
			const { boostable, minApr, apr, performance } = source;
			if (boostable) {
				const performanceScalar = minApr / apr;
				source.performance = scalePerformance(performance, performanceScalar);
			}
			return source;
		})
		.map((source) => source.performance)
		.reduce(reduceSourcePerformance, initialValue);
};

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
	},
	namesContainer: {
		marginLeft: theme.spacing(1),
	},
	settName: {
		display: 'inline',
		fontSize: 24,
	},
	vaultName: {
		fontSize: 14,
	},
	settLogo: {
		width: '100%',
		margin: 'auto',
	},
	logoContainer: {
		display: 'flex',
		width: 68,
		height: 68,
	},
}));

interface Props {
	vault: Vault;
}

export const Description = ({ vault }: Props): JSX.Element => {
	const [timeframe, setTimeframe] = React.useState<keyof Performance>('sevenDay');
	const classes = useStyles();
	const performanceSummary = getSourcesPerformanceSummary(vault);
	const performance = performanceSummary[timeframe] ?? 0;

	let performanceResultMode = ComparisonMode.neutral;
	if (performance > 0) {
		performanceResultMode = ComparisonMode.positive;
	} else if (performance < 0) {
		performanceResultMode = ComparisonMode.negative;
	}

	return (
		<div className={classes.root}>
			<Grid item className={classes.logoContainer}>
				<img
					className={classes.settLogo}
					src={`/assets/icons/${vault.vaultAsset.toLowerCase()}.png`}
					alt={`Badger ${vault.name} Vault Symbol`}
				/>
			</Grid>
			<Grid item container direction="column" justify="center" className={classes.namesContainer}>
				<Grid item container alignItems="center">
					<Grid item>
						<Typography className={classes.settName}>{vault.name}</Typography>
					</Grid>
					<Grid item>
						<Box display="flex" alignItems="center">
							<ApyDisplayBadge
								apyComparison={`${formatWithoutExtraZeros(Math.abs(performance), 2)}%`}
								mode={performanceResultMode}
							/>
						</Box>
					</Grid>
					<Grid item>
						<ApyComparisonModeSelector value={timeframe} onChange={setTimeframe} />
					</Grid>
				</Grid>
				<Grid item>
					<Typography className={classes.vaultName} color="textSecondary">
						{vault.asset}
					</Typography>
				</Grid>
			</Grid>
		</div>
	);
};
