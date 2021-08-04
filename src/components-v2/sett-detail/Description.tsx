import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import { Sett } from '../../mobx/model/setts/sett';
import { Performance } from '../../mobx/model/rewards/performance';
import clsx from 'clsx';
import { formatWithoutExtraZeros } from '../../mobx/utils/helpers';

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

const getSourcesPerformanceSummary = (sett: Sett) => {
	return sett.sources.map((source) => source.performance).reduce(reduceSourcePerformance);
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
		fontSize: 20,
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
		width: 50,
		height: 50,
	},
	apyBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		maxHeight: 24,
		fontSize: 12,
		borderRadius: 4,
		padding: 4,
		color: theme.palette.common.black,
		marginLeft: theme.spacing(1),
	},
	apyText: {
		marginLeft: 4,
	},
	increasedApy: {
		backgroundColor: '#74D189',
	},
	reducedApy: {
		backgroundColor: theme.palette.error.main,
	},
}));

interface Props {
	sett: Sett;
}

export const Description = ({ sett }: Props): JSX.Element => {
	const classes = useStyles();
	const nameHasSpaces = sett.name.split(' ').length > 1;
	const displayName = nameHasSpaces ? sett.name.split(' ').slice(1).join(' ') : sett.name;

	const { sevenDay = 0 } = getSourcesPerformanceSummary(sett);

	// TODO decide if we want to include multiple change criteria, i.e: difference las 24rs, difference las week
	const sevenDaysPerformanceComparison = sett.apr - sevenDay;
	const isPositiveDifference = sevenDaysPerformanceComparison > 0;
	const shouldShowDifferenceBadge = sevenDaysPerformanceComparison !== 0; // only show when there's actual change

	return (
		<div className={classes.root}>
			<Grid item className={classes.logoContainer}>
				<img
					className={classes.settLogo}
					src={`/assets/icons/${sett.asset.toLowerCase()}.png`}
					alt={`Badger ${sett.name} Vault Symbol`}
				/>
			</Grid>
			<Grid item className={classes.namesContainer}>
				<Box display="flex" alignItems="center">
					<Typography className={classes.settName}>{displayName}</Typography>
					{shouldShowDifferenceBadge && (
						<Typography
							className={clsx(
								classes.apyBadge,
								isPositiveDifference ? classes.increasedApy : classes.reducedApy,
							)}
						>
							{isPositiveDifference ? <TrendingUpIcon /> : <TrendingDownIcon />}
							<span className={classes.apyText}>
								{`${formatWithoutExtraZeros(Math.abs(sevenDaysPerformanceComparison), 2)}%`}
							</span>
						</Typography>
					)}
				</Box>
				<Typography className={classes.vaultName} color="textSecondary">
					{sett.asset}
				</Typography>
			</Grid>
		</div>
	);
};
